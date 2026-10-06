import React, { useMemo } from "react";
import { parseContractStructure } from "@/lib/contractParser";

/**
 * Renderizador de alta fidelidad para contratos legales.
 * Presenta el documento con tipografía formal Times New Roman, interlineado legal,
 * justificación de texto, títulos de cláusulas destacados en negrita y bloque
 * formal de firmas al pie ("fiel reflejo de lo que van a imprimir").
 */
export default function LiteralContractText({
  text = "",
  formData = {},
  contract = null,
  showSignatures = true,
  className = "",
}) {
  const mergedFormData = useMemo(() => {
    return {
      ...(contract?.form_data || {}),
      ...(formData || {}),
    };
  }, [formData, contract]);

  const { title, preamble, clauses, parties } = useMemo(() => {
    return parseContractStructure(text, mergedFormData);
  }, [text, mergedFormData]);

  if (!text) return null;

  return (
    <article
      className={`font-['Times_New_Roman',_Times,_Georgia,_serif] text-[15px] sm:text-[15.5px] leading-[1.75] text-[#111827] select-text ${className}`}
    >
      {/* Título formal del contrato */}
      {title && (
        <header className="mb-8 text-center">
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-950 pb-3 border-b-2 border-slate-900/10 inline-block px-4">
            {title}
          </h1>
        </header>
      )}

      {/* Comparecencia / Encabezado */}
      {preamble && (
        <section className="mb-6 text-justify leading-[1.75] text-[#111827]">
          <p>{preamble}</p>
        </section>
      )}

      {/* Cláusulas del contrato */}
      <section className="space-y-4">
        {clauses.map((clause, idx) => (
          <div key={idx} className="text-justify leading-[1.75] text-[#111827]">
            {clause.heading ? (
              <p>
                <strong className="font-bold text-slate-950 uppercase tracking-tight mr-1.5">
                  {clause.heading}
                </strong>
                <span>{clause.body}</span>
              </p>
            ) : (
              <p>{clause.body}</p>
            )}

            {/* Sub-puntos enumerados (ej: 1. MEJORAS... 2. CONSERVACIÓN...) */}
            {clause.subItems && clause.subItems.length > 0 && (
              <div className="pl-4 sm:pl-6 my-2 space-y-2 border-l border-slate-300/70">
                {clause.subItems.map((item, sIdx) => {
                  const itemMatch = item.match(/^(\d+\.[\sA-Za-zÁÉÍÓÚáéíóúñÑ\/\(\)]+:)\s*([\s\S]*)$/);
                  if (itemMatch) {
                    return (
                      <p key={sIdx} className="text-justify leading-[1.7]">
                        <strong className="font-semibold text-slate-900 mr-1.5">
                          {itemMatch[1]}
                        </strong>
                        <span>{itemMatch[2]}</span>
                      </p>
                    );
                  }
                  return (
                    <p key={sIdx} className="text-justify leading-[1.7]">
                      {item}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Bloque formal de firmas legales para impresión */}
      {showSignatures && (
        <footer className="mt-14 pt-10 border-t border-slate-300/80 break-inside-avoid print:mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-14 max-w-2xl mx-auto">
            {/* Firma Locador */}
            <div className="text-center flex flex-col items-center">
              <div className="w-56 sm:w-64 border-b-2 border-slate-800 mb-2.5"></div>
              <p className="font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-900">
                {parties.locador.role || "PARTE LOCADORA"}
              </p>
              <div className="text-xs text-slate-700 mt-2 space-y-1 text-left w-56 sm:w-64">
                <p>
                  <span className="font-semibold">Firma:</span> ______________________
                </p>
                <p>
                  <span className="font-semibold">Aclaración:</span>{" "}
                  {parties.locador.name || "______________________"}
                </p>
                <p>
                  <span className="font-semibold">D.N.I. / C.U.I.T.:</span>{" "}
                  {parties.locador.dni || "______________________"}
                </p>
              </div>
            </div>

            {/* Firma Locatario / Parte B */}
            <div className="text-center flex flex-col items-center">
              <div className="w-56 sm:w-64 border-b-2 border-slate-800 mb-2.5"></div>
              <p className="font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-900">
                {parties.locatario.role || "PARTE B"}
              </p>
              <div className="text-xs text-slate-700 mt-2 space-y-1 text-left w-56 sm:w-64">
                <p>
                  <span className="font-semibold">Firma:</span> ______________________
                </p>
                <p>
                  <span className="font-semibold">Aclaración:</span>{" "}
                  {parties.locatario.name || "______________________"}
                </p>
                <p>
                  <span className="font-semibold">D.N.I. / C.U.I.T.:</span>{" "}
                  {parties.locatario.dni || "______________________"}
                </p>
              </div>
            </div>
          </div>

          {/* Firma Garante si aplica */}
          {parties.garante && (
            <div className="mt-10 text-center flex flex-col items-center max-w-xs mx-auto">
              <div className="w-56 sm:w-64 border-b-2 border-slate-800 mb-2.5"></div>
              <p className="font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-900">
                {parties.garante.role || "GARANTE / FIADOR"}
              </p>
              <div className="text-xs text-slate-700 mt-2 space-y-1 text-left w-56 sm:w-64">
                <p>
                  <span className="font-semibold">Firma:</span> ______________________
                </p>
                <p>
                  <span className="font-semibold">Aclaración:</span>{" "}
                  {parties.garante.name || "______________________"}
                </p>
                <p>
                  <span className="font-semibold">D.N.I.:</span>{" "}
                  {parties.garante.dni || "______________________"}
                </p>
              </div>
            </div>
          )}
        </footer>
      )}
    </article>
  );
}