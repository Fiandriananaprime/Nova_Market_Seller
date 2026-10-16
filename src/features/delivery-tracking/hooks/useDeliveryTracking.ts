import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import type {
  DeliveryRecord,
  DeliveryStats,
  DeliveryFilterOptions,
} from "../types/deliveryTracking.types"
import { getDeliveries, getDeliveryById } from "../services/deliveryTrackingService"
import { subscribeToOrderTracking } from "@/service/realtime"
import type { OrderTrackingStreamEvent } from "@/type/realtime"

const toDeliveryStatus = (status: OrderTrackingStreamEvent["status"]):DeliveryRecord["status"] | undefined => {
  switch (status) {
    case "pending":
    case "preparing":
      return "awaiting_dispatch"
    case "processing":
      return "in_transit"
    case "delivered":
      return "delivered"
    case "failed":
      return "delayed"
    default:
      return undefined
  }
};

const updateDeliveryStats = (
  stats: DeliveryStats,
  delivery: DeliveryRecord,
  nextStatus: DeliveryRecord["status"],
  timestamp: string,):DeliveryStats => {
  const isToday = (value: string | undefined) =>
    Boolean(value && new Date(value).toDateString() === new Date().toDateString())
  const wasDeliveredToday = delivery.status === "delivered" && isToday(delivery.deliveredAt)
  const isDeliveredToday = nextStatus === "delivered" && isToday(timestamp)
  const wasDelayed = delivery.status === "delayed" || delivery.isDelayed
  const isDelayed = nextStatus === "delayed" || delivery.isDelayed

  return {
    totalActive: stats.totalActive
      + Number(nextStatus !== "delivered") - Number(delivery.status !== "delivered"),
    awaitingDispatch: stats.awaitingDispatch
      + Number(nextStatus === "awaiting_dispatch") - Number(delivery.status === "awaiting_dispatch"),
    inTransit: stats.inTransit
      + Number(nextStatus === "in_transit") - Number(delivery.status === "in_transit"),
    deliveredToday: stats.deliveredToday + Number(isDeliveredToday) - Number(wasDeliveredToday),
    delayed: stats.delayed + Number(isDelayed) - Number(wasDelayed),
  }
};

export const useDeliveryTracking = () => {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([])
  const [deliverySummary, setDeliverySummary] = useState<DeliveryStats | null>(null)
  const [deliveryPage, setDeliveryPage] = useState(1)
  const [deliveryTotalPages, setDeliveryTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null)
  const [selectedDeliveryDetails, setSelectedDeliveryDetails] = useState<DeliveryRecord | null>(null)
  const [connectedOrderIds, setConnectedOrderIds] = useState<Set<string>>(() => new Set())
  const deliveriesRef = useRef(deliveries)
  const deliveryRequestVersionRef = useRef(0)
  const [filters, setFilters] = useState<DeliveryFilterOptions>({
    status: "all",
    search: "",
    sortBy: "recent",
  })

  useEffect(() => {
    deliveriesRef.current = deliveries
  }, [deliveries])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getDeliveries(1, 100)
      deliveryRequestVersionRef.current += 1
      setDeliveries(response.data)
      setDeliverySummary(response.summary)
      setDeliveryPage(response.meta.page)
      setDeliveryTotalPages(response.meta.totalPages)
    } catch (err: unknown) {
      console.error("[useDeliveryTracking] Error fetching deliveries:", err)
      setError("Impossible de charger les livraisons. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMore || deliveryPage >= deliveryTotalPages) return
    const requestVersion = deliveryRequestVersionRef.current
    setLoadingMore(true)
    setError(null)
    try {
      const response = await getDeliveries(deliveryPage + 1, 100)
      if (requestVersion !== deliveryRequestVersionRef.current) return
      setDeliveries((current) => {
        const currentIds = new Set(current.map((delivery) => delivery.id))
        return [...current, ...response.data.filter((delivery) => !currentIds.has(delivery.id))]
      })
      setDeliverySummary(response.summary)
      setDeliveryPage(response.meta.page)
      setDeliveryTotalPages(response.meta.totalPages)
    } catch (err: unknown) {
      console.error("[useDeliveryTracking] Error loading more deliveries:", err)
      setError("Impossible de charger les livraisons suivantes. Veuillez réessayer.")
    } finally {
      setLoadingMore(false)
    }
  }, [deliveryPage, deliveryTotalPages, loadingMore])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const trackedOrderIds = useMemo(
    () => [...new Set(deliveries
      .filter((delivery) => delivery.status === "in_transit" || delivery.status === "delayed")
      .map((delivery) => delivery.orderId))].sort(),
    [deliveries],
  )
  const trackedOrderIdsKey = trackedOrderIds.join(",")

  useEffect(() => {
    const orderIds = trackedOrderIdsKey ? trackedOrderIdsKey.split(",") : []
    const unsubscribers = orderIds.map((orderId) =>
      subscribeToOrderTracking(
        orderId,
        (event) => {
          const current = deliveriesRef.current.find((delivery) => delivery.orderId === event.orderId)
          if (!current || new Date(event.timestamp).getTime() < new Date(current.lastUpdate).getTime()) return

          const nextStatus = toDeliveryStatus(event.status)
          const updatedRecord = (delivery: DeliveryRecord): DeliveryRecord => ({
            ...delivery,
            ...(event.location ? {
              coordinates: { lat: event.location.latitude, lng: event.location.longitude },
              heading: event.location.heading ?? delivery.heading,
            } : {}),
            ...(nextStatus ? { status: nextStatus } : {}),
            ...(nextStatus === "delivered" && delivery.status !== "delivered"
              ? { deliveredAt: event.timestamp }
              : {}),
            lastUpdate: event.timestamp,
            ...(event.type === "event_created" && event.event ? {
              timeline: [...delivery.timeline, {
                status: nextStatus ?? delivery.status,
                timestamp: event.event.createdAt,
                label: event.event.type,
                description: event.event.message ?? undefined,
              }],
            } : {}),
          })

          setDeliveries((currentDeliveries) =>
            currentDeliveries.map((delivery) => delivery.orderId === event.orderId ? updatedRecord(delivery) : delivery),
          )
          setSelectedDeliveryDetails((currentDetails) =>
            currentDetails?.orderId === event.orderId ? updatedRecord(currentDetails) : currentDetails,
          )
          if (nextStatus) {
            setDeliverySummary((currentSummary) =>
              currentSummary ? updateDeliveryStats(currentSummary, current, nextStatus, event.timestamp) : currentSummary,
            )
          }
        },
        (state) => setConnectedOrderIds((current) => {
          const next = new Set(current)
          if (state === "connected") next.add(orderId)
          else next.delete(orderId)
          return next
        }),
      ),
    )

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
      setConnectedOrderIds(new Set())
    }
  }, [trackedOrderIdsKey])

  useEffect(() => {
    if (!selectedDeliveryId) {
      setSelectedDeliveryDetails(null)
      return
    }
    let active = true
    getDeliveryById(selectedDeliveryId)
      .then((record) => {
        if (!active) return
        const latestRecord = deliveriesRef.current.find((delivery) => delivery.id === record.id)
        setSelectedDeliveryDetails(
          latestRecord && new Date(latestRecord.lastUpdate).getTime() > new Date(record.lastUpdate).getTime()
            ? latestRecord
            : record,
        )
      })
      .catch(() => {
        if (active) setError("Impossible de charger les détails de cette livraison.")
      })
    return () => {
      active = false
    }
  }, [selectedDeliveryId])

  const calculatedStats = useMemo(() => deliveries.reduce<DeliveryStats>(
    (current, delivery) => {
      if (delivery.status !== "delivered") current.totalActive += 1
      if (delivery.status === "awaiting_dispatch") current.awaitingDispatch += 1
      if (delivery.status === "in_transit") current.inTransit += 1
      if (delivery.status === "delivered" && delivery.deliveredAt &&
        new Date(delivery.deliveredAt).toDateString() === new Date().toDateString()) {
        current.deliveredToday += 1
      }
      if (delivery.status === "delayed" || delivery.isDelayed) current.delayed += 1
      return current
    },
    { totalActive: 0, awaitingDispatch: 0, inTransit: 0, deliveredToday: 0, delayed: 0 },
  ), [deliveries])
  const stats = deliverySummary ?? calculatedStats

                                
  const filteredDeliveries = useMemo(() => {
    return deliveries
      .filter((item) => {
                        
        if (filters.status !== "all" && item.status !== filters.status) {
          return false
        }

                       
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase()
          const matchRef = item.orderReference.toLowerCase().includes(q)
          const matchRecipient = item.destination.recipientName.toLowerCase().includes(q)
          const matchDistrict = item.destination.district.toLowerCase().includes(q)
          const matchDriver = item.driver?.name.toLowerCase().includes(q) ?? false

          if (!matchRef && !matchRecipient && !matchDistrict && !matchDriver) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (filters.sortBy === "eta") {
          const etaA = a.estimatedArrival ? new Date(a.estimatedArrival).getTime() : Infinity
          const etaB = b.estimatedArrival ? new Date(b.estimatedArrival).getTime() : Infinity
          return etaA - etaB
        }
        if (filters.sortBy === "orderRef") {
          return a.orderReference.localeCompare(b.orderReference)
        }
                                                                        
        const priorityScore = (status: string) => {
          if (status === "in_transit") return 4
          if (status === "delayed") return 3
          if (status === "awaiting_dispatch") return 2
          return 1
        }
        return priorityScore(b.status) - priorityScore(a.status)
      })
  }, [deliveries, filters])

                             
  const selectedDelivery = useMemo(() => {
    if (!selectedDeliveryId) return null
    return selectedDeliveryDetails ?? deliveries.find((d) => d.id === selectedDeliveryId) ?? null
  }, [deliveries, selectedDeliveryDetails, selectedDeliveryId])

  const selectDelivery = useCallback((id: string | null) => {
    setSelectedDeliveryId(id)
  }, [])

  return {
    deliveries: filteredDeliveries,
    allDeliveries: deliveries,
    stats,
    hasMore: deliveryPage < deliveryTotalPages,
    loadingMore,
    loadMore,
    loading,
    error,
    selectedDelivery,
    selectedDeliveryId,
    selectDelivery,
    realtimeConnected: trackedOrderIds.length > 0 && connectedOrderIds.size === trackedOrderIds.length,
    realtimeConnectedCount: connectedOrderIds.size,
    realtimeTrackedCount: trackedOrderIds.length,
    filters,
    setFilters,
    isSimulating: false,
    toggleSimulation: () => undefined,
    refresh: fetchData,
  }
};
