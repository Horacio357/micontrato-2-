import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Check, Shield, FileText, AlertCircle } from "lucide-react";

const DOCS = [
  { key: "tos", title: "Términos y Condiciones", Icon: FileText },
  { key: "privacy", title: "Política de Privacidad", Icon: Shield },
  { key: "disclaimer", title: "Aviso Legal", Icon: AlertCircle },
];

export default function AdminLegal() {
  const queryClient = useQueryClient();
  const [activeDoc, setActiveDoc] = useState("tos");
  const [contents, setContents] = useState({});
  const [saved, setSaved] = useState(false);

  const { data: legalDocs = [] } = useQuery({
    queryKey: ["admin-legal-docs"],
    queryFn: () => base44.entities.LegalDocument.list(),
  });

  // Populate contents from DB
  useEffect(() => {
    if (legalDocs.length > 0) {
      const map = Object.fromEntries(legalDocs.map((d) => [d.key, d.content || ""]));
      setContents((prev) => ({ ...prev, ...map }));
    }
  }, [legalDocs]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const doc = DOCS.find((d) => d.key === activeDoc);
      const existing = legalDocs.find((d) => d.key === activeDoc);
      if (existing) {
        await base44.entities.LegalDocument.update(existing.id, { content: contents[activeDoc] });
      } else {
        await base44.entities.LegalDocument.create({
          key: activeDoc,
          title: doc.title,
          content: contents[activeDoc],
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-legal-docs"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const currentDoc = DOCS.find((d) => d.key === activeDoc);

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Admin</p>
          <h1 className="font-display text-4xl font-semibold text-foreground">Legal</h1>
          <p className="text-sm text-muted-foreground mt-1">Editá los documentos legales de la plataforma</p>
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={saved ? "bg-emerald-600 hover:bg-emerald-600 text-white" : "bg-primary hover:bg-primary/90 text-primary-foreground"}
        >
          {saved ? (
            <><Check className="w-4 h-4 mr-2" />Guardado</>
          ) : saveMutation.isPending ? "Guardando..." : (
            <><Save className="w-4 h-4 mr-2" />Guardar</>
          )}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-52 shrink-0 space-y-1">
          {DOCS.map(({ key, title, Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveDoc(key); setSaved(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors border ${
                activeDoc === key
                  ? "border-accent bg-accent/5 text-accent font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {title}
            </button>
          ))}
        </div>

        {/* Editor */}
        <Card className="flex-1 border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            {currentDoc && <currentDoc.Icon className="w-4 h-4 text-muted-foreground" />}
            <p className="text-sm font-medium text-foreground">{currentDoc?.title}</p>
          </div>
          <div className="p-4">
            <textarea
              className="w-full h-[60vh] bg-background border border-border p-4 text-sm text-foreground font-mono resize-none focus:outline-none focus:border-accent transition-colors"
              value={contents[activeDoc] || ""}
              onChange={(e) => setContents((c) => ({ ...c, [activeDoc]: e.target.value }))}
              placeholder="Ingresá el contenido del documento..."
            />
          </div>
          <div className="px-6 pb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Los cambios se guardan en la base de datos al presionar "Guardar"</span>
          </div>
        </Card>
      </div>
    </div>
  );
}