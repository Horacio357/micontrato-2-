/**
 * BrandLogo — "micontrato" con punto animado sobre la "i" de "contrato"
 * Props:
 *   dark  → true cuando el fondo es oscuro (texto blanco, punto azul claro)
 *   size  → "sm" | "md" (default "md")
 */
export default function BrandLogo({ dark = false, size = "md" }) {
  // Tamaños
  const fontSize   = size === "sm" ? 20 : 30;          // px — mobile usa sm, desktop md
  const dotSize    = 4.5;                               // px
  const dotTop     = size === "sm" ? 3 : 4;            // px sobre la "i"
  const dotLeft    = size === "sm" ? 9 : 11;           // px desde el inicio de la "i"

  const colorText  = dark ? "#FFFFFF" : "#0F2C5F";
  const colorDot   = dark ? "#3B82F6" : "#2563EB";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        fontSize: `${fontSize}px`,
        letterSpacing: "-0.045em",
        lineHeight: 1,
        color: colorText,
        userSelect: "none",
      }}
    >
      {/* "mi" atenuado */}
      <span style={{ opacity: 0.55 }}>mi</span>

      {/* "contrato" con punto sobre la i */}
      <span style={{ position: "relative" }}>
        {/* Punto animado */}
        <span
          style={{
            position: "absolute",
            top: `-${dotTop}px`,
            left: `${dotLeft}px`,
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: "50%",
            backgroundColor: colorDot,
            animation: "logoDotPulse 2.4s ease-in-out infinite",
          }}
        />
        contrato
      </span>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap');

        @keyframes logoDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(0.72); }
        }
      `}</style>
    </span>
  );
}