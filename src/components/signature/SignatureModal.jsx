import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  X, Shield, CheckCircle2, Loader2, PenLine, User, Mail, CreditCard
} from "lucide-react";
import SignatureCanvas from "./SignatureCanvas";
import confetti from "canvas-confetti";

const partyOptions = [
  { value: "part_a", label: "Parte A (Primer firmante)" },
  { value: "part_b", label: "Parte B (Segundo firmante)" },
];

export default function SignatureModal({ contract, onClose, onSigned }) {
  const [step, setStep] = useState(1); // 1: datos, 2: firma, 3: éxito
  const [partyRole, setPartyRole] = useState("part_a");
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signerDni, setSignerDni] = useState("");
  const [signatureData, setSignatureData] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateStep1 = () => {
    if (!signerName.trim()) { toast.error("Ingresá tu nombre completo"); return false; }
    if (!signerDni.trim()) { toast.error("Ingresá tu DNI"); return false; }
    if (!signerEmail.trim()) { toast.error("Ingresá tu email"); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!signatureData) { toast.error("Dibujá tu firma para continuar"); return false; }
    if (!termsAccepted) { toast.error("Debés aceptar los términos de firma digital"); return false; }
    if (!declarationAccepted) { toast.error("Debés aceptar la declaración jurada"); return false; }
    return true;
  };

  const handleSign = async () => {
    if (!validateStep2()) return;
    setLoading(true);

    try {
      // La firma se procesa en el backend: hash SHA-256, validación de identidad
      // (email del usuario autenticado o token de firma) y metadatos de auditoría.
      await base44.functions.invoke("createContractSignature", {
        contract_id: contract.id,
        party_role: partyRole,
        signer_name: signerName.trim(),
        signer_email: signerEmail.trim(),
        signer_dni: signerDni.trim(),
        signature_image: signatureData,
        terms_accepted: termsAccepted,
        declaration_accepted: declarationAccepted,
      });

      setStep(3);
      // Fire confetti celebration
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#0088cc", "#1a2332", "#10b981", "#34d399", "#6ee7b7"],
          zIndex: 9999,
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: ["#0088cc", "#10b981"],
            zIndex: 9999,
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: ["#1a2332", "#34d399"],
            zIndex: 9999,
          });
        }, 300);
      }, 100);
      if (onSigned) onSigned();
    } catch (err) {
      toast.error("Error al procesar la firma: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Progress bar */}
          {step < 3 && (
            <div className="h-1 bg-muted">
              <motion.div
                className="h-full bg-accent"
                animate={{ width: step === 1 ? "50%" : "100%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          )}

          <div className="p-6 max-h-[85vh] overflow-y-auto">
            {/* STEP 1: Datos del firmante */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground text-lg">Datos del firmante</h2>
                    <p className="text-xs text-muted-foreground">{contract.template_name}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Rol */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Firmás como
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {partyOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPartyRole(opt.value)}
                          className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left ${
                            partyRole === opt.value
                              ? "border-accent bg-accent/5 text-accent"
                              : "border-border bg-background text-muted-foreground hover:border-border/60"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Nombre completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Ej: Juan García"
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      DNI
                    </Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Ej: 30.123.456"
                        value={signerDni}
                        onChange={(e) => setSignerDni(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={signerEmail}
                        onChange={(e) => setSignerEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => { if (validateStep1()) setStep(2); }}
                >
                  Continuar a la firma
                  <PenLine className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* STEP 2: Firma */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <PenLine className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground text-lg">Tu firma digital</h2>
                    <p className="text-xs text-muted-foreground">Dibujá tu firma en el recuadro</p>
                  </div>
                </div>

                <SignatureCanvas onChange={setSignatureData} />

                {/* Info de metadata */}
                <div className="mt-4 p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700 leading-relaxed">
                    Se registrará automáticamente la <strong>fecha y hora exacta</strong>, tu <strong>dirección IP</strong> y el dispositivo utilizado como evidencia legal de la firma.
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={setTermsAccepted}
                      className="mt-0.5"
                    />
                    <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                      Acepto que esta firma digital tiene la misma validez legal que una firma ológrafa conforme a la{" "}
                      <span className="text-accent font-medium">Ley N° 25.506</span> de Firma Digital de Argentina.
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="declaration"
                      checked={declarationAccepted}
                      onCheckedChange={setDeclarationAccepted}
                      className="mt-0.5"
                    />
                    <label htmlFor="declaration" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                      Declaro bajo juramento que los datos ingresados son correctos y que soy la persona identificada en el contrato.
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    Atrás
                  </Button>
                  <Button
                    className="flex-2 flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={handleSign}
                    disabled={loading}
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando…</>
                    ) : (
                      <><Shield className="w-4 h-4 mr-2" /> Firmar contrato</>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Éxito */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                {/* Animated check icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.05 }}
                  className="relative w-20 h-20 mx-auto mb-5"
                >
                  {/* Pulse rings */}
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0.8 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                    className="absolute inset-0 rounded-full bg-emerald-400/30"
                  />
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0.6 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                    className="absolute inset-0 rounded-full bg-emerald-400/20"
                  />
                  <div className="relative w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <motion.div
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-foreground mb-1"
                >
                  ¡Firma registrada!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-sm mb-5"
                >
                  La firma de <strong>{signerName}</strong> quedó asentada con validez legal.
                </motion.p>

                {/* Detail rows */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 mb-6 text-left overflow-hidden"
                >
                  {[
                    { label: "Firmante", value: `${signerName} · DNI ${signerDni}` },
                    { label: "Rol", value: partyRole === "part_a" ? "Parte A (Primer firmante)" : "Parte B (Segundo firmante)" },
                    { label: "Fecha y hora", value: new Date().toLocaleString("es-AR") },
                    { label: "Registro", value: "IP · Dispositivo · Timestamp" },
                  ].map((row, i) => (
                    <motion.div
                      key={row.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.08 }}
                      className={`flex justify-between items-center px-4 py-2.5 ${i < 3 ? "border-b border-emerald-100" : ""}`}
                    >
                      <span className="text-emerald-600 font-medium">{row.label}</span>
                      <span className="text-emerald-900 font-semibold text-right ml-3">{row.value}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Legal note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.85 }}
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-5"
                >
                  <Shield className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Firmado bajo Ley N° 25.506 de Firma Digital · Argentina</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.95 }}
                >
                  <Button
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={onClose}
                  >
                    Cerrar y ver contrato
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}