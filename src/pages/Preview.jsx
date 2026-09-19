import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, ArrowRight, Shield, Check } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import ContractPreview from "@/components/wizard/ContractPreview";
import AIContractPreview from "@/components/wizard/AIContractPreview";

export default function Preview() {
  const { contractId } = useParams();
  const [generatedText, setGeneratedText] = useState("");

  const { data: contract, isLoading } = useQuery({
    queryKey: ["contract", contractId],
    queryFn: () => base44.entities.GeneratedContract.filter({ id: contractId }),
    select: (data) => data[0],
    staleTime: 60_000,
    retry: 2,
  });

  useEffect(() => {
    if (contract?.generated_text?.startsWith('http')) {
      fetch(contract.generated_text)
        .then((r) => r.text())
        .then((raw) => {
          try {
            const document = JSON.parse(raw);
            setGeneratedText(document.text || document.blocks?.map((block) => block.content).join("\n\n") || raw);
          } catch {
            setGeneratedText(raw);
          }
        })
        .catch(() => {});
    } else {
      setGeneratedText(contract?.generated_text || '');
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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Sticky free banner */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Check className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Tu contrato está listo y disponible gratis.</span>
          </div>
          <Link to={`/mi-cuenta/contrato/${contract.id}`}>
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Descargar
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="pt-36 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {generatedText ? (
            <AIContractPreview text={generatedText} blurred={false} />
          ) : (
            <ContractPreview
              contractName={contract.template_name}
              province={contract.province}
              formData={contract.form_data || {}}
              blurred={false}
            />
          )}
        </motion.div>

        {/* Free download */}
        <div className="text-center">
          <Shield className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Tu contrato está listo
          </h2>
          <p className="text-muted-foreground mt-2 mb-8">Descargalo gratis en Word</p>
          <Link to={`/mi-cuenta/contrato/${contract.id}`}>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Download className="w-5 h-5 mr-2" />
              Descargar gratis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}