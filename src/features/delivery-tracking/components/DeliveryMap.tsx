import React, { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import {
  Maximize2,
  Minimize2,
  Compass,
  Navigation,
  Route,
  X,
  Info,
  Search,
  Play,
  Pause,
  MapPin,
  Sparkles,
} from "lucide-react"
import type {
  DeliveryRecord,
  Coordinates,
  DeliveryFilterOptions,
  DeliveryStats,
} from "../types/deliveryTracking.types"
import { DeliveryMarker } from "./DeliveryMarker"
import { DeliveryTrajectory } from "./DeliveryTrajectory"
import "../styles/deliveryMap.css"

export interface DeliveryMapProps {
  deliveries: DeliveryRecord[]
  selectedDelivery: DeliveryRecord | null
  onSelectDelivery: (record: DeliveryRecord) => void
  onClearSelection?: () => void
  onOpenDetails?: () => void
  focusRequest?: { id: string; coordinates: Coordinates; timestamp: number } | null
  showTrajectories?: boolean
  onToggleTrajectories?: () => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  filters?: DeliveryFilterOptions
  onChangeFilters?: (filters: DeliveryFilterOptions) => void
  stats?: DeliveryStats
  isSimulating?: boolean
  onToggleSimulation?: () => void
}

/**
 * Bridge component that securely captures the active Leaflet L.Map instance
 * via useMap hook and provides it to the parent DeliveryMap.
 */
function MapInstanceBridge({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap()
  useEffect(() => {
    onMapReady(map)
  }, [map, onMapReady])
  return null
}

/**
 * Controller component to handle smooth pan/zoom, bounds fitting,
 * and live courier tracking.
 */
function MapViewController({
  deliveries,
  selectedDelivery,
  focusRequest,
}: {
  deliveries: DeliveryRecord[]
  selectedDelivery: DeliveryRecord | null
  focusRequest?: { id: string; coordinates: Coordinates; timestamp: number } | null
}) {
  const map = useMap()
  const prevSelectedIdRef = useRef<string | null>(null)
  const prevFocusTimestampRef = useRef<number | null>(null)
  const hasInitializedBoundsRef = useRef(false)

  // Explicit centering requests (always fires when button is clicked)
  useEffect(() => {
    if (focusRequest && focusRequest.timestamp !== prevFocusTimestampRef.current) {
      prevFocusTimestampRef.current = focusRequest.timestamp
      map.flyTo(
        [focusRequest.coordinates.lat, focusRequest.coordinates.lng],
        16,
        { duration: 1.0 }
      )
    }
  }, [focusRequest, map])

  // When a different delivery is selected, smoothly fly to its coordinates
  useEffect(() => {
    if (selectedDelivery && selectedDelivery.id !== prevSelectedIdRef.current) {
      prevSelectedIdRef.current = selectedDelivery.id
      map.flyTo(
        [selectedDelivery.coordinates.lat, selectedDelivery.coordinates.lng],
        16,
        { duration: 1.2 }
      )
    } else if (!selectedDelivery) {
      prevSelectedIdRef.current = null
    }
  }, [selectedDelivery, map])

  // Follow courier movement during simulation if courier is actively selected
  useEffect(() => {
    if (selectedDelivery) {
      map.panTo([selectedDelivery.coordinates.lat, selectedDelivery.coordinates.lng], {
        animate: true,
        duration: 0.8,
      })
    }
  }, [selectedDelivery, map])

  // Fit bounds ONLY ONCE on initial map load - never re-triggers when unselecting
  useEffect(() => {
    if (!hasInitializedBoundsRef.current && deliveries.length > 0) {
      hasInitializedBoundsRef.current = true
      const bounds = L.latLngBounds(
        deliveries.map((d) => [d.coordinates.lat, d.coordinates.lng])
      )
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 })
      }
    }
  }, [deliveries, map])

  return null
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  deliveries,
  selectedDelivery,
  onSelectDelivery,
  onClearSelection,
  onOpenDetails,
  focusRequest,
  showTrajectories = true,
  onToggleTrajectories,
  isFullscreen = false,
  onToggleFullscreen,
  filters,
  onChangeFilters,
  stats,
  isSimulating,
  onToggleSimulation,
}) => {
  // Antananarivo center coordinates
  const defaultCenter: [number, number] = [-18.8925, 47.521]
  const defaultZoom = 13

  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)

  // Invalidate map size on fullscreen toggle so Leaflet resizes smoothly without blank tiles
  useEffect(() => {
    if (mapInstance) {
      const timer = setTimeout(() => {
        mapInstance.invalidateSize()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isFullscreen, mapInstance])

  // Escape key listener to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        onToggleFullscreen?.()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen, onToggleFullscreen])

  // 100% reliable center-all handler using real Leaflet L.Map instance
  const handleFitAll = () => {
    if (mapInstance && deliveries.length > 0) {
      const bounds = L.latLngBounds(
        deliveries.map((d) => [d.coordinates.lat, d.coordinates.lng])
      )
      if (bounds.isValid()) {
        mapInstance.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 })
      }
      onClearSelection?.()
    } else if (mapInstance) {
      mapInstance.setView(defaultCenter, defaultZoom)
      onClearSelection?.()
    }
  }

  // Centering on currently selected courier
  const handleCenterOnSelected = () => {
    if (mapInstance && selectedDelivery) {
      mapInstance.flyTo(
        [selectedDelivery.coordinates.lat, selectedDelivery.coordinates.lng],
        16,
        { duration: 1.0 }
      )
    }
  }

  // Status tabs definition for fullscreen filter bar
  const statusTabs = stats
    ? [
        { id: "all", label: "Toutes", count: stats.totalActive + stats.deliveredToday },
        { id: "in_transit", label: "En transit", count: stats.inTransit },
        { id: "awaiting_dispatch", label: "En attente", count: stats.awaitingDispatch },
        { id: "delayed", label: "Retardées", count: stats.delayed },
        { id: "delivered", label: "Livrées", count: stats.deliveredToday },
      ]
    : []

  return (
    <div
      id="delivery-map-wrapper"
      className={
        isFullscreen
          ? "fixed inset-0 z-[1000] w-screen h-screen bg-background flex flex-col overflow-hidden animate-fade-in"
          : "relative w-full h-full min-h-[500px] lg:min-h-[620px] rounded-3xl overflow-hidden border border-border/80 shadow-xs bg-muted/40"
      }
    >
      {/* ── Fullscreen Interactive Command Bar ── */}
      {isFullscreen && (
        <div className="bg-card/95 backdrop-blur-md border-b border-border/80 px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm z-[1100] shrink-0">
          {/* Left: Brand title & live status indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-primary font-display font-bold text-sm">
              <MapPin size={18} className="text-primary" />
              <span className="hidden sm:inline">Nova Market Logistics</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">
                Plein Écran
              </span>
            </div>

            {isSimulating && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                <Sparkles size={11} className="animate-spin text-teal-500" />
                GPS Actif
              </span>
            )}
          </div>

          {/* Center: Search input & Status Filter Badges */}
          <div className="flex items-center gap-2.5 flex-1 max-w-2xl justify-center">
            {/* Fullscreen Search Input */}
            {filters && onChangeFilters && (
              <div className="relative w-40 sm:w-60 md:w-72">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    onChangeFilters({ ...filters, search: e.target.value })
                  }
                  placeholder="Recherche..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => onChangeFilters({ ...filters, search: "" })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Status Filter Chips */}
            {filters && onChangeFilters && statusTabs.length > 0 && (
              <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
                {statusTabs.map((tab) => {
                  const isActive = filters.status === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        onChangeFilters({
                          ...filters,
                          status: tab.id as DeliveryFilterOptions["status"],
                        })
                      }
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? "bg-primary text-white shadow-xs font-bold"
                          : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-background text-foreground font-mono"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: Quick Actions & Exit Fullscreen Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* GPS Simulation Toggle */}
            {onToggleSimulation && (
              <button
                type="button"
                onClick={onToggleSimulation}
                className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSimulating
                    ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30"
                    : "bg-card hover:bg-muted text-muted-foreground border-border/80"
                }`}
                title={isSimulating ? "Pause télémétrie" : "Démarrer simulation GPS"}
              >
                {isSimulating ? <Pause size={14} /> : <Play size={14} />}
                <span className="hidden xl:inline">
                  {isSimulating ? "Pause GPS" : "Simuler GPS"}
                </span>
              </button>
            )}

            {/* Overview / Fit Bounds Button */}
            <button
              type="button"
              onClick={handleFitAll}
              className="p-2 rounded-xl bg-card hover:bg-muted text-foreground border border-border/80 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
              title="Recentrer sur toutes les livraisons"
            >
              <Compass size={14} className="text-primary" />
              <span className="hidden xl:inline">Vue d'ensemble</span>
            </button>

            {/* Exit Fullscreen Button */}
            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
                title="Quitter le plein écran (Échap)"
              >
                <Minimize2 size={14} />
                <span>Quitter</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Main Map Canvas Container ── */}
      <div className={isFullscreen ? "relative w-full flex-1" : "relative w-full h-full"}>
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          scrollWheelZoom={true}
          className="delivery-map-container"
        >
          {/* OpenStreetMap Standard Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributeurs'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Bridge to register real L.Map instance */}
          <MapInstanceBridge onMapReady={setMapInstance} />

          {/* Viewport controller */}
          <MapViewController
            deliveries={deliveries}
            selectedDelivery={selectedDelivery}
            focusRequest={focusRequest}
          />

          {/* ── Trajectory Polylines & Destination Points ── */}
          {showTrajectories &&
            deliveries.map((delivery) => {
              const isSelected = selectedDelivery?.id === delivery.id
              return (
                <DeliveryTrajectory
                  key={`trajectory-${delivery.id}`}
                  delivery={delivery}
                  isSelected={isSelected}
                  onSelect={onSelectDelivery}
                />
              )
            })}

          {/* ── Courier Markers ── */}
          {deliveries.map((delivery) => (
            <DeliveryMarker
              key={`marker-${delivery.id}`}
              record={delivery}
              isSelected={selectedDelivery?.id === delivery.id}
              onSelect={onSelectDelivery}
            />
          ))}
        </MapContainer>

        {/* Floating Map Controls & Overlays (Top-Right) */}
        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
          {/* Toggle Full Screen Button */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              title={
                isFullscreen
                  ? "Quitter le mode plein écran (Échap)"
                  : "Afficher la carte en plein écran"
              }
              className="p-2.5 rounded-xl bg-card/95 hover:bg-card text-foreground border border-border/80 shadow-md backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold hover:shadow-lg active:scale-95"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 size={15} className="text-primary" />
                  <span className="hidden sm:inline">Quitter plein écran</span>
                </>
              ) : (
                <>
                  <Maximize2 size={15} className="text-primary" />
                  <span className="hidden sm:inline">Plein écran</span>
                </>
              )}
            </button>
          )}

          {/* Overview Button (Fit All Bounds) - Only if not already in top bar */}
          {!isFullscreen && (
            <button
              type="button"
              onClick={handleFitAll}
              title="Recentrer sur toutes les livraisons (Vue globale)"
              className="p-2.5 rounded-xl bg-card/95 hover:bg-card text-foreground border border-border/80 shadow-md backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold hover:shadow-lg active:scale-95"
            >
              <Compass size={15} className="text-primary" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </button>
          )}

          {/* Center on selected courier (when a delivery is active) */}
          {selectedDelivery && (
            <button
              type="button"
              onClick={handleCenterOnSelected}
              title="Centrer la caméra sur le coursier suivi"
              className="p-2.5 rounded-xl bg-primary text-white border border-primary/40 shadow-md backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold hover:bg-primary/90 active:scale-95"
            >
              <Navigation size={15} />
              <span className="hidden sm:inline">Centrer coursier</span>
            </button>
          )}

          {/* Toggle Trajectories Lines Button */}
          {onToggleTrajectories && (
            <button
              type="button"
              onClick={onToggleTrajectories}
              title="Afficher ou masquer les lignes d'itinéraire"
              className={`p-2.5 rounded-xl border shadow-md backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold active:scale-95 ${
                showTrajectories
                  ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30"
                  : "bg-card/95 hover:bg-card text-muted-foreground border-border/80"
              }`}
            >
              <Route size={15} />
              <span className="hidden sm:inline">
                Trajectoires : {showTrajectories ? "Actives" : "Masquées"}
              </span>
            </button>
          )}
        </div>

        {/* Floating Status & Trajectory Legend (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-[400] bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-2.5 shadow-lg hidden md:flex flex-col gap-2 text-xs">
          {/* Status markers */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-muted-foreground font-medium">En transit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-muted-foreground font-medium">En attente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-muted-foreground font-medium">Retardé</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground font-medium">Livré</span>
            </div>
          </div>

          {/* Trajectory line legend */}
          {showTrajectories && (
            <div className="pt-1.5 border-t border-border/60 flex items-center gap-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-teal-500 rounded-full" />
                <span>Parcouru</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 border-t border-dashed border-primary" />
                <span>Itinéraire restant</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📍</span>
                <span>Point de livraison</span>
              </div>
            </div>
          )}
        </div>

        {/* Active Live Tracking Floating Pill (Top-Left) */}
        {selectedDelivery && (
          <div className="absolute top-4 left-4 z-[400] bg-card/95 backdrop-blur-md border border-primary/40 rounded-2xl p-3 shadow-xl max-w-sm flex items-center justify-between gap-3 animate-fade-in ring-1 ring-primary/20">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                </span>
                <span className="font-display font-bold text-xs text-foreground truncate">
                  {selectedDelivery.orderReference}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary shrink-0">
                  {selectedDelivery.destination.district}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {selectedDelivery.driver?.name ?? "Livreur assigné"} •{" "}
                {selectedDelivery.destination.recipientName}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Recenter Button */}
              <button
                type="button"
                onClick={handleCenterOnSelected}
                className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold cursor-pointer transition-colors"
                title="Recentrer la caméra sur ce coursier"
              >
                <Navigation size={13} />
              </button>

              {/* Reopen Details Button */}
              {onOpenDetails && (
                <button
                  type="button"
                  onClick={onOpenDetails}
                  className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                  title="Ouvrir la fiche détaillée"
                >
                  <Info size={12} />
                  <span>Détails</span>
                </button>
              )}

              {/* Stop Tracking Button */}
              {onClearSelection && (
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer transition-colors"
                  title="Arrêter le suivi de ce coursier"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty State Overlay if 0 deliveries match filters */}
        {deliveries.length === 0 && (
          <div className="absolute inset-0 z-[400] bg-card/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <Compass size={24} />
            </div>
            <h3 className="font-display font-bold text-sm text-foreground">
              Aucune livraison correspondante
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              Modifiez vos filtres ou effectuez une autre recherche pour afficher des coursiers.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
