import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CONTRACTS, CATEGORIES } from "@/lib/contractsData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Lock } from "lucide-react";

const availableCount = CONTRACTS.filter((c) => c.available).length;

export default function ContractCatalog() {
  return (
    <section id="contratos" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">Catálogo</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            {availableCount} contratos disponibles
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Cada contrato se adapta automáticamente a las leyes de tu provincia. Más modelos en camino.
          </p>
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="mb-12 last:mb-0">
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${cat.color}`} />
              {cat.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CONTRACTS.filter((c) => c.category === cat.id).map((contract, i) => (
                <motion.div
                  key={contract.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  {contract.available ? (
                    <Link to={`/crear/${contract.category}/${contract.slug}`}>
                      <Card className="p-5 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group cursor-pointer h-full">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                            {contract.name}
                          </h4>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                          {contract.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            ~{contract.time} min
                          </div>
                          <Badge variant="secondary" className="text-xs font-semibold">
                            ${contract.price.toLocaleString("es-AR")}
                          </Badge>
                        </div>
                      </Card>
                    </Link>
                  ) : (
                    <Card className="p-5 h-full bg-muted/40 border-border/50 cursor-not-allowed select-none">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-muted-foreground/60">
                          {contract.name}
                        </h4>
                        <Lock className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                      </div>
                      <p className="text-sm text-muted-foreground/50 mb-4 leading-relaxed">
                        {contract.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/40">
                          <Clock className="w-3.5 h-3.5" />
                          ~{contract.time} min
                        </div>
                        <Badge className="text-xs font-medium bg-muted text-muted-foreground/60 border-0">
                          Próximamente
                        </Badge>
                      </div>
                    </Card>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}