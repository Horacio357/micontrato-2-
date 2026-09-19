import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, FileCheck } from "lucide-react";
import SmartInput from "./SmartInput";
import DatePickerField from "./DatePickerField";
import { getFieldConfig, validateCUIT } from "@/hooks/useFieldFormatter";
import { useGooglePlaces } from "@/hooks/useGooglePlaces";
import { getFieldHelp } from "@/lib/fieldHelp";
import FieldHelpTooltip from "./FieldHelpTooltip";
import { Input } from "@/components/ui/input";
import { validateDateRange } from "@/lib/contractCalculations";

const MAX_DAYS_TEMPORARIA = 90;

export default function WizardForm({ step, formData, onChange, onNext, onBack, isFirst, isLast, disabled = false, fieldErrors = [], contractSlug }) {
  const handleFieldChange = useCallback((fieldName, value) => {
    onChange((prev) => ({
      ...prev,
      [fieldName]: value,
      ...(fieldName === "condiciones_economicas_indice_actualizacion" && value !== "Otro"
        ? { condiciones_economicas_indice_actualizacion_otro: "" }
        : {}),
    }));
  }, [onChange]);

  const conditionMatches = useCallback((condition) => {
    if (!condition) return true;
    const value = formData[condition.field];
    if (condition.notEmpty) return value !== undefined && value !== null && String(value).trim() !== "";
    if (condition.oneOf) return condition.oneOf.includes(value);
    return value === condition.value;
  }, [formData]);

  const visibleFields = useMemo(() => step.fields.filter((field) => conditionMatches(field.visibleWhen)), [step.fields, conditionMatches]);

  const isFieldRequired = useCallback((field) => field.required || (field.requiredWhen && conditionMatches(field.requiredWhen)), [conditionMatches]);

  // Validación estricta de rango de fechas cuando el paso tiene un par inicio/fin
  const dateFields = useMemo(() => visibleFields.filter((f) => f.type === "date"), [visibleFields]);
  const dateError = useMemo(() => {
    if (dateFields.length !== 2) return null;
    const [startField, endField] = dateFields;
    const isTemporaria = contractSlug === "locacion-temporaria-turistica";
    return validateDateRange(
      formData[startField.name],
      formData[endField.name],
      { maxDays: isTemporaria ? MAX_DAYS_TEMPORARIA : null }
    );
  }, [dateFields, formData, contractSlug]);

  // Validación de consistencia de garantes: si se completa el nombre de un
  // garante pero no su DNI (o viceversa), el bloque quedaría a medio llenar
  // en el contrato final (nombre presente, DNI con guiones bajos). Se exige
  // que ambos campos estén completos o ambos vacíos antes de avanzar.
  const guarantorError = useMemo(() => {
    const groups = {};
    step.fields.forEach((f) => {
      const m = f.name.match(/^(garante(?:_\d+)?)_(nombre(?:_completo)?|dni)$/);
      if (m) {
        const [, prefix, kind] = m;
        groups[prefix] = groups[prefix] || {};
        groups[prefix][kind.startsWith("nombre") ? "nombre" : "dni"] = f.name;
      }
    });
    for (const prefix in groups) {
      const { nombre, dni } = groups[prefix];
      if (!nombre || !dni) continue;
      const nombreVal = (formData[nombre] || "").toString().trim();
      const dniVal = (formData[dni] || "").toString().trim();
      if ((nombreVal && !dniVal) || (!nombreVal && dniVal)) {
        return `Completá tanto el nombre como el DNI del garante, o dejá ambos campos vacíos.`;
      }
    }
    return null;
  }, [step.fields, formData]);

  // Campos de estado civil presentes en este paso, para disparar asentimiento conyugal
  const estadoCivilFields = useMemo(
    () => visibleFields.filter((f) => f.name.toLowerCase().includes("estado_civil")),
    [visibleFields]
  );

  // Detecta si algún campo del paso actual es dirección → carga Google Places lazy
  const hasAddressField = useMemo(() =>
    visibleFields.some((f) =>
      f.name?.toLowerCase().includes("direccion") ||
      f.name?.toLowerCase().includes("dirección") ||
      f.name?.toLowerCase().includes("domicilio")
    ), [visibleFields]);

  useGooglePlaces(hasAddressField);

  // Validación de avance: campos requeridos + CUIT válido + fechas + asentimiento conyugal
  const allRequiredFilled = useMemo(() => {
    if (disabled || dateError || guarantorError) return false;

    const requiredOk = visibleFields
      .filter((f) => isFieldRequired(f))
      .every((f) => {
        const val = formData[f.name];
        if (val === undefined || val === null || val.toString().trim() === "") return false;
        // Validación extra de CUIT
        const config = getFieldConfig(f.name, f.type);
        if (config.validate && config.blocking !== false) {
          return config.validate(val) === null;
        }
        return true;
      });
    if (!requiredOk) return false;

    // Asentimiento conyugal: si hay estado civil "Casado/a", exigir datos del cónyuge
    return estadoCivilFields.every((f) => {
      if (formData[f.name] !== "Casado/a") return true;
      const nombre = formData[`${f.name}_conyuge_nombre`];
      const dni = formData[`${f.name}_conyuge_dni`];
      return !!nombre?.toString().trim() && !!dni?.toString().trim();
    });
  }, [disabled, dateError, guarantorError, visibleFields, formData, estadoCivilFields, isFieldRequired]);

  return (
    <motion.div
      key={step.title}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-bold text-foreground mb-6">{step.title}</h2>

      <div className="space-y-5">
        {visibleFields.map((field) => (
          <div key={field.name} className="space-y-1.5">
            {fieldErrors.includes(field.name) && (
              <p className="text-sm font-medium text-destructive">Este campo es obligatorio para generar el contrato.</p>
            )}
            <Label htmlFor={field.name} className="text-sm font-medium inline-flex items-center gap-1.5">
              {field.label}
              {isFieldRequired(field) && <span className="text-destructive">*</span>}
              <FieldHelpTooltip text={getFieldHelp(field.name)} />
            </Label>

            {field.type === "select" ? (
              <Select
                value={formData[field.name] || ""}
                onValueChange={(v) => handleFieldChange(field.name, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná una opción" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "textarea" ? (
              <Textarea
                id={field.name}
                value={formData[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
              />
            ) : field.type === "date" ? (
              <DatePickerField
                id={field.name}
                value={formData[field.name] || ""}
                onChange={(val) => handleFieldChange(field.name, val)}
              />
            ) : (
              <SmartInput
                field={field}
                value={formData[field.name]}
                onChange={(val) => handleFieldChange(field.name, val)}
              />
            )}

            {/* Asentimiento conyugal: si esta persona está casada, pedir datos del cónyuge */}
            {field.name.toLowerCase().includes("estado_civil") && formData[field.name] === "Casado/a" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pl-4 border-l-2 border-accent/30">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Nombre del cónyuge</Label>
                  <Input
                    value={formData[`${field.name}_conyuge_nombre`] || ""}
                    onChange={(e) => handleFieldChange(`${field.name}_conyuge_nombre`, e.target.value)}
                    placeholder="Nombre y apellido del cónyuge"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">DNI del cónyuge</Label>
                  <Input
                    value={formData[`${field.name}_conyuge_dni`] || ""}
                    onChange={(e) => handleFieldChange(`${field.name}_conyuge_dni`, e.target.value)}
                    placeholder="12.345.678"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {dateError && (
        <p className="text-sm text-destructive font-medium mt-4">{dateError}</p>
      )}
      {guarantorError && (
        <p className="text-sm text-destructive font-medium mt-4">{guarantorError}</p>
      )}

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button variant="ghost" onClick={onBack} disabled={isFirst}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        <Button
          onClick={onNext}
          disabled={!allRequiredFilled}
          className={isLast ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}
        >
          {isLast ? (
            <>
              <FileCheck className="w-4 h-4 mr-2" />
              Generar contrato
            </>
          ) : (
            <>
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}