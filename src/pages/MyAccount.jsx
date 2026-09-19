import { Link } from "react-router-dom";
import useAccountContracts from '@/components/account/useAccountContracts';
import ContractsLoadError from '@/components/account/ContractsLoadError';
import SubscriptionPanel from '@/components/account/SubscriptionPanel';
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, Plus, Clock, MapPin, ChevronRight, PenLine, Shield, ArrowRight, User
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";

const statusMap = {
  draft: { label: "Borrador", className: "bg-muted text-muted-foreground border border-border" },
  pending_payment: { label: "Pendiente de pago", className: "bg-amber-50 text-amber-800 border border-amber-200" },
  paid: { label: "Pagado", className: "bg-emerald-50 text-emerald-800 border border-emerald-200" },
  downloaded: { label: "Descargado", className: "bg-emerald-50 text-emerald-800 border border-emerald-200" },
  pending_signature: { label: "Pendiente de firma", className: "bg-secondary text-secondary-foreground border border-border" },
  signed: { label: "Firmado", className: "bg-blue-50 text-blue-800 border border-blue-200" },
};

const sigBadgeMap = {
  pending_part_a: { label: 'Esperando firma Parte A', icon: PenLine, className: 'bg-secondary text-secondary-foreground border-border' },
  pending_part_b: { label: 'Esperando firma Parte B', icon: PenLine, className: 'bg-secondary text-secondary-foreground border-border' },
  partially_signed: { label: "Firma parcial", icon: PenLine, className: "bg-amber-50 text-amber-700 border border-amber-200" },
  fully_signed: { label: "Firmado", icon: Shield, className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
};

export default function MyAccount() {
  const { user, contracts, isLoading, isError, isFetching, retry } = useAccountContracts(true);



  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header perfil */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 mb-12 pb-8 border-b border-border"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user?.full_name || "Mi cuenta"}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
        </motion.div>

        <SubscriptionPanel />

        {/* Sección Mis Contratos */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Mis contratos</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Historial de documentos generados y estado de firma</p>
            </div>
            <Link to="/crear">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-3.5 h-3.5" />
                Nuevo
              </Button>
            </Link>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/40 animate-pulse rounded" />
              ))}
            </div>
          )}

          {isError && <ContractsLoadError retry={retry} isFetching={isFetching} />}
          {/* Empty */}
          {!isLoading && !isError && contracts.length === 0 && (
            <div className="text-center py-16 border border-dashed border-border rounded">
              <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-5">No tenés contratos todavía</p>
              <Link to="/crear">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <Plus className="w-3.5 h-3.5" />
                  Crear mi primer contrato
                </Button>
              </Link>
            </div>
          )}

          {/* Lista */}
          {!isLoading && contracts.length > 0 && (
            <>
              <div className="divide-y divide-border border border-border rounded overflow-hidden">
                {contracts.map((contract, i) => {
                  const status = statusMap[contract.status] || statusMap.draft;
                  const isPaid = ['paid', 'downloaded', 'pending_signature', 'signed'].includes(contract.status);
                  const viewLink = isPaid
                    ? `/mi-cuenta/contrato/${contract.id}`
                    : `/preview/${contract.id}`;
                  const sig = sigBadgeMap[contract.signature_status];

                  return (
                    <motion.div
                      key={contract.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        to={viewLink}
                        className="group flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
                      >
                        {/* Ícono + datos */}
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-9 h-9 bg-primary/5 border border-border flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-foreground group-hover:text-accent transition-colors truncate">
                              {contract.template_name}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              {contract.province && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {contract.province}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(contract.created_date).toLocaleDateString("es-AR", {
                                  day: "2-digit", month: "short", year: "numeric"
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Badges + flecha */}
                        <div className="flex items-center gap-2 ml-4 shrink-0">
                          {sig && (
                            <Badge className={`text-xs hidden sm:flex items-center gap-1 ${sig.className}`}>
                              <sig.icon className="w-3 h-3" />
                              {sig.label}
                            </Badge>
                          )}
                          <Badge className={`text-xs ${status.className}`}>
                            {status.label}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Ver todos */}
              <div className="mt-4 text-right">
                <Link to="/mis-contratos" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline font-medium">
                  Ver todos mis contratos
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}