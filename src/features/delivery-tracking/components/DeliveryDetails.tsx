import React, { useState } from "react"
import {
  X,
  MapPin,
  Bike,
  Truck,
  Phone,
  Navigation,
} from "lucide-react"
import type { DeliveryRecord } from "../types/deliveryTracking.types"
import { formatMGA } from "@/hook/format"

interface DeliveryDetailsProps {
  delivery: DeliveryRecord | null
  onClose: () => void
  onFocusOnMap?: (record: DeliveryRecord) => void
}

export const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({
  delivery,
  onClose,
  onFocusOnMap,
}) => {
  const [justCentered, setJustCentered] = useState(false)

  if (!delivery) return null

  const handleCenter = () => {
    if (delivery && onFocusOnMap) {
      onFocusOnMap(delivery)
      setJustCentered(true)
      setTimeout(() => setJustCentered(false), 2000)
    }
  }

  const statusLabel =
    delivery.status === "in_transit"
      ? "En cours de livraison"
      : delivery.status === "delayed"
      ? "Retardé"
      : delivery.status === "delivered"
      ? "Livré avec succès"
      : "En attente d'expédition"

  const statusColor =
    delivery.status === "in_transit"
      ? "text-teal-600 dark:text-teal-400 bg-teal-500/15 border-teal-500/30"
      : delivery.status === "delayed"
      ? "text-rose-600 dark:text-rose-400 bg-rose-500/15 border-rose-500/30"
      : delivery.status === "delivered"
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30"
      : "text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/30"

  return (
    <div className="fixed inset-0 z-[2000] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-Over Drawer Content */}
      <div className="relative w-full max-w-lg bg-card border-l border-border h-full flex flex-col shadow-2xl z-10 animate-slide-down">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display font-extrabold text-lg text-foreground tracking-tight">
                {delivery.orderReference}
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusColor}`}
              >
                {statusLabel}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Identifiant de suivi : <span className="font-mono">{delivery.id}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Urgent Delay Alert if applicable */}
          {delivery.isDelayed && delivery.delayReason && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold text-xs text-rose-700 dark:text-rose-300">
                  Notification d'incident logistique
                </p>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                  {delivery.delayReason}
                </p>
              </div>
            </div>
          )}

          {/* Timeline Tracking Stepper */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Chronologie d'acheminement
            </h4>

            <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
              {delivery.timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center ${
                      idx === delivery.timeline.length - 1
                        ? "bg-primary ring-4 ring-primary/20"
                        : "bg-muted-foreground/40"
                    }`}
                  />
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-xs text-foreground">
                      {event.label}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {event.timestamp}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {event.description}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-[10px] text-primary/80 font-medium mt-0.5">
                      📍 {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Driver Card */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Coursier & Véhicule
            </h4>

            {delivery.driver ? (
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {delivery.driver.vehicleType === "motorcycle" ? (
                      <Bike size={18} />
                    ) : (
                      <Truck size={18} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display font-bold text-sm text-foreground">
                        {delivery.driver.name}
                      </p>
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded">
                        ★ {delivery.driver.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Plaque : {delivery.driver.vehiclePlate ?? "Non renseignée"}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${delivery.driver.phone}`}
                  className="p-2.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                >
                  <Phone size={14} className="text-primary" />
                  <span className="hidden sm:inline">Appeler</span>
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-muted/20 border border-dashed border-border/80 text-center text-xs text-muted-foreground">
                Colis en cours d'attribution à un coursier
              </div>
            )}
          </div>

          {/* Destination Details */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Point de livraison & Destinataire
            </h4>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">
                    {delivery.destination.recipientName}
                  </p>
                  <p className="text-muted-foreground">
                    {delivery.destination.street}, {delivery.destination.district}
                  </p>
                  <p className="text-muted-foreground font-semibold">
                    {delivery.destination.city} (CP: {delivery.destination.postalCode ?? "101"})
                  </p>
                  {delivery.destination.instructions && (
                    <p className="text-primary mt-1.5 bg-primary/10 p-2 rounded-lg font-medium text-[11px]">
                      💬 Note : {delivery.destination.instructions}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Contact client :</span>
                <span className="font-semibold text-foreground font-mono">
                  {delivery.destination.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Package Content & Items */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Contenu du colis ({delivery.items.length} articles)
            </h4>

            <div className="rounded-2xl border border-border/80 divide-y divide-border/60 overflow-hidden">
              {delivery.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-card flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Quantité : {item.qty}
                    </p>
                  </div>
                  <span className="font-bold text-foreground tabular-nums">
                    {formatMGA(item.price * item.qty)}
                  </span>
                </div>
              ))}
              <div className="p-3 bg-muted/30 flex items-center justify-between text-xs font-bold">
                <span>Total commande :</span>
                <span className="text-primary text-sm tabular-nums">
                  {formatMGA(delivery.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* GPS Telemetry Metadata */}
          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 text-[11px] space-y-1 font-mono text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Coordonnées GPS :</span>
              <span className="text-foreground">
                {delivery.coordinates.lat.toFixed(5)}, {delivery.coordinates.lng.toFixed(5)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Dernier ping réseau :</span>
              <span className="text-foreground">{delivery.lastUpdate}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card/80 backdrop-blur-xs flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            Fermer
          </button>

          {onFocusOnMap && (
            <button
              type="button"
              onClick={handleCenter}
              className={`px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95 ${
                justCentered
                  ? "bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-500/30"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              <Navigation size={14} className={justCentered ? "rotate-45 transition-transform" : ""} />
              <span>{justCentered ? "Centré sur la carte ✓" : "Centrer sur la carte"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
