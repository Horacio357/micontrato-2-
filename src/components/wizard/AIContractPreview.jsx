import { useMemo } from "react";
import LiteralContractText from '@/components/wizard/LiteralContractText';

/**
 * Muestra el texto del contrato generado por IA con blur en el área inferior
 * para incentivar el pago sin revelar el contenido completo.
 */
export default function AIContractPreview({ text, blurred = true }) {
  // Auto-detect test mode: if contract text contains "prueba" in party names
  const isTestMode = useMemo(() => {
    if (!text) return false;
    const first500 = text.substring(0, 500).toLowerCase();
    return first500.includes("prueba");
  }, [text]);

  const effectiveBlurred = blurred && !isTestMode;

  const { visibleText, hiddenText } = useMemo(() => {
    if (!text) return { visibleText: "", hiddenText: "" };
    if (!effectiveBlurred) return { visibleText: text, hiddenText: "" };
    const lines = text.split('\n');
    const visibleCount = Math.ceil(lines.length * 0.38);
    return {
      visibleText: lines.slice(0, visibleCount).join('\n'),
      hiddenText: lines.slice(visibleCount).join('\n'),
    };
  }, [text, effectiveBlurred]);

  if (!text) return null;

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-border p-8 font-serif text-sm leading-relaxed text-gray-800 overflow-hidden">
      {/* Test mode banner */}
      {isTestMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-center print:hidden">
          <p className="text-amber-800 text-xs font-semibold">⚠️ MODO PRUEBA — Contrato visible sin pago (datos ficticios detectados)</p>
          <p className="text-amber-600 text-xs mt-1">El contrato se aprobó automáticamente. Revisá "Mis Contratos" para descargarlo.</p>
        </div>
      )}

      {/* Watermark */}
      {effectiveBlurred && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-4xl font-bold text-red-200/30 rotate-[-35deg] whitespace-nowrap select-none">
            VISTA PREVIA · PAGO REQUERIDO
          </div>
        </div>
      )}

      {/* Visible portion */}
      <LiteralContractText text={visibleText} />

      {/* Blurred / locked portion */}
      {effectiveBlurred && hiddenText && (
        <div className="relative">
          <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-800 blur-sm select-none pointer-events-none text-justify">
            {hiddenText}
          </pre>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white pointer-events-none" />
        </div>
      )}
    </div>
  );
}