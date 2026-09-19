import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function FeedbackForm({ contractId, templateName, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Elegí una calificación antes de enviar");
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.ContractFeedback.create({
        contract_id: contractId,
        template_name: templateName,
        rating,
        comment,
      });
      setSubmitted(true);
    } catch {
      toast.error("No se pudo enviar tu feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-5 max-w-3xl mx-auto mb-10 border-accent/20 bg-accent/5 relative">
      <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
        <X className="w-4 h-4" />
      </button>

      {submitted ? (
        <p className="text-sm font-medium text-foreground text-center py-2">
          ¡Gracias por tu feedback!
        </p>
      ) : (
        <>
          <p className="font-semibold text-foreground text-sm mb-1">¿Cómo fue tu experiencia?</p>
          <p className="text-xs text-muted-foreground mb-3">Tu opinión nos ayuda a mejorar la plataforma.</p>

          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    n <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Contanos algo más (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-3 text-sm"
            rows={2}
          />

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Omitir</Button>
            <Button size="sm" onClick={handleSubmit} disabled={submitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {submitting ? "Enviando..." : "Enviar feedback"}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}