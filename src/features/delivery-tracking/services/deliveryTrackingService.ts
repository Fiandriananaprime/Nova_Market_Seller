import type { DeliveryRecord, DeliveryStats } from "../types/deliveryTracking.types"
import { mockDeliveryTrackingService } from "./mockDeliveryTrackingService"

/**
 * IDeliveryTrackingService
 * Abstract contract decoupling presentation components from data provider.
 * When backend delivery tracking endpoints are ready, implement this interface
 * with real Axios client calls without changing any UI components.
 */
export interface IDeliveryTrackingService {
  getDeliveries(): Promise<DeliveryRecord[]>
  getDeliveryById(id: string): Promise<DeliveryRecord | null>
  getDeliveryStats(): Promise<DeliveryStats>
  simulateMovement(records: DeliveryRecord[]): DeliveryRecord[]
}

/**
 * Singleton service instance consumed throughout the feature.
 * Currently backed by mockDeliveryTrackingService.
 */
export const deliveryTrackingService: IDeliveryTrackingService = mockDeliveryTrackingService
