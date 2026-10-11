import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import type {
  DeliveryRecord,
  DeliveryStats,
  DeliveryFilterOptions,
} from "../types/deliveryTracking.types"
import { deliveryTrackingService } from "../services/deliveryTrackingService"

export function useDeliveryTracking() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [filters, setFilters] = useState<DeliveryFilterOptions>({
    status: "all",
    search: "",
    sortBy: "recent",
  })

  const [stats, setStats] = useState<DeliveryStats>({
    totalActive: 0,
    awaitingDispatch: 0,
    inTransit: 0,
    deliveredToday: 0,
    delayed: 0,
  })

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [list, computedStats] = await Promise.all([
        deliveryTrackingService.getDeliveries(),
        deliveryTrackingService.getDeliveryStats(),
      ])
      setDeliveries(list)
      setStats(computedStats)
    } catch (err: unknown) {
      console.error("[useDeliveryTracking] Error fetching deliveries:", err)
      setError("Impossible de charger les livraisons. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const [list, computedStats] = await Promise.all([
          deliveryTrackingService.getDeliveries(),
          deliveryTrackingService.getDeliveryStats(),
        ])
        if (mounted) {
          setDeliveries(list)
          setStats(computedStats)
          setLoading(false)
        }
      } catch (err: unknown) {
        if (mounted) {
          console.error("[useDeliveryTracking] Error fetching deliveries:", err)
          setError("Impossible de charger les livraisons. Veuillez réessayer.")
          setLoading(false)
        }
      }
    }
    init()
    return () => {
      mounted = false
    }
  }, [])

  // Optional real-time simulation interval (clean unmount guaranteed)
  const simulationIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isSimulating) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
        simulationIntervalRef.current = null
      }
      return
    }

    simulationIntervalRef.current = window.setInterval(() => {
      setDeliveries((prev) => deliveryTrackingService.simulateMovement(prev))
    }, 3000)

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
        simulationIntervalRef.current = null
      }
    }
  }, [isSimulating])

  // Filter and sort computation
  const filteredDeliveries = useMemo(() => {
    return deliveries
      .filter((item) => {
        // Status filter
        if (filters.status !== "all" && item.status !== filters.status) {
          return false
        }

        // Search query
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
        // "recent" default (active in transit first, then by reference)
        const priorityScore = (status: string) => {
          if (status === "in_transit") return 4
          if (status === "delayed") return 3
          if (status === "awaiting_dispatch") return 2
          return 1
        }
        return priorityScore(b.status) - priorityScore(a.status)
      })
  }, [deliveries, filters])

  // Selected delivery record
  const selectedDelivery = useMemo(() => {
    if (!selectedDeliveryId) return null
    return deliveries.find((d) => d.id === selectedDeliveryId) ?? null
  }, [deliveries, selectedDeliveryId])

  const toggleSimulation = useCallback(() => {
    setIsSimulating((prev) => !prev)
  }, [])

  const selectDelivery = useCallback((id: string | null) => {
    setSelectedDeliveryId(id)
  }, [])

  return {
    deliveries: filteredDeliveries,
    allDeliveries: deliveries,
    stats,
    loading,
    error,
    selectedDelivery,
    selectedDeliveryId,
    selectDelivery,
    filters,
    setFilters,
    isSimulating,
    toggleSimulation,
    refresh: fetchData,
  }
}
