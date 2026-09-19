import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { getFieldConfig } from "@/hooks/useFieldFormatter";
import { isDecimalContractField } from "@/lib/contractNumbers";

/**
 * SmartInput: Input con teclado nativo, formato automático, validación en tiempo real
 * y autocompletado de direcciones via Google Places.
 */
export default function SmartInput({ field, value, onChange }) {
  const config = getFieldConfig(field.name, field.type);
  const isDecimal = isDecimalContractField(field.name) || field.type === "number";
  const useCurrencyFormatting = field.formatAsCurrency === true;
  const digitsOnly = field.digitsOnly === true;
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const isAddress = field.name?.toLowerCase().includes("direccion") ||
    field.name?.toLowerCase().includes("dirección") ||
    field.name?.toLowerCase().includes("domicilio");

  // Maneja cambio con formateo automático
  const handleChange = useCallback((e) => {
    const raw = e.target.value;
    const formatted = digitsOnly
      ? raw.replace(/\D/g, "").slice(0, field.maxLength)
      : useCurrencyFormatting
        ? raw.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        : (isDecimal ? raw : (config.format ? config.format(raw) : raw));
    onChange(isDecimal && !digitsOnly && !useCurrencyFormatting && formatted !== '' ? Number(formatted) : formatted);

    // Validación en tiempo real (solo CUIT)
    if (config.validate && formatted.replace(/\D/g, "").length === 11) {
      setError(config.validate(formatted));
    } else {
      setError(null);
    }
  }, [config, digitsOnly, field.maxLength, isDecimal, onChange, useCurrencyFormatting]);

  // Carga Google Places solo para campos de dirección
  useEffect(() => {
    if (!isAddress) return;

    const loadPlaces = () => {
      if (!inputRef.current || autocompleteRef.current) return;
      if (typeof window.google === "undefined" || !window.google.maps?.places) return;

      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "ar" },
        fields: ["address_components", "formatted_address"],
      });

      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place.address_components) return;

        const get = (type) =>
          place.address_components.find((c) => c.types.includes(type))?.long_name || "";

        const street = get("route");
        const number = get("street_number");
        const city = get("locality") || get("sublocality");
        const province = get("administrative_area_level_1");
        const cp = get("postal_code");

        const fullAddress = place.formatted_address || `${street} ${number}`;
        onChange(fullAddress);

        // Dispara eventos para autocompletar otros campos si existen
        window.dispatchEvent(new CustomEvent("places_filled", {
          detail: { city, province, cp, street, number }
        }));
      });

      autocompleteRef.current = ac;
    };

    if (typeof window.google !== "undefined") {
      loadPlaces();
    } else {
      window.addEventListener("google_maps_loaded", loadPlaces, { once: true });
    }

    return () => {
      window.removeEventListener("google_maps_loaded", loadPlaces);
    };
  }, [isAddress, onChange]);

  const inputProps = {
    id: field.name,
    ref: inputRef,
    value: value ?? "",
    onChange: handleChange,
    placeholder: field.placeholder,
    type: digitsOnly ? "text" : (isDecimal && !useCurrencyFormatting ? "number" : "text"),
    step: isDecimal && !useCurrencyFormatting && !digitsOnly ? "any" : undefined,
    maxLength: digitsOnly ? field.maxLength : (isDecimal && !useCurrencyFormatting ? undefined : (config.maxLength || undefined)),
    inputMode: digitsOnly ? "numeric" : config.inputMode,
    pattern: digitsOnly ? "[0-9]*" : config.pattern,
    list: field.options?.length ? `${field.name}-options` : undefined,
    className: error ? "border-destructive focus-visible:ring-destructive" : "",
  };

  return (
    <div>
      <Input {...inputProps} />
      {field.options?.length ? (
        <datalist id={`${field.name}-options`}>
          {field.options.map((option) => <option key={option} value={option} />)}
        </datalist>
      ) : null}
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}