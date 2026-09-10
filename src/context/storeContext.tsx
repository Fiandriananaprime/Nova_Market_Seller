import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { getSellerStores } from "@/service/store"
import type { Store } from "@/type/store"

interface StoreContextType {
  stores: Store[]
  selectedStore: Store
  loading: boolean
  selectStore: (storeId: string) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<Store>({} as Store)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await getSellerStores()

        setStores(data)

        const savedStoreId = localStorage.getItem("selectedStoreId")

        const savedStore = data.find(
          (store) => store.id === savedStoreId
        )

        setSelectedStore(savedStore ?? data[0] ?? null)
      } catch (error) {
        console.error("Erreur lors du chargement des boutiques :", error)
      } finally {
        setLoading(false)
      }
    }

    loadStores()
  }, [])

  const selectStore = (storeId: string) => {
    const store = stores.find((store) => store.id === storeId)

    if (!store) return

    setSelectedStore(store)
    localStorage.setItem("selectedStoreId", store.id)
  }

  return (
    <StoreContext.Provider
      value={{
        stores,
        selectedStore,
        loading,
        selectStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)

  if (!context) {
    throw new Error("useStore must be used inside StoreProvider")
  }

  return context
}