import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { prepareContractPayload } from "@/lib/contractPayload";
import LiteralContractText from "@/components/wizard/LiteralContractText";
import { parseContractText } from "@/lib/contractParser";

export default function ContractPreview({
  contractSlug,
  province,
  formData,
  blurred = false,
  onMissingFields,
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!contractSlug || !province) return;
    let active = true;
    const timer = setTimeout(async () => {
      const data = prepareContractPayload(contractSlug, formData);
      const response = await base44.functions.invoke("generateContractAI", {
        contractSlug,
        province,
        formData: data,
        preview: true,
      });
      if (!active) return;
      setText(parseContractText(response.data?.generated_text || ""));
      onMissingFields?.(response.data?.missing_fields || []);
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [contractSlug, province, formData, onMissingFields]);

  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-slate-200/90 p-6 sm:p-8 text-[#111827]">
      {blurred && (
        <div className="absolute inset-0 z-10 backdrop-blur-[2px] pointer-events-none" />
      )}
      {text ? (
        <LiteralContractText text={text} formData={formData || {}} />
      ) : (
        <p className="text-muted-foreground text-sm text-center py-8">
          Completá los datos requeridos para generar la vista previa oficial del contrato.
        </p>
      )}
    </div>
  );
}