import React, { useMemo } from "react"
import { Polyline, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import type { DeliveryRecord } from "../types/deliveryTracking.types"

interface DeliveryTrajectoryProps {
  delivery: DeliveryRecord
  isSelected: boolean
  onSelect: (record: DeliveryRecord) => void
}

/**
 * Renders the logistics route trajectory for a delivery:
 * 1. Traveled Path: Solid polyline from initial depot to current courier position.
 * 2. Remaining Path: Dashed animated polyline from current courier to customer destination.
 * 3. Destination Drop-off Pin: Dedicated custom marker at final delivery destination coordinates.
 * 4. Origin Depot Pin: Subtle hub marker at start coordinates.
 */
export const DeliveryTrajectory: React.FC<DeliveryTrajectoryProps> = ({
  delivery,
  isSelected,
  onSelect,
}) => {
  const { initialCoordinates, coordinates, targetCoordinates, status } = delivery

  // Colors based on status
  const themeColor = useMemo(() => {
    switch (status) {
      case "delayed":
        return "#E11D48" // Rose
      case "awaiting_dispatch":
        return "#D97706" // Amber
      case "delivered":
        return "#059669" // Emerald
      case "in_transit":
      default:
        return "#0077B6" // Nova Primary Blue
    }
  }, [status])

  // Destination custom marker icon
  const destinationIcon = useMemo(() => {
    const isSpecial = isSelected
    const glow = isSpecial ? `0 0 0 4px rgba(0, 119, 182, 0.35), 0 8px 20px rgba(0,0,0,0.25)` : "0 4px 12px rgba(0,0,0,0.18)"
    
    const html = `
      <div class="delivery-destination-pin ${isSpecial ? "selected" : ""}" style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 10px;
          background: linear-gradient(135deg, #16262E, #2A4555);
          border: 2px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5ABCB9;
          box-shadow: ${glow};
        ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
        </div>
        <div style="
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background: #16262E;
          border-radius: 9999px;
          border: 1px solid white;
        "></div>
      </div>
    `

    return L.divIcon({
      html,
      className: "custom-delivery-dest-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  }, [isSelected])

  // Origin Depot subtle icon
  const originIcon = useMemo(() => {
    const html = `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 9999px;
        background: #16262E;
        border: 2px solid #5ABCB9;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        cursor: pointer;
      ">
        <div style="width: 6px; height: 6px; border-radius: 9999px; background: #5ABCB9;"></div>
      </div>
    `
    return L.divIcon({
      html,
      className: "custom-delivery-origin-icon",
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -11],
    })
  }, [])

  // Traveled path: [initialCoordinates -> current coordinates]
  const traveledPositions: [number, number][] = [
    [initialCoordinates.lat, initialCoordinates.lng],
    [coordinates.lat, coordinates.lng],
  ]

  // Remaining path: [current coordinates -> targetCoordinates]
  const remainingPositions: [number, number][] = [
    [coordinates.lat, coordinates.lng],
    [targetCoordinates.lat, targetCoordinates.lng],
  ]

  return (
    <>
      {/* ── 1. Traveled Polyline (Solid line) ── */}
      {status !== "awaiting_dispatch" && (
        <Polyline
          positions={traveledPositions}
          pathOptions={{
            color: isSelected ? "#0077B6" : "#5ABCB9",
            weight: isSelected ? 5 : 3,
            opacity: isSelected ? 0.95 : 0.45,
            lineCap: "round",
            lineJoin: "round",
            className: "delivery-route-traveled",
          }}
        />
      )}

      {/* ── 2. Remaining Itinerary Polyline (Dashed line) ── */}
      {status !== "delivered" && (
        <Polyline
          positions={remainingPositions}
          pathOptions={{
            color: themeColor,
            weight: isSelected ? 4 : 2.5,
            opacity: isSelected ? 0.95 : 0.5,
            dashArray: isSelected ? "8, 10" : "6, 8",
            lineCap: "round",
            lineJoin: "round",
            className: "delivery-route-remaining",
          }}
        />
      )}

      {/* ── 3. Origin Depot Hub Pin ── */}
      <Marker
        position={[initialCoordinates.lat, initialCoordinates.lng]}
        icon={originIcon}
        zIndexOffset={isSelected ? 8000 : 1}
        eventHandlers={{
          click: () => onSelect(delivery),
        }}
      >
        <Popup>
          <div className="p-2 text-xs max-w-[200px]">
            <p className="font-bold text-foreground">Hub de départ</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Origine de l'expédition pour {delivery.orderReference}
            </p>
          </div>
        </Popup>
      </Marker>

      {/* ── 4. Destination Drop-off Pin ── */}
      <Marker
        position={[targetCoordinates.lat, targetCoordinates.lng]}
        icon={destinationIcon}
        zIndexOffset={isSelected ? 9000 : 5}
        eventHandlers={{
          click: () => onSelect(delivery),
        }}
      >
        <Popup>
          <div className="p-3 text-xs min-w-[220px]">
            <div className="flex items-center gap-1.5 text-primary font-bold mb-1">
              <span>📍 Destination de livraison</span>
            </div>
            <p className="font-semibold text-foreground text-sm">
              {delivery.destination.recipientName}
            </p>
            <p className="text-muted-foreground text-[11px] mt-0.5">
              {delivery.destination.street}, {delivery.destination.district}
            </p>
            <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">
                {delivery.orderReference}
              </span>
              <button
                type="button"
                onClick={() => onSelect(delivery)}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                Voir détails
              </button>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  )
}
