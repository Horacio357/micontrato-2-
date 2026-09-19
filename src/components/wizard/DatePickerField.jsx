import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Selector de fecha con calendario incorporado.
// Guarda el valor siempre en formato "YYYY-MM-DD" para mantener compatibilidad
// con el resto del sistema, sin importar el modelo de contrato.
export default function DatePickerField({ id, value, onChange }) {
  const [open, setOpen] = useState(false);

  const selectedDate = value
    ? parse(value, "yyyy-MM-dd", new Date())
    : undefined;
  const hasValidDate = selectedDate && isValid(selectedDate);

  const handleSelect = (date) => {
    if (date && isValid(date)) {
      onChange(format(date, "yyyy-MM-dd"));
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          className={cn(
            "flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            !hasValidDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-60" />
          {hasValidDate
            ? format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })
            : "Seleccioná una fecha"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={hasValidDate ? selectedDate : undefined}
          onSelect={handleSelect}
          defaultMonth={hasValidDate ? selectedDate : undefined}
          locale={es}
          captionLayout="dropdown"
          fromYear={1950}
          toYear={2100}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}