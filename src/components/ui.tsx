import { useState, ReactNode, HTMLAttributes, ButtonHTMLAttributes } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Search,
  Package,
  Loader2,
} from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";

                                                                               
export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "purple"
  | "cyan";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "bg-secondary text-secondary-foreground border-border/50",
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  neutral: "bg-muted text-muted-foreground border-border/40",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
};

export const Badge = ({
  variant = "default",
  children,
  className = "",
  dot = false,
  dotColor,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
  dotColor?: string;
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dotColor || "bg-current"
          }`}
        />
      )}
      {children}
    </span>
  );
};

// ── Order Status Badges ────────────────────────────────────────────────────
const orderStatusMap: Record<
  string,
  { label: string; variant: BadgeVariant; dotColor: string }
> = {
  pending: { label: "En attente", variant: "warning", dotColor: "bg-amber-500 animate-pulse" },
  confirmed: { label: "Confirmée", variant: "primary", dotColor: "bg-blue-500" },
  processing: { label: "En traitement", variant: "primary", dotColor: "bg-blue-500" },
  preparing: { label: "Préparation", variant: "cyan", dotColor: "bg-cyan-500" },
  shipped: { label: "Expédiée", variant: "purple", dotColor: "bg-purple-500" },
  delivered: { label: "Livrée", variant: "success", dotColor: "bg-emerald-500" },
  cancelled: { label: "Annulée", variant: "danger", dotColor: "bg-rose-500" },
};

export const OrderStatusBadge = ({ status }: { status: string }) => {
  const s = orderStatusMap[status] || {
    label: status,
    variant: "neutral" as BadgeVariant,
    dotColor: "bg-muted-foreground",
  };
  return (
    <Badge variant={s.variant} dot dotColor={s.dotColor}>
      {s.label}
    </Badge>
  );
};

const paymentStatusMap: Record<string, { label: string; variant: BadgeVariant }> = {
  paid: { label: "Payé", variant: "success" },
  pending: { label: "En attente", variant: "warning" },
  failed: { label: "Échoué", variant: "danger" },
  refunded: { label: "Remboursé", variant: "neutral" },
};

export const PaymentBadge = ({ status }: { status: string }) => {
  const s = paymentStatusMap[status] || { label: status, variant: "neutral" as BadgeVariant };
  return <Badge variant={s.variant}>{s.label}</Badge>;
};

const productStatusMap: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: "Actif", variant: "success" },
  draft: { label: "Brouillon", variant: "neutral" },
  inactive: { label: "Inactif", variant: "warning" },
  pending: { label: "En attente", variant: "primary" },
  rejected: { label: "Rejeté", variant: "danger" },
};

export const ProductStatusBadge = ({ status }: { status: string }) => {
  const s = productStatusMap[status] || { label: status, variant: "neutral" as BadgeVariant };
  return <Badge variant={s.variant} dot>{s.label}</Badge>;
};

const inventoryStatusMap: Record<string, { label: string; variant: BadgeVariant }> = {
  in_stock: { label: "En stock", variant: "success" },
  low_stock: { label: "Stock bas", variant: "warning" },
  out_of_stock: { label: "Rupture", variant: "danger" },
};

export const InventoryBadge = ({ status }: { status: string }) => {
  const s = inventoryStatusMap[status] || { label: status, variant: "neutral" as BadgeVariant };
  return <Badge variant={s.variant} dot>{s.label}</Badge>;
};

// ── Metric KPI Card ────────────────────────────────────────────────────────
export const KpiCard = ({
  label,
  value,
  change,
  icon,
  accent = false,
  subtitle,
}: {
  label: string;
  value: string;
  change?: number;
  icon: ReactNode;
  accent?: boolean;
  subtitle?: string;
}) => {
  const positive = change !== undefined && change >= 0;
  return (
    <SpotlightCard
      theme="dark"
      spotlightColor="var(--primary)"
      intensity={0.14}
      spotlightSize={190}
      borderGlow={0.18}
      className={`group bg-card rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between hover:shadow-md ${
        accent
          ? "border-primary/40 ring-1 ring-primary/20 bg-gradient-to-br from-card to-primary/5"
          : "border-border/80 hover:border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
            accent
              ? "bg-primary text-white shadow-sm shadow-primary/30"
              : "bg-muted text-foreground"
          }`}
        >
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              positive
                ? "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/50"
                : "text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/50"
            }`}
          >
            {positive ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="font-display font-bold text-2xl tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-2 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate" title={label}>
            {label}
          </p>
          {subtitle && (
            <span className="text-[11px] text-muted-foreground/80 shrink-0 font-normal">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
};

// ── Product Image with Graceful Fallback ──────────────────────────────────
export const ProductImage = ({
  src,
  alt,
  className = "",
  fallbackIcon,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: ReactNode;
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-primary/10 via-muted to-muted/80 border border-border flex flex-col items-center justify-center text-primary/70 select-none ${className}`}
        title={alt}
      >
        {fallbackIcon || <Package size={20} className="opacity-70" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
      loading="lazy"
    />
  );
};

// ── Page Header ───────────────────────────────────────────────────────────
export const PageHeader = ({
  title,
  subtitle,
  actions,
  badge,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-2xl tracking-tight text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5 font-normal">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

// ── Button ────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

const btnStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary/90 focus-visible:ring-primary/30",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-border",
  outline:
    "border border-border bg-card text-foreground hover:bg-muted focus-visible:ring-border",
  ghost:
    "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-transparent",
  danger:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500/30",
  success:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500/30",
};

const btnSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm font-medium rounded-xl gap-2",
  lg: "px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  loading?: boolean;
}

export const Button = ({
  variant = "secondary",
  size = "md",
  children,
  onClick,
  disabled,
  loading = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 active:scale-[0.98] ${
        btnSizes[size]
      } ${btnStyles[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
};

// ── Search Input ──────────────────────────────────────────────────────────
export interface SearchInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Rechercher...",
  className = "",
  ...props
}: SearchInputProps) => {
  return (
    <div className={`relative flex items-center ${className}`} {...props}>
      <Search
        size={15}
        className="absolute left-3 text-muted-foreground pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border/80 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 p-1 rounded-md text-muted-foreground hover:text-foreground"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};

// ── View Toggle (e.g., Cards vs Table, Pipeline vs List) ──────────────────
export interface ViewToggleProps<T extends string> extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon: ReactNode }[];
}

export const ViewToggle = <T extends string>({
  value,
  onChange,
  options,
  className = "",
  ...props
}: ViewToggleProps<T>) => {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-muted border border-border/50 text-xs ${className}`}
      {...props}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              active
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ── Card Primitives ───────────────────────────────────────────────────────
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  spotlight?: boolean;
}

export const Card = ({
  children,
  className = "",
  spotlight = false,
  ...props
}: CardProps) => {
  const cardClassName = `bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden ${className}`;

  if (spotlight) {
    return (
      <SpotlightCard
        theme="dark"
        spotlightColor="var(--primary)"
        intensity={0.1}
        spotlightSize={240}
        borderGlow={0.12}
        className={cardClassName}
        {...props}
      >
        {children}
      </SpotlightCard>
    );
  }

  return (
    <div
      className={cardClassName}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`px-5 py-4 border-b border-border/60 flex items-center justify-between gap-4 ${className}`}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <h2 className={`font-display font-semibold text-base text-foreground tracking-tight ${className}`}>
      {children}
    </h2>
  );
};

export const CardBody = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

// ── Empty State ───────────────────────────────────────────────────────────
export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted/80 border border-border/60 flex items-center justify-center text-muted-foreground mb-4 shadow-xs">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-base text-foreground mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      {action}
    </div>
  );
};

// ── Slide-Over Drawer ─────────────────────────────────────────────────────
export const SlideOverDrawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl z-10 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

        {footer && (
          <div className="p-4 border-t border-border bg-card/80 backdrop-blur-xs flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Stars Rating ──────────────────────────────────────────────────────────
export const Stars = ({ rating, max = 5 }: { rating: number; max?: number }) => {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          className={`w-3.5 h-3.5 ${
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-border/60 text-border"
          }`}
        >
          <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
        </svg>
      ))}
      <span className="text-xs font-semibold text-foreground ml-1 tabular-nums">
        {rating.toFixed(1)}
      </span>
    </span>
  );
};

// ── Toast Alert ───────────────────────────────────────────────────────────
export const Toast = ({
  message,
  type = "success",
  onDismiss,
}: {
  message: string;
  type?: "success" | "error" | "info";
  onDismiss: () => void;
}) => {
  const styles = {
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
    info: "bg-primary text-white",
  };
  const icons = { success: CheckCircle2, error: AlertTriangle, info: Info };
  const Icon = icons[type];

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-fade-in ${styles[type]}`}
    >
      <Icon size={18} />
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 opacity-80 hover:opacity-100 p-0.5 rounded cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// ── Confirmation Modal ────────────────────────────────────────────────────
export const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
  danger = false,
  confirmLabel = "Confirmer",
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  confirmLabel?: string;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-xs animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl animate-fade-in">
        <button
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
          onClick={onCancel}
        >
          <X size={16} />
        </button>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
            danger
              ? "bg-rose-500/10 text-rose-600"
              : "bg-primary/10 text-primary"
          }`}
        >
          {danger ? <AlertTriangle size={20} /> : <Info size={20} />}
        </div>
        <h3 className="font-display font-bold text-lg text-foreground mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-2.5 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Pagination ────────────────────────────────────────────────────────────
export const Pagination = ({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const visiblePageCount = Math.min(totalPages, 5)
  const firstVisiblePage = Math.max(1, Math.min(page - 2, totalPages - visiblePageCount + 1))

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/60">
      <p className="text-xs text-muted-foreground font-medium">
        Affichage de <span className="font-semibold text-foreground">{(page - 1) * pageSize + 1}</span> à{" "}
        <span className="font-semibold text-foreground">{Math.min(page * pageSize, total)}</span> sur{" "}
        <span className="font-semibold text-foreground">{total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          Précédent
        </Button>
        {Array.from({ length: visiblePageCount }).map((_, i) => {
          const p = firstVisiblePage + i;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                p === page
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {p}
            </button>
          );
        })}
        <Button
          size="sm"
          variant="outline"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};
