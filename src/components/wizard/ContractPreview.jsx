import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { prepareContractPayload } from "@/lib/contractPayload";
import LiteralContractText from '@/components/wizard/LiteralContractText';

export default function ContractPreview({ contractSlug, province, formData, blurred = false, onMissingFields }) {
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
      setText(response.data?.generated_text || "");
      onMissingFields?.(response.data?.missing_fields || []);
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [contractSlug, province, formData, onMissingFields]);

  return (
    <div className="relative bg-card rounded-xl shadow-sm border border-border p-6 sm:p-8 font-display text-sm leading-relaxed text-foreground">
      {blurred && <div className="absolute inset-0 z-10 backdrop-blur-[2px] pointer-events-none" />}
      {text ? (
        <LiteralContractText text={text} />
      ) : (
        <p className="text-muted-foreground">Completá los datos para ver el contrato.</p>
      )}
    </div>
  );
}