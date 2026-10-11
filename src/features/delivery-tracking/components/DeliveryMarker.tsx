import React, { useMemo } from "react"
import { Marker, Popup } from "react-leaflet"
import L from "leaflet"
import type { DeliveryRecord } from "../types/deliveryTracking.types"
import { formatMGA } from "@/hook/format"

interface DeliveryMarkerProps {
  record: DeliveryRecord
  isSelected: boolean
  onSelect: (record: DeliveryRecord) => void
}

export const DeliveryMarker: React.FC<DeliveryMarkerProps> = ({
  record,
  isSelected,
  onSelect,
}) => {
  const icon = useMemo(() => {
    const isMoving = record.status === "in_transit"
    const isDelayed = record.status === "delayed"

    let glowColor = "rgba(90, 188, 185, 0.5)"
    let pinIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h1"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`

    if (record.status === "delayed") {
      glowColor = "rgba(225, 29, 72, 0.5)"
      pinIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
    } else if (record.status === "awaiting_dispatch") {
      glowColor = "rgba(217, 119, 6, 0.45)"
      pinIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
    } else if (record.status === "delivered") {
      glowColor = "rgba(0, 168, 120, 0.45)"
      pinIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`
    }

    const radarHtml =
      isMoving || isDelayed
        ? `<div class="delivery-radar-pulse ${isDelayed ? "delayed" : ""}"></div>`
        : ""

    const selectedRing = isSelected
      ? `box-shadow: 0 0 0 4px #0077B6, 0 12px 28px ${glowColor};`
      : `box-shadow: 0 6px 18px ${glowColor};`

    const html = `
      <div class="delivery-marker-icon-wrapper ${isSelected ? "selected" : ""}">
        ${radarHtml}
        <div style="
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          background: linear-gradient(135deg, ${record.status === "delayed" ? "#E11D48, #FB7185" : record.status === "delivered" ? "#059669, #34D399" : record.status === "awaiting_dispatch" ? "#D97706, #FBBF24" : "#0077B6, #5ABCB9"});
          border: 2.5px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
          z-index: 2;
          ${selectedRing}
        ">
          ${pinIcon}
        </div>
        <div style="
          position: absolute;
          bottom: -4px;
          width: 8px;
          height: 8px;
          background: #FFFFFF;
          border-radius: 9999px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          z-index: 1;
        "></div>
      </div>
    `

    return L.divIcon({
      html,
      className: "",
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    })
  }, [record.status, isSelected])

  const statusLabel =
    record.status === "in_transit"
      ? "En cours de livraison"
      : record.status === "delayed"
      ? "Retardé"
      : record.status === "delivered"
      ? "Livré"
      : "En attente d'expédition"

  const statusBadgeBg =
    record.status === "in_transit"
      ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30"
      : record.status === "delayed"
      ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
      : record.status === "delivered"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
      : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"

  return (
    <Marker
      position={[record.coordinates.lat, record.coordinates.lng]}
      icon={icon}
      zIndexOffset={isSelected ? 10000 : 10}
      eventHandlers={{
        click: () => onSelect(record),
      }}
    >
      <Popup className="delivery-custom-popup" minWidth={260} maxWidth={320}>
        <div className="p-4 space-y-3 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
            <span className="font-display font-bold text-sm text-foreground">
              {record.orderReference}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeBg}`}
            >
              {statusLabel}
            </span>
          </div>

          {/* Details body */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-1.5">
              <span className="text-muted-foreground font-medium shrink-0">Client :</span>
              <span className="font-semibold text-foreground truncate">
                {record.destination.recipientName} ({record.destination.district})
              </span>
            </div>

            {record.driver && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-medium shrink-0">Livreur :</span>
                <span className="font-medium text-foreground truncate">
                  {record.driver.name}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-muted-foreground">Total commande :</span>
              <span className="font-bold text-foreground">
                {formatMGA(record.totalAmount)}
              </span>
            </div>

            {record.estimatedArrival && record.status === "in_transit" && (
              <div className="flex items-center justify-between text-[11px] bg-primary/10 text-primary px-2 py-1 rounded-lg font-medium">
                <span>Arrivée estimée :</span>
                <span className="font-bold">
                  {new Date(record.estimatedArrival).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}

            {record.isDelayed && record.delayReason && (
              <div className="text-[11px] bg-rose-500/10 text-rose-600 dark:text-rose-400 p-2 rounded-lg font-medium">
                ⚠️ {record.delayReason}
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(record)
            }}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all text-center cursor-pointer shadow-xs"
          >
            Afficher la fiche détaillée
          </button>
        </div>
      </Popup>
    </Marker>
  )
}
