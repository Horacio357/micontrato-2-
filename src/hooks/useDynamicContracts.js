import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CONTRACTS } from "@/lib/contractsData";

export function useDynamicContracts() {
  const { data: dbTemplates = [], isLoading } = useQuery({
    queryKey: ["public-contract-templates"],
    queryFn: async () => {
      try {
        const templates = await base44.entities.ContractTemplate.list("name", 100);
        return Array.isArray(templates) ? templates : [];
      } catch (err) {
        console.warn("No se pudieron cargar plantillas dinámicas, usando base estática:", err);
        return [];
      }
    },
    staleTime: 60 * 1000, // 1 minuto
  });

  const templatesBySlug = new Map(dbTemplates.map((t) => [t.slug, t]));

  // Combinar los contratos base con los datos dinámicos guardados por el admin
  const mergedContracts = CONTRACTS.map((contract) => {
    const dbTmpl = templatesBySlug.get(contract.slug);
    if (!dbTmpl) return contract;

    return {
      ...contract,
      name: dbTmpl.name || contract.name,
      description: dbTmpl.description || contract.description,
      price: typeof dbTmpl.price === "number" ? dbTmpl.price : contract.price,
      available: dbTmpl.is_active !== undefined ? dbTmpl.is_active : contract.available,
    };
  });

  return { contracts: mergedContracts, isLoading };
}
