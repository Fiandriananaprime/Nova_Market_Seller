import React from "react"
import { Search, Play, Pause, ArrowUpDown } from "lucide-react"
import type { DeliveryFilterOptions, DeliveryStats } from "../types/deliveryTracking.types"

interface DeliveryFiltersProps {
  filters: DeliveryFilterOptions
  onChangeFilters: (filters: DeliveryFilterOptions) => void
  stats: DeliveryStats
  isSimulating: boolean
  onToggleSimulation: () => void
}

export const DeliveryFilters: React.FC<DeliveryFiltersProps> = ({
  filters,
  onChangeFilters,
  stats,
  isSimulating,
  onToggleSimulation,
}) => {
  const tabs = [
    { id: "all", label: "Toutes", count: stats.totalActive + stats.deliveredToday },
    { id: "in_transit", label: "En transit", count: stats.inTransit, badgeColor: "teal" },
    { id: "awaiting_dispatch", label: "En attente", count: stats.awaitingDispatch, badgeColor: "amber" },
    { id: "delayed", label: "Retardées", count: stats.delayed, badgeColor: "rose" },
    { id: "delivered", label: "Livrées", count: stats.deliveredToday, badgeColor: "emerald" },
  ] as const

  return (
    <div className="bg-card rounded-2xl border border-border/80 p-3.5 shadow-xs space-y-3">
      {/* Top row: Search, Sort & Simulation Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              onChangeFilters({ ...filters, search: e.target.value })
            }
            placeholder="Rechercher par référence, client, quartier, livreur..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Right side controls: Sort & GPS simulation button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Sorting */}
          <div className="flex items-center gap-1.5 bg-muted/60 border border-border/60 px-2.5 py-1.5 rounded-xl text-xs">
            <ArrowUpDown size={13} className="text-muted-foreground shrink-0" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  sortBy: e.target.value as "recent" | "eta" | "orderRef",
                })
              }
              className="bg-transparent border-0 text-foreground text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="recent">Tri : Prioritaires d'abord</option>
              <option value="eta">Tri : Heure d'arrivée (ETA)</option>
              <option value="orderRef">Tri : Référence commande</option>
            </select>
          </div>

          {/* Movement Simulation Button */}
          <button
            type="button"
            data-tour="deliveries-simulate"
            onClick={onToggleSimulation}
            title={
              isSimulating
                ? "Mettre en pause la simulation de mouvement GPS"
                : "Activer la simulation de mouvement des livreurs"
            }
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isSimulating
                ? "bg-teal-500/15 border-teal-500/40 text-teal-700 dark:text-teal-300 shadow-xs"
                : "bg-muted/60 hover:bg-muted border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {isSimulating ? (
              <>
                <Pause size={13} className="text-teal-600 dark:text-teal-400" />
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <span>Télémétrie GPS active</span>
              </>
            ) : (
              <>
                <Play size={13} className="fill-current text-muted-foreground" />
                <span>Simuler mouvement</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom row: Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 pt-1 border-t border-border/40">
        {tabs.map((tab) => {
          const isActive = filters.status === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChangeFilters({ ...filters, status: tab.id })}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                  isActive
                    ? "bg-white/20 text-white"
                    : tab.badgeColor === "rose" && tab.count > 0
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    : tab.badgeColor === "amber" && tab.count > 0
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : tab.badgeColor === "teal" && tab.count > 0
                    ? "bg-teal-500/15 text-teal-600 dark:text-teal-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
