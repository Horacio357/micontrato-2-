import React, { useMemo } from "react";
import LiteralContractText from "@/components/wizard/LiteralContractText";
import { parseContractText } from "@/lib/contractParser";

/**
 * Presenta el contrato generado en un pliego de formato legal (hoja A4),
 * con opción de difuminado inferior en caso de requerir pago.
 */
export default function AIContractPreview({
  text,
  blurred = true,
  formData = {},
  contract = null,
}) {
  const cleanText = useMemo(() => {
    return parseContractText(text);
  }, [text]);

  // Auto-detect test mode: if contract text contains "prueba" in party names
  const isTestMode = useMemo(() => {
    if (!cleanText) return false;
    const first500 = cleanText.substring(0, 500).toLowerCase();
    return first500.includes("prueba");
  }, [cleanText]);

  const effectiveBlurred = blurred && !isTestMode;

  const { visibleText, hiddenText } = useMemo(() => {
    if (!cleanText) return { visibleText: "", hiddenText: "" };
    if (!effectiveBlurred) return { visibleText: cleanText, hiddenText: "" };
    const lines = cleanText.split("\n");
    const visibleCount = Math.ceil(lines.length * 0.38);
    return {
      visibleText: lines.slice(0, visibleCount).join("\n"),
      hiddenText: lines.slice(visibleCount).join("\n"),
    };
  }, [cleanText, effectiveBlurred]);

  if (!cleanText) return null;

  return (
    <div className="relative w-full max-w-[840px] mx-auto bg-white rounded-none sm:rounded-sm shadow-xl shadow-slate-300/40 border border-slate-200/90 p-8 sm:p-14 md:p-16 transition-all print:my-0 print:border-none print:shadow-none print:p-0">
      {/* Test mode banner */}
      {isTestMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-center print:hidden">
          <p className="text-amber-800 text-xs font-semibold">
            ⚠️ MODO PRUEBA — Contrato visible sin pago (datos ficticios detectados)
          </p>
          <p className="text-amber-600 text-xs mt-1">
            El contrato se aprobó automáticamente. Revisá "Mis Contratos" para descargarlo.
          </p>
        </div>
      )}

      {/* Watermark for preview */}
      {effectiveBlurred && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-4xl font-bold text-red-200/30 rotate-[-35deg] whitespace-nowrap select-none">
            VISTA PREVIA · PAGO REQUERIDO
          </div>
        </div>
      )}

      {/* Visible portion */}
      <LiteralContractText
        text={visibleText}
        formData={formData}
        contract={contract}
        showSignatures={!effectiveBlurred}
      />

      {/* Blurred / locked portion if applicable */}
      {effectiveBlurred && hiddenText && (
        <div className="relative mt-4">
          <div className="font-['Times_New_Roman',_Times,_Georgia,_serif] text-[15px] leading-[1.75] text-[#111827] blur-[3px] select-none pointer-events-none text-justify">
            <LiteralContractText
              text={hiddenText}
              formData={formData}
              contract={contract}
              showSignatures={true}
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white pointer-events-none" />
        </div>
      )}
    </div>
  );
}