import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PROVINCES, CONTRACTS } from "@/lib/contractsData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Check, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";

export default function SelectProvince() {
  const { categoria, contrato } = useParams();
  const navigate = useNavigate();
  const contract = CONTRACTS.find((c) => c.slug === contrato);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistProvince, setWaitlistProvince] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleProvinceClick = (province) => {
    if (province.available) {
      navigate(`/generar/${contrato}/${province.slug}`);
    } else {
      setWaitlistProvince(province.name);
      setWaitlistOpen(true);
    }
  };

  const handleWaitlist = async () => {
    if (!waitlistEmail) return;
    setSending(true);
    await base44.entities.WaitlistEmail.create({
      email: waitlistEmail,
      province: waitlistProvince,
    });
    setSending(false);
    setWaitlistOpen(false);
    setWaitlistEmail("");
    toast.success("¡Listo! Te avisaremos cuando lancemos en " + waitlistProvince);
  };

  const available = PROVINCES.filter((p) => p.available);
  const unavailable = PROVINCES.filter((p) => !p.available);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/crear/${categoria}`}>
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Contratos
          </Button>
        </Link>

        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-4"
          >
            Paso 3 de 4 · {contract?.name}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-foreground"
          >
            ¿En qué provincia?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-3 text-muted-foreground"
          >
            El contrato se adapta a la legislación de tu jurisdicción
          </motion.p>
        </div>

        {/* Available */}
        <div className="mb-10">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
            <Check className="w-4 h-4 text-accent" />
            Disponibles
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {available.map((p, i) => (
              <motion.button
                key={p.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                onClick={() => handleProvinceClick(p)}
                className="group rounded-xl border-2 border-border bg-card p-5 hover:border-accent hover:shadow-lg transition-all duration-300 text-left"
              >
                <MapPin className="w-5 h-5 text-accent mb-3" />
                <p className="font-semibold text-foreground group-hover:text-accent transition-colors">{p.name}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Unavailable */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Próximamente
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {unavailable.map((p) => (
              <button
                key={p.slug}
                onClick={() => handleProvinceClick(p)}
                className="rounded-xl border border-border/50 bg-muted/30 p-4 text-left opacity-60 hover:opacity-80 transition-opacity"
              >
                <p className="text-sm text-muted-foreground">{p.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" />
              Avisame cuando lancen en {waitlistProvince}
            </DialogTitle>
            <DialogDescription>
              Dejá tu email y te notificamos cuando el contrato esté disponible para esta provincia.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Input
              type="email"
              placeholder="tu@email.com"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
            />
            <Button
              onClick={handleWaitlist}
              disabled={sending || !waitlistEmail}
              className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0"
            >
              {sending ? "Enviando..." : "Avisame"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}