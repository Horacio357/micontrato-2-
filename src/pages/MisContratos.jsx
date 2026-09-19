import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAccountContracts from '@/components/account/useAccountContracts';
import ContractsLoadError from '@/components/account/ContractsLoadError';
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, Plus, Download, Eye, Pencil, Clock, MapPin, Trash2, ChevronRight, PenLine, Shield, Search, X, ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/landing/Navbar";

const statusMap = {
  draft: { label: "Borrador", className: "bg-muted text-muted-foreground border border-border" },
  pending_payment: { label: "Pendiente de pago", className: "bg-amber-50 text-amber-800 border border-amber-200" },
  paid: { label: "Pagado", className: "bg-emerald-50 text-emerald-800 border border-emerald-200" },
  downloaded: { label: "Descargado", className: "bg-emerald-50 text-emerald-800 border border-emerald-200" },
  pending_signature: { label: "Pendiente de firma", className: "bg-secondary text-secondary-foreground border border-border" },
  signed: { label: "Firmado digitalmente", className: "bg-blue-50 text-blue-800 border border-blue-200" },
};

const sigBadgeMap = {
  pending_part_a: { label: 'Esperando firma Parte A', icon: PenLine, className: 'bg-secondary text-secondary-foreground border-border' },
  pending_part_b: { label: 'Esperando firma Parte B', icon: PenLine, className: 'bg-secondary text-secondary-foreground border-border' },
  partially_signed: { label: "Firma parcial", icon: PenLine, className: "bg-amber-50 text-amber-700 border-amber-200" },
  fully_signed: { label: "Firmado", icon: Shield, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const categoryLabel = {
  inmobiliario: "Inmobiliario",
  laboral: "Laboral",
  comercial: "Comercial",
  civil: "Civil",
};

export default function MisContratos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const { contracts, isLoading, isError, isFetching, retry } = useAccountContracts();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GeneratedContract.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-contracts"] });
      setDeletingId(null);
    },
    onError: () => setDeletingId(null),
  });

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("¿Estás seguro de que querés eliminar este contrato?")) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (e, contract) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/generar/${contract.template_id}/${contract.province}?edit=${contract.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Panel</p>
            <h1 className="font-display text-4xl font-semibold text-foreground">Mis contratos</h1>
          </div>
          <Link to="/crear">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm gap-2">
              <Plus className="w-4 h-4" />
              Nuevo contrato
            </Button>
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/40 animate-pulse" />
            ))}
          </div>
        )}

        {isError && <ContractsLoadError retry={retry} isFetching={isFetching} />}
        {deleteMutation.isError && <p role="alert" className="my-4 text-sm text-destructive">No se pudo eliminar el contrato. Intentá nuevamente.</p>}
        {/* Empty */}
        {!isLoading && !isError && contracts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-28"
          >
            <FileText className="w-12 h-12 text-muted-foreground/25 mx-auto mb-5" />
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              No tenés contratos todavía
            </h2>
            <p className="text-muted-foreground mb-8 text-sm">
              Creá tu primer contrato legal en pocos minutos.
            </p>
            <Link to="/crear">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                Crear mi primer contrato
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Contract list */}
        {!isLoading && contracts.length > 0 && (
          <>
            {/* Search bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 pr-9"
                placeholder="Buscar por tipo de contrato, provincia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

          <div className="divide-y divide-border border-t border-b border-border">
            {contracts.filter((c) => {
              if (!search) return true;
              const q = search.toLowerCase();
              return (
                c.template_name?.toLowerCase().includes(q) ||
                c.province?.toLowerCase().includes(q) ||
                c.category?.toLowerCase().includes(q) ||
                c.created_by?.toLowerCase().includes(q) ||
                Object.values(c.form_data || {}).some((v) =>
                  String(v).toLowerCase().includes(q)
                )
              );
            }).map((contract, i) => {
              const status = statusMap[contract.status] || statusMap.draft;
              const isPaid = ['paid', 'downloaded', 'pending_signature', 'signed'].includes(contract.status);
              const viewLink = isPaid
                ? `/mi-cuenta/contrato/${contract.id}`
                : `/preview/${contract.id}`;
              const needsSignature = isPaid && contract.signature_status !== "fully_signed";

              // CTA principal según el estado del contrato.
              let primaryCta = null;
              if (contract.status === "draft") {
                primaryCta = { label: "Continuar", to: `/generar/${contract.template_id}/${contract.province}?edit=${contract.id}` };
              } else if (!isPaid) {
                primaryCta = { label: "Finalizar y descargar", to: `/preview/${contract.id}` };
              } else if (needsSignature) {
                primaryCta = { label: "Compartir para firma", to: `/mi-cuenta/contrato/${contract.id}` };
              }

              return (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`group flex items-center justify-between py-5 px-2 hover:bg-secondary/50 transition-colors ${deletingId === contract.id ? "opacity-40 pointer-events-none" : ""}`}
                >
                  {/* Left: info */}
                  <Link to={viewLink} className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/5 border border-border flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground group-hover:text-accent transition-colors truncate">
                        {contract.template_name}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
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
                        {contract.category && (
                          <span className="text-xs text-muted-foreground">
                            {categoryLabel[contract.category] || contract.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Right: badge + actions */}
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    {/* Signature badge */}
                    {sigBadgeMap[contract.signature_status] && (() => {
                      const sb = sigBadgeMap[contract.signature_status];
                      const SbIcon = sb.icon;
                      return (
                        <Badge className={`text-xs font-medium border ${sb.className} hidden sm:flex items-center gap-1`}>
                          <SbIcon className="w-3 h-3" />
                          {sb.label}
                        </Badge>
                      );
                    })()}

                    <Badge className={`text-xs font-medium ${status.className}`}>
                      {status.label}
                    </Badge>

                    {/* CTA principal siempre visible */}
                    {primaryCta && (
                      <Link to={primaryCta.to} onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" className="hidden sm:flex bg-accent hover:bg-accent/90 text-accent-foreground text-xs gap-1.5">
                          {primaryCta.label}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Ver */}
                      <Link to={viewLink}>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground" title="Ver contrato">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>

                      {/* Editar (solo si es borrador o pagado) */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-foreground"
                        title="Editar datos"
                        onClick={(e) => handleEdit(e, contract)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      {/* Descargar (solo si está pagado) */}
                      {isPaid && (
                        <Link to={`/mi-cuenta/contrato/${contract.id}`}>
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-accent hover:text-accent/80" title="Descargar">
                            <Download className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}

                      {/* Firmar digitalmente */}
                      {isPaid && contract.signature_status !== "fully_signed" && (
                        <Link to={`/mi-cuenta/contrato/${contract.id}`}>
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-emerald-600 hover:text-emerald-700" title="Firmar digitalmente">
                            <PenLine className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}

                      {/* Eliminar */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive"
                        title="Eliminar"
                        onClick={(e) => handleDelete(e, contract.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                </motion.div>
              );
            })}
          </div>
          </>
        )}

        {/* Stats footer */}
        {!isLoading && contracts.length > 0 && (
          <p className="text-xs text-muted-foreground mt-6 text-right">
            {contracts.length} contrato{contracts.length !== 1 ? "s" : ""} en total
          </p>
        )}
      </div>
    </div>
  );
}