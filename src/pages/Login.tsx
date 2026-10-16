import { FormEvent, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react"
import { requestLogin } from "@/service/auth"
import { Button } from "@/components/ui"
import { tutorialService } from "@/features/tutorials/services/tutorialService"

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/dashboard"

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError("")

      await requestLogin(identifier, password, rememberMe)

      tutorialService.startNewLoginSession()

      navigate(from, { replace: true })
    } catch (err) {
      console.error(err)
      setError(t("invalidCredentials") || "Identifiants invalides")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-full bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 rounded-3xl border border-border/80 bg-card shadow-2xl overflow-hidden">
        
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary via-blue-600 to-indigo-900 text-white relative overflow-hidden">
          
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white text-primary flex items-center justify-center font-bold shadow-sm">
                <TrendingUp size={20} />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight">
                Nova Market
              </span>
            </div>

            <div className="mt-12 space-y-4">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider inline-block">
                Espace Commerçant
              </span>

              <h2 className="font-display font-black text-3xl leading-tight">
                Développez vos ventes à Madagascar en toute simplicité.
              </h2>

              <p className="text-sm text-white/80 leading-relaxed font-normal">
                Pilotez vos commandes en temps réel, optimisez vos stocks et fidélisez vos clients depuis votre console marchande unifiée.
              </p>
            </div>
          </div>

          
          <div className="relative z-10 space-y-3 pt-8 border-t border-white/15">
            <div className="flex items-center gap-3 text-xs text-white/90">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck size={14} />
              </div>
              <span>Reversements sécurisés Mvola, Orange Money & Banque</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-white/90">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Zap size={14} />
              </div>
              <span>Expéditions fluides et notifications en temps réel</span>
            </div>
          </div>
        </div>

        
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center gap-2 lg:hidden mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                <TrendingUp size={16} />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                Nova Market
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl text-foreground tracking-tight">
              {t("sellerPortal")}
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {t("loginDescription")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="identifier">
                {t("emailOrPhone")}
              </label>
              <div className="relative flex items-center">
                <Mail size={15} className="absolute left-3 text-muted-foreground pointer-events-none" />
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  placeholder={t("emailOrPhonePlaceholder")}
                  className="w-full pl-9.5 pr-3.5 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="password">
                {t("password")}
              </label>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute left-3 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder={t("passwordPlaceholder")}
                  className="w-full pl-9.5 pr-10 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary/20"
                />
                <span>{t("rememberMe")}</span>
              </label>

              <button
                type="button"
                className="text-xs text-primary hover:underline font-medium"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              <span>{loading ? t("loggingIn") : t("login")}</span>
              <ArrowRight size={15} />
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
};
export default Login;