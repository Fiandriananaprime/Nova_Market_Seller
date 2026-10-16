import { useEffect, useState } from "react"
import axios from "axios"
import { Navigate, Outlet, useLocation } from "react-router"
import { getCurrentUser } from "@/service/auth"

const ProtectedRoute = () => {
  const location = useLocation()
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated" | "error">("checking")
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true

    getCurrentUser().then((user) => {
      if (active) {
        setStatus(user.role === "seller" && user.status === "active" ? "authenticated" : "unauthenticated")
      }
    }).catch((error: unknown) => {
      if (!active) return
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setStatus("unauthenticated")
        return
      }
      console.error("Failed to validate seller session:", error)
      setStatus("error")
    })

    return () => {
      active = false
    }
  }, [retryKey])

  if (status === "checking") {
    return <div className="flex min-h-full items-center justify-center text-sm text-muted-foreground">Vérification de la session…</div>
  }

  if (status === "error") {
    return (
      <main className="flex min-h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <p role="alert" className="text-sm text-rose-600">Impossible de vérifier votre session.</p>
        <button
          type="button"
          onClick={() => setRetryKey((key) => key + 1)}
          className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          Réessayer
        </button>
      </main>
    )
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute