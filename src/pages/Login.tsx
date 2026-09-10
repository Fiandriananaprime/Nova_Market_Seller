
import { FormEvent, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { requestLogin } from "@/service/auth"
import { useTranslation } from "react-i18next"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/dashboard"

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      setLoading(true)
      setError("")

      const response = await requestLogin(email, password, rememberMe)

      localStorage.setItem("accessToken", response.tokens.accessToken)
      localStorage.setItem("currentStore", response.currentStore)

      navigate(from, { replace: true })
    } catch (error) {
      console.error(error)
      setError(t("invalidCredentials"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-full bg-background flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-card border border-border rounded-lg p-6 shadow-sm"
      >
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {t("brand")}
          </p>

          <h1 className="mt-2 font-display text-2xl font-700">
            {t("sellerPortal")}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("loginDescription")}
          </p>
        </div>

        <label className="block text-sm font-medium" htmlFor="email">
          {t("email")}
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          required
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="password">
          {t("password")}
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={t("passwordPlaceholder")}
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          required
        />

        <div className="mt-4 flex items-center gap-2">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />

          <label
            htmlFor="rememberMe"
            className="cursor-pointer text-sm text-muted-foreground"
          >
            {t("rememberMe")}
          </label>
        </div>

        {error && (
          <p className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? t("loggingIn") : t("login")}
        </button>
      </form>
    </main>
  )
}