import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CONTRACTS, CATEGORIES } from "@/lib/contractsData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, ArrowLeft, Lock } from "lucide-react";
import Navbar from "@/components/landing/Navbar";

export default function SelectContract() {
  const { categoria } = useParams();
  const category = CATEGORIES.find((c) => c.id === categoria);
  const contracts = CONTRACTS.filter((c) => c.category === categoria);

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Categoría no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/crear">
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Categorías
          </Button>
        </Link>

        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-4"
          >
            Paso 2 de 4 · {category.name}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-foreground"
          >
            Elegí tu contrato
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {contracts.map((contract, i) => (
            <motion.div
              key={contract.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
            >
              {contract.available ? (
                <Link to={`/crear/${categoria}/${contract.slug}`}>
                  <Card className="p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group cursor-pointer h-full flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                          {contract.name}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{contract.description}</p>
                      <p className="text-xs text-muted-foreground/70 italic mb-4">{contract.whenToUse}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        ~{contract.time} min
                      </div>
                      <Badge variant="secondary" className="font-semibold">
                        ${contract.price.toLocaleString("es-AR")}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ) : (
                <Card className="p-6 h-full flex flex-col bg-muted/40 border-border/50 cursor-not-allowed select-none">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-muted-foreground/60">
                        {contract.name}
                      </h3>
                      <Lock className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-1" />
                    </div>
                    <p className="text-sm text-muted-foreground/50 mb-2">{contract.description}</p>
                    <p className="text-xs text-muted-foreground/40 italic mb-4">{contract.whenToUse}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/40">
                      <Clock className="w-3.5 h-3.5" />
                      ~{contract.time} min
                    </div>
                    <Badge className="font-medium bg-muted text-muted-foreground/60 border-0">
                      Próximamente
                    </Badge>
                  </div>
                </Card>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}