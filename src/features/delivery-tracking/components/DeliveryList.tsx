import React from "react"
import {
  Truck,
  Bike,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ChevronRight,
  User,
  ShoppingBag,
} from "lucide-react"
import type { DeliveryRecord, DeliveryStatus } from "../types/deliveryTracking.types"

interface DeliveryListProps {
  deliveries: DeliveryRecord[]
  selectedDeliveryId: string | null
  onSelectDelivery: (record: DeliveryRecord) => void
}

const StatusBadge = ({ status }: { status: DeliveryStatus }) => {
  if (status === "in_transit") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
        En transit
      </span>
    )
  }
  if (status === "delayed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
        <AlertTriangle size={10} />
        Retardé
      </span>
    )
  }
  if (status === "delivered") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
        <CheckCircle2 size={10} />
        Livré
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
      <Clock size={10} />
      En attente
    </span>
  )
};

export const DeliveryList: React.FC<DeliveryListProps> = ({
  deliveries,
  selectedDeliveryId,
  onSelectDelivery,
}) => {
  return (
    <div className="flex flex-col h-full bg-card rounded-3xl border border-border/80 shadow-xs overflow-hidden">
      
      <div className="px-5 py-3.5 border-b border-border/60 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck size={16} className="text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">
            Colis en cours de suivi
          </h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
          {deliveries.length} {deliveries.length > 1 ? "résultats" : "résultat"}
        </span>
      </div>

      
      <div className="flex-1 overflow-y-auto divide-y divide-border/60 max-h-[580px] lg:max-h-[640px] p-2 space-y-1.5">
        {deliveries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <ShoppingBag size={28} className="mx-auto mb-2 text-muted-foreground/60" />
            <p className="text-xs font-semibold text-foreground">
              Aucun colis trouvé
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Essayez de modifier votre recherche ou vos filtres.
            </p>
          </div>
        ) : (
          deliveries.map((delivery) => {
            const isSelected = selectedDeliveryId === delivery.id

            return (
              <div
                key={delivery.id}
                onClick={() => onSelectDelivery(delivery)}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "bg-card hover:bg-muted/50 border-border/60 hover:border-border"
                }`}
              >
                
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs text-foreground tracking-tight">
                      {delivery.orderReference}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium px-1.5 py-0.2 bg-muted rounded">
                      {delivery.deliveryMethod === "express" ? "Express" : "Standard"}
                    </span>
                  </div>

                  <StatusBadge status={delivery.status} />
                </div>

                
                <div className="mt-2 flex items-start gap-1.5 text-xs">
                  <MapPin size={13} className="text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">
                      {delivery.destination.recipientName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {delivery.destination.district}, {delivery.destination.city}
                    </p>
                  </div>
                </div>

                
                <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    {delivery.driver ? (
                      <>
                        <Bike size={12} className="text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="truncate">{delivery.driver.name}</span>
                      </>
                    ) : (
                      <>
                        <User size={12} className="shrink-0" />
                        <span className="italic">Non assigné</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-medium shrink-0">
                    {delivery.estimatedArrival && delivery.status === "in_transit" ? (
                      <span className="text-primary font-bold">
                        ETA:{" "}
                        {new Date(delivery.estimatedArrival).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : delivery.deliveredAt ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {delivery.lastUpdate}
                      </span>
                    ) : (
                      <span>{delivery.lastUpdate}</span>
                    )}

                    <ChevronRight
                      size={14}
                      className={`transition-transform ${
                        isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                </div>

                
                {delivery.isDelayed && delivery.delayReason && (
                  <div className="mt-2 p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-[10px] font-medium leading-tight">
                    ⚠️ {delivery.delayReason}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
