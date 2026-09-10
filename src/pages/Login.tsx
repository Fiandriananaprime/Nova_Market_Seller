import { FormEvent } from "react"
import { useLocation, useNavigate } from "react-router"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    "/dashboard"

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    localStorage.setItem("accessToken", "demo-token")
    navigate(from, { replace: true })
  }

  return (
    <main className="min-h-full bg-background flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-card border border-border rounded-lg p-6 shadow-sm"
      >
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Nova Market
          </p>
          <h1 className="mt-2 font-display text-2xl font-700">Portail vendeur</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connectez-vous pour gérer votre boutique.
          </p>
        </div>

        <label className="block text-sm font-medium" htmlFor="email">
          Adresse e-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vendeur@novamarket.com"
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          required
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Votre mot de passe"
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          required
        />

        <button
          type="submit"
          className="mt-6 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Se connecter
        </button>
      </form>
    </main>
  )
}
