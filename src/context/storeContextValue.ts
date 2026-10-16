import { createContext } from "react"
import type { Store } from "@/type/store"

export interface StoreContextType {
  stores: Store[]
  selectedStore: Store | null
  loading: boolean
  selectStore: (storeId: string) => void
}

export const StoreContext = createContext<StoreContextType | undefined>(undefined)
