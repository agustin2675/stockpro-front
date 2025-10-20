import InsumoListSucursal from "./InsumoListSucursal.jsx";

export default function RubroListSucursal({
  rubros = [],
  insumosHabPorRubro = new Map(),
  sucursalId,
  sucursalInsumo = [],
  unidades = [],
  disabled = false,
  currentTipoStockId, // 👈 nuevo
}) {
  if (!rubros?.length) {
    return (
      <div
        className="rounded-lg border p-3 text-sm"
        style={{ borderColor: "var(--frame)", color: "var(--graphite)" }}
      >
        No hay rubros con insumos para este tipo de stock.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rubros.map((rubro) => {
        const insumosHab = insumosHabPorRubro.get(Number(rubro.id)) ?? [];
        return (
          <section
            key={rubro.id}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: "var(--frame)", backgroundColor: "#FFFFFF" }}
          >
            <header
              className="px-3 sm:px-4 py-2 border-b sticky top-0 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70"
              style={{ borderColor: "var(--frame)", background: "var(--surface, #fafafa)" }}
            >
              <h4 className="font-medium text-sm sm:text-base truncate">
                {rubro?.nombre ?? `Rubro #${rubro?.id}`}
              </h4>
            </header>
            <div className="p-2 sm:p-3">
              <InsumoListSucursal
                insumos={insumosHab}
                sucursalId={sucursalId}
                sucursalInsumo={sucursalInsumo}
                unidades={unidades}
                disabled={disabled}
                currentTipoStockId={currentTipoStockId} // 👈 pasa el tipo actual
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
