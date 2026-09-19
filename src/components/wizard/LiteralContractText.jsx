export default function LiteralContractText({ text = '' }) {
  const normalized = text.replace(/^\[CENTRAR\]/, '');
  const newline = normalized.indexOf('\n');
  const firstLine = (newline < 0 ? normalized : normalized.slice(0, newline)).trim();
  const hasTitle = firstLine.length < 100 && firstLine === firstLine.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(firstLine);
  return (
    <div className="font-display text-sm leading-relaxed text-foreground">
      {hasTitle && <p className="text-center font-semibold mb-6 whitespace-pre-wrap">{firstLine}</p>}
      <div className="whitespace-pre-wrap text-justify">{hasTitle ? normalized.slice(firstLine.length).replace(/^\r?\n(?:\r?\n)?/, '') : normalized}</div>
    </div>
  );
}