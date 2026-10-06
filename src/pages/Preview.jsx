import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, ArrowRight, Shield, Check, Printer } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import ContractPreview from "@/components/wizard/ContractPreview";
import AIContractPreview from "@/components/wizard/AIContractPreview";
import { parseContractText } from "@/lib/contractParser";

export default function Preview() {
  const { contractId } = useParams();
  const [generatedText, setGeneratedText] = useState("");

  const { data: contract, isLoading } = useQuery({
    queryKey: ["contract", contractId],
    queryFn: async () => {
      if (contractId?.startsWith("local_")) {
        const item = localStorage.getItem(`contract_${contractId}`);
        return item ? [JSON.parse(item)] : [];
      }
      try {
        const res = await base44.entities.GeneratedContract.filter({ id: contractId });
        if (res && res.length > 0) return res;
      } catch (e) {
        console.warn("Error fetching contract from API:", e);
      }
      const item = localStorage.getItem(`contract_${contractId}`);
      return item ? [JSON.parse(item)] : [];
    },
    select: (data) => data[0],
    staleTime: 60_000,
    retry: 2,
  });

  useEffect(() => {
    if (contract?.generated_text?.startsWith("http")) {
      fetch(contract.generated_text)
        .then((r) => r.text())
        .then((raw) => {
          setGeneratedText(parseContractText(raw));
        })
        .catch(() => {});
    } else if (contract?.generated_text) {
      setGeneratedText(parseContractText(contract.generated_text));
    }
  }, [contract?.generated_text]);

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

  return (
    <div className="min-h-screen bg-slate-100/70 print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Sticky top action banner */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-primary text-primary-foreground print:hidden shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">Tu contrato está listo y disponible en formato oficial.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/25 text-xs sm:text-sm font-medium"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Imprimir / PDF
            </Button>
            <Link to={`/mi-cuenta/contrato/${contract.id}`}>
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm">
                Descargar Word
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main preview container */}
      <div className="pt-32 sm:pt-36 pb-20 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 print:pt-0 print:pb-0 print:px-0 print:max-w-none">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 print:mb-0"
        >
          {generatedText ? (
            <AIContractPreview
              text={generatedText}
              blurred={false}
              formData={contract.form_data || {}}
              contract={contract}
            />
          ) : (
            <ContractPreview
              contractSlug={contract.template_id}
              province={contract.province}
              formData={contract.form_data || {}}
              blurred={false}
            />
          )}
        </motion.div>

        {/* Action card below contract */}
        <div className="text-center print:hidden bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 sm:p-10 max-w-xl mx-auto">
          <Shield className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Tu contrato está listo
          </h2>
          <p className="text-muted-foreground mt-2 mb-6 text-sm">
            Podés imprimirlo directamente, guardarlo como PDF o descargarlo en Word editable.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.print()}
              className="w-full sm:w-auto"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir / PDF
            </Button>
            <Link to={`/mi-cuenta/contrato/${contract.id}`} className="w-full sm:w-auto">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Descargar en Word
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}