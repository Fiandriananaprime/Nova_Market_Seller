import {
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { getSellerStores } from "@/service/store"
import type { Store } from "@/type/store"
import { StoreContext } from "./storeContextValue"

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
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