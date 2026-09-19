import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CONTRACTS, WIZARD_STEPS, getContractSteps, PROVINCES, PROVINCE_OPTIONS } from "@/lib/contractsData";
import { calendarSteps } from '@/lib/contractDateFields';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import WizardProgress from "@/components/wizard/WizardProgress";
import WizardForm from "@/components/wizard/WizardForm";
import ContractPreview from "@/components/wizard/ContractPreview";
import GeneratingLoader from "@/components/wizard/GeneratingLoader";
import { prepareContractPayload, restoreContractFormData } from "@/lib/contractPayload";
import MissingFieldsWarning from "@/components/wizard/MissingFieldsWarning";
import { computeMontoTotalCuotas } from "@/lib/contractCalculations";

export default function Wizard() {
  const { contrato, provincia } = useParams();
  const navigate = useNavigate();
  const contract = CONTRACTS.find((c) => c.slug === contrato);
  const editId = new URLSearchParams(window.location.search).get("edit");
  const localSteps = getContractSteps(contrato);
  const [steps, setSteps] = useState(localSteps);
  const storageKey = `wizard_${contrato}_${provincia}`;
  const timersRef = useRef([]);
  const isMounted = useRef(true);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const base = restoreContractFormData(contrato, saved ? JSON.parse(saved) : {});
      // Pre-fill province fields from the URL province param
      const provinceName = PROVINCES.find((item) => item.slug === provincia)?.name || provincia;
      const defaults = {};
      if (!base.locador_provincia) defaults.locador_provincia = provinceName;
      if (!base.locatario_provincia) defaults.locatario_provincia = provinceName;
      if (!base.inmueble_provincia) defaults.inmueble_provincia = provinceName;
      if (!base.garante_provincia) defaults.garante_provincia = provinceName;
      if (!base.ciudad_jurisdiccion) defaults.ciudad_jurisdiccion = "";
      return { ...defaults, ...base };
    } catch {
      return {};
    }
  });
  const [generating, setGenerating] = useState(false);
  const [generatingPhase, setGeneratingPhase] = useState(0);
  const [generateError, setGenerateError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(Boolean(editId));
  const [editingContract, setEditingContract] = useState(null);
  const [previewMissingFields, setPreviewMissingFields] = useState([]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Los pasos locales son la fuente de verdad para las plantillas estrictas.
  // La base queda únicamente como respaldo de contratos sin definición local.
  useEffect(() => {
    if (!contrato || WIZARD_STEPS[contrato]) {
      setStepsLoading(false);
      return;
    }
    base44.entities.ContractTemplate.filter({ slug: contrato })
      .then((templates) => {
        const tmpl = templates?.[0];
        if (tmpl?.form_steps?.length > 0) {
          setSteps(calendarSteps(tmpl.form_steps, PROVINCE_OPTIONS));
        }
      })
      .catch(() => {})
      .finally(() => { if (isMounted.current) setStepsLoading(false); });
  }, [contrato]);

  useEffect(() => {
    if (!editId) return;
    base44.entities.GeneratedContract.get(editId)
      .then((savedContract) => {
        setEditingContract(savedContract);
        setFormData(restoreContractFormData(contrato, savedContract.form_data));
      })
      .finally(() => { if (isMounted.current) setEditLoading(false); });
  }, [editId, contrato]);

  useEffect(() => {
    if (editLoading) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    } catch {
      // ignore quota errors
    }
  }, [formData, storageKey, editLoading]);

  const handleNext = useCallback(async () => {
    if (generating) return; // prevent double-submit

    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
      return;
    }

    // Generate contract with AI
    setGenerating(true);
    setGenerateError(false);
    setFieldErrors([]);
    setGeneratingPhase(0);

    const t1 = setTimeout(() => { if (isMounted.current) setGeneratingPhase(1); }, 900);
    const t2 = setTimeout(() => { if (isMounted.current) setGeneratingPhase(2); }, 2200);
    timersRef.current = [t1, t2];

    try {
      let sanitizedFormData = prepareContractPayload(contract.slug, formData);
      const montoTotalCalculado = computeMontoTotalCuotas(formData);
      if (montoTotalCalculado !== null) {
        sanitizedFormData.monto_total_calculado = montoTotalCalculado;
      }
      const aiResponse = await base44.functions.invoke('generateContractAI', {
        contractSlug: contract.slug,
        contractName: contract.name,
        province: provincia,
        formData: sanitizedFormData,
      });

      clearTimeout(t1);
      clearTimeout(t2);
      timersRef.current = [];

      const generatedText = aiResponse.data?.generated_text || "";
      const documentBlocks = aiResponse.data?.document_blocks || [];
      if (!generatedText) throw new Error("No se recibió texto del contrato");

      const documentPayload = JSON.stringify({ version: 2, text: generatedText, blocks: documentBlocks.length ? documentBlocks : [{ type: "paragraph", content: generatedText }] });
      const textBlob = new Blob([documentPayload], { type: "application/json" });
      const textFile = new File([textBlob], "contract.json", { type: "application/json" });

      let file_url = documentPayload;
      try {
        const uploadRes = await base44.integrations.Core.UploadFile({ file: textFile });
        if (uploadRes?.file_url) file_url = uploadRes.file_url;
      } catch (uploadErr) {
        console.warn("UploadFile fallback:", uploadErr);
      }

      const contractData = {
        template_id: contract.slug,
        template_name: contract.name,
        category: contract.category,
        province: provincia,
        form_data: sanitizedFormData,
        generated_text: file_url,
      };
      let generated;
      try {
        generated = editId
          ? await base44.entities.GeneratedContract.update(editId, contractData)
          : await base44.entities.GeneratedContract.create({ ...contractData, status: "pending_payment" });
      } catch (dbErr) {
        console.warn("Save entity to DB failed, falling back to local storage:", dbErr);
        const fallbackId = editId || `local_${Date.now()}`;
        generated = { id: fallbackId, ...contractData, status: "pending_payment", created_at: new Date().toISOString() };
        localStorage.setItem(`contract_${fallbackId}`, JSON.stringify(generated));
      }

      base44.functions.invoke('sendContractEmail', { contractId: generated.id }).catch(() => {});

      localStorage.removeItem(storageKey);
      if (isMounted.current) {
        const wasPaid = editingContract?.status === "paid" || editingContract?.status === "downloaded";
        navigate(wasPaid ? `/mi-cuenta/contrato/${generated.id}` : `/preview/${generated.id}`);
      }
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      timersRef.current = [];
      const missingFields = err?.response?.data?.missing_inputs || err?.data?.missing_inputs || [];
      if (isMounted.current) {
        setFieldErrors(missingFields);
        setGenerating(false);
        setGenerateError(true);
      }
    }
  }, [generating, currentStep, steps.length, contract, provincia, formData, storageKey, navigate, editId, editingContract]);

  if (!contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Contrato no encontrado</p>
      </div>
    );
  }

  if (stepsLoading || editLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 text-muted-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-2">
              Paso {currentStep + 1} de {steps.length} · {contract.name}
            </div>
            <h1 className="text-2xl font-bold text-foreground">Completá los datos</h1>
          </motion.div>

          <WizardProgress steps={steps} currentStep={currentStep} />
          <MissingFieldsWarning count={previewMissingFields.length} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Form */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
              {generating ? (
                <GeneratingLoader currentPhase={generatingPhase} />
              ) : generateError && !fieldErrors.length ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-destructive" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">No se pudo generar el contrato</p>
                    <p className="text-sm text-muted-foreground mt-1">{fieldErrors.length ? "Completá los campos señalados y volvé a intentarlo." : "Ocurrió un error inesperado. Podés intentarlo de nuevo."}</p>
                  </div>
                  <Button onClick={handleNext} className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <RefreshCw className="w-4 h-4" />
                    Reintentar
                  </Button>
                </div>
              ) : (
                <WizardForm
                  step={steps[currentStep]}
                  formData={formData}
                  onChange={setFormData}
                  onNext={handleNext}
                  onBack={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  isFirst={currentStep === 0}
                  isLast={currentStep === steps.length - 1}
                  disabled={generating}
                  fieldErrors={fieldErrors}
                  contractSlug={contract.slug}
                />
              )}
            </div>

            {/* Right - Preview */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Vista previa en tiempo real
                </p>
                <div className="max-h-[calc(100vh-10rem)] overflow-y-auto rounded-2xl">
                  <ContractPreview
                    contractSlug={contract.slug}
                    province={provincia}
                    formData={formData}
                    blurred={true}
                    onMissingFields={setPreviewMissingFields}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}