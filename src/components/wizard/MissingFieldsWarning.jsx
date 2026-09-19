import { AlertTriangle } from "lucide-react";

export default function MissingFieldsWarning({ count }) {
  if (!count) return null;

  return (
    <div className="mb-6 flex items-start gap-3 border border-amber-200 bg-amber-50 p-4 text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="text-sm">
        La vista previa detectó {count} campo{count === 1 ? "" : "s"} obligatorio{count === 1 ? "" : "s"} sin resolver. Completá los datos señalados antes de generar el contrato.
      </p>
    </div>
  );
}