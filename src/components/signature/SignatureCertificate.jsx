import { Shield, CheckCircle2, Clock, Monitor, MapPin, Hash, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const partyLabel = {
  part_a: "Parte A",
  part_b: "Parte B",
  witness: "Testigo",
};

export default function SignatureCertificate({ signatures = [], contractName }) {
  if (!signatures.length) return null;

  return (
    <div className="mt-8 border border-border rounded-2xl overflow-hidden bg-secondary/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-border px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">Certificado de Firma Digital</p>
          <p className="text-xs text-muted-foreground">{contractName}</p>
        </div>
        <Badge className="ml-auto bg-emerald-100 text-emerald-800 border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Firmado digitalmente
        </Badge>
      </div>

      {/* Signatures */}
      <div className="divide-y divide-border">
        {signatures.map((sig, i) => (
          <div key={sig.id || i} className="px-6 py-5">
            <div className="flex items-start gap-4">
              {/* Signature image */}
              <div className="shrink-0">
                {sig.signature_image ? (
                  <div className="w-32 h-16 border border-border rounded-lg bg-white flex items-center justify-center overflow-hidden">
                    <img
                      src={sig.signature_image}
                      alt={`Firma de ${sig.signer_name}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-16 border border-dashed border-border rounded-lg bg-muted/30 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">Sin firma</p>
                  </div>
                )}
                <p className="text-center text-xs text-muted-foreground mt-1.5">
                  {partyLabel[sig.party_role] || sig.party_role}
                </p>
              </div>

              {/* Metadata */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-3.5 h-3.5 shrink-0 text-accent" />
                  <div>
                    <p className="font-medium text-foreground">{sig.signer_name}</p>
                    {sig.signer_dni && <p>DNI: {sig.signer_dni}</p>}
                    {sig.signer_email && <p>{sig.signer_email}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-accent" />
                  <div>
                    <p className="font-medium text-foreground">Fecha y hora</p>
                    <p>
                      {sig.signed_at
                        ? new Date(sig.signed_at).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Monitor className="w-3.5 h-3.5 shrink-0 text-accent" />
                  <div>
                    <p className="font-medium text-foreground">Dirección IP</p>
                    <p className="font-mono">{sig.ip_address || "—"}</p>
                  </div>
                </div>

                {sig.geolocation && sig.geolocation !== "No disponible" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-accent" />
                    <div>
                      <p className="font-medium text-foreground">Ubicación aproximada</p>
                      <p>{sig.geolocation}</p>
                    </div>
                  </div>
                )}

                {sig.signature_hash && (
                  <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                    <Hash className="w-3.5 h-3.5 shrink-0 text-accent mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">Hash de verificación</p>
                      <p className="font-mono text-[10px] break-all">{sig.signature_hash}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer disclaimer */}
      <div className="px-6 py-3 bg-muted/30 border-t border-border">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Este certificado constituye prueba de la firma electrónica del documento según lo establecido en la Ley N° 25.506 de Firma Digital de la República Argentina. Los datos de IP, fecha, hora y agente de usuario quedan registrados como evidencia de autenticidad.
        </p>
      </div>
    </div>
  );
}