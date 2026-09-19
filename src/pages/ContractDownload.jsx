import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, FileDown, Mail, Plus, User, ArrowLeft,
  PenLine, Shield, CheckCircle2, Clock, Loader2
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import ContractPreview from "@/components/wizard/ContractPreview";
import SignatureModal from "@/components/signature/SignatureModal";
import SignatureCertificate from "@/components/signature/SignatureCertificate";
import FeedbackForm from "@/components/wizard/FeedbackForm";
import LiteralContractText from '@/components/wizard/LiteralContractText';
import useDocxDownload from "@/components/account/useDocxDownload";

const sigStatusMap = {
  not_required: null,
  pending_part_a: { label: "Esperando firma Parte A", color: "bg-amber-50 text-amber-700 border-amber-200" },
  pending_part_b: { label: "Esperando firma Parte B", color: "bg-amber-50 text-amber-700 border-amber-200" },
  partially_signed: { label: "Parcialmente firmado", color: "bg-blue-50 text-blue-700 border-blue-200" },
  fully_signed: { label: "Firmado por ambas partes", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function ContractDownload() {
  const { contractId } = useParams();
  const queryClient = useQueryClient();
  const [showSignModal, setShowSignModal] = useState(false);

  const [generatedText, setGeneratedText] = useState("");
  const [documentBlocks, setDocumentBlocks] = useState([]);

  const { data: contract, isLoading: loadingContract } = useQuery({
    queryKey: ["contract-download", contractId],
    queryFn: async () => {
      if (contractId?.startsWith("local_")) {
        const item = localStorage.getItem(`contract_${contractId}`);
        return item ? [JSON.parse(item)] : [];
      }
      try {
        const res = await base44.entities.GeneratedContract.filter({ id: contractId });
        if (res && res.length > 0) return res;
      } catch (e) {
        console.warn("Error fetching contract download from API:", e);
      }
      const item = localStorage.getItem(`contract_${contractId}`);
      return item ? [JSON.parse(item)] : [];
    },
    select: (data) => data[0],
    staleTime: 60_000,
  });

  const { data: signatures = [], isLoading: loadingSigs } = useQuery({
    queryKey: ["contract-signatures", contractId],
    queryFn: async () => {
      if (contractId?.startsWith("local_")) return [];
      try {
        return await base44.entities.ContractSignature.filter({ contract_id: contractId });
      } catch (e) {
        return [];
      }
    },
    enabled: !!contractId,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (contract?.generated_text?.startsWith("http")) {
      fetch(contract.generated_text)
        .then((r) => r.text())
        .then((raw) => {
          try {
            const document = JSON.parse(raw);
            const blocks = Array.isArray(document.blocks) ? document.blocks : [];
            setDocumentBlocks(blocks);
            setGeneratedText(document.text || blocks.map((block) => block.content).join("\n\n"));
          } catch {
            // Conservar literalmente espacios y saltos de los documentos anteriores.
            setDocumentBlocks([{ type: 'paragraph', content: raw }]);
            setGeneratedText(raw);
          }
        })
        .catch(() => {});
    } else {
      setGeneratedText(contract?.generated_text || '');
    }
  }, [contract?.generated_text]);

  const isLoading = loadingContract || loadingSigs;

  const handleSigned = () => {
    queryClient.invalidateQueries({ queryKey: ["contract-download", contractId] });
    queryClient.invalidateQueries({ queryKey: ["contract-signatures", contractId] });
    queryClient.invalidateQueries({ queryKey: ["my-contracts"] });
  };

  const [showFeedback, setShowFeedback] = useState(false);
  const { downloading: downloadingDocx, download: handleDownloadDocx } = useDocxDownload(contractId, () => setShowFeedback(true), contract);

  const [sendingEmail, setSendingEmail] = useState(false);

  const handleEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await base44.functions.invoke('sendContractEmail', { contractId });
      const sentTo = res.data?.sent_to;
      const count = Array.isArray(sentTo) ? sentTo.length : 1;
      toast.success(`Contrato enviado a ${count} ${count === 1 ? "destinatario" : "destinatarios"}`);
    } catch {
      toast.error("Error al enviar el email");
    } finally {
      setSendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Contrato no encontrado</p>
      </div>
    );
  }

  const sigStatus = sigStatusMap[contract.signature_status];
  const isFullySigned = contract.signature_status === "fully_signed";
  const hasSignatures = signatures.length > 0;

  // Determine which parties haven't signed yet
  const partASignature = signatures.find((s) => s.party_role === "part_a");
  const partBSignature = signatures.find((s) => s.party_role === "part_b");
  const canSignA = !partASignature;
  const canSignB = !partBSignature;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/mis-contratos">
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Mis contratos
          </Button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{contract.template_name}</h1>
          <p className="text-muted-foreground mt-2">
            {isFullySigned ? "Contrato firmado digitalmente por ambas partes" : "Tu contrato está listo para descargar y firmar"}
          </p>

          {/* Signature status badge */}
          {sigStatus && (
            <div className="flex justify-center mt-3">
              <Badge className={`text-xs font-medium border ${sigStatus.color}`}>
                {isFullySigned ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                {sigStatus.label}
              </Badge>
            </div>
          )}
        </motion.div>

        {/* Actions: Download + Sign */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10"
        >
          <Card className="p-5 text-center opacity-50 cursor-not-allowed bg-muted/40">
            <FileDown className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
            <p className="font-semibold text-muted-foreground text-sm">Descargar PDF</p>
            <p className="text-xs text-muted-foreground mt-0.5">Próximamente</p>
          </Card>

          <Card
            className={`p-5 text-center cursor-pointer hover:shadow-lg hover:border-accent/30 transition-all group ${downloadingDocx ? "opacity-60 pointer-events-none" : ""}`}
            onClick={handleDownloadDocx}
          >
            {downloadingDocx
              ? <Loader2 className="w-7 h-7 text-blue-500 mx-auto mb-2 animate-spin" />
              : <FileDown className="w-7 h-7 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            }
            <p className="font-semibold text-foreground text-sm">{downloadingDocx ? "Generando..." : "Descargar Word"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">DOCX editable</p>
          </Card>

          <Card
            className={`p-5 text-center cursor-pointer hover:shadow-lg hover:border-accent/30 transition-all group ${sendingEmail ? "opacity-60 pointer-events-none" : ""}`}
            onClick={handleEmail}
          >
            <Mail className={`w-7 h-7 text-accent mx-auto mb-2 group-hover:scale-110 transition-transform ${sendingEmail ? "animate-pulse" : ""}`} />
            <p className="font-semibold text-foreground text-sm">{sendingEmail ? "Enviando..." : "Reenviar email"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">A tu casilla</p>
          </Card>

          {/* Sign button */}
          {(canSignA || canSignB) && (
            <Card
              className="p-5 text-center cursor-pointer hover:shadow-lg hover:border-emerald-300 border-emerald-100 bg-emerald-50/40 transition-all group"
              onClick={() => setShowSignModal(true)}
            >
              <PenLine className="w-7 h-7 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-emerald-800 text-sm">Firmar digitalmente</p>
              <p className="text-xs text-emerald-600/70 mt-0.5">Validez legal</p>
            </Card>
          )}

          {isFullySigned && (
            <Card className="p-5 text-center border-emerald-200 bg-emerald-50/40">
              <Shield className="w-7 h-7 text-emerald-600 mx-auto mb-2" />
              <p className="font-semibold text-emerald-800 text-sm">Totalmente firmado</p>
              <p className="text-xs text-emerald-600/70 mt-0.5">Ambas partes</p>
            </Card>
          )}
        </motion.div>

        {/* Pending signatures notice */}
        {hasSignatures && !isFullySigned && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto mb-8 p-4 bg-amber-50/60 border border-amber-100 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Firma pendiente</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {partASignature && !partBSignature && "Parte A ya firmó. Falta la firma de Parte B."}
                  {!partASignature && partBSignature && "Parte B ya firmó. Falta la firma de Parte A."}
                  {!partASignature && !partBSignature && "Ninguna de las partes ha firmado aún."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Signature Certificate */}
        {hasSignatures && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-10"
          >
            <SignatureCertificate signatures={signatures} contractName={contract.template_name} />
          </motion.div>
        )}

        {/* Feedback form after download */}
        {showFeedback && (
          <FeedbackForm
            contractId={contract.id}
            templateName={contract.template_name}
            onClose={() => setShowFeedback(false)}
          />
        )}

        {/* Full contract preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {generatedText ? (
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 sm:p-10 font-serif text-sm leading-relaxed text-gray-800">
              <LiteralContractText text={generatedText} />
            </div>
          ) : (
            <ContractPreview
              contractName={contract.template_name}
              province={contract.province}
              formData={contract.form_data || {}}
              blurred={false}
            />
          )}
        </motion.div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link to="/crear">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Crear otro contrato
            </Button>
          </Link>
          <Link to="/mis-contratos">
            <Button variant="outline">
              <User className="w-4 h-4 mr-2" />
              Mis contratos
            </Button>
          </Link>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignModal && (
        <SignatureModal
          contract={contract}
          onClose={() => setShowSignModal(false)}
          onSigned={handleSigned}
        />
      )}
    </div>
  );
}