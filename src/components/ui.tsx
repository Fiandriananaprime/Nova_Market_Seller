import { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

// ── Badge ─────────────────────────────────────────────────────────────────
type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted" | "accent" | "blue";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-[var(--success)]/10 text-[var(--success)]",
  warning: "bg-[var(--warning)]/10 text-[var(--warning)]",
  danger: "bg-[var(--destructive)]/10 text-[var(--destructive)]",
  muted: "bg-muted text-muted-foreground",
  accent: "bg-accent/10 text-accent",
  blue: "bg-primary/10 text-primary",
};

export function Badge({ variant = "default", children, className = "" }: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-600 ${badgeStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ── Order/Status badges ───────────────────────────────────────────────────
const orderStatusMap: Record<string, { label: string; variant: BadgeVariant; dot: string }> = {
  pending:    { label: "En attente",   variant: "warning",  dot: "bg-[var(--warning)]" },
  confirmed:  { label: "Confirmée",    variant: "blue",     dot: "bg-primary" },
  processing: { label: "En traitement",variant: "blue",     dot: "bg-primary" },
  preparing:  { label: "Préparation",  variant: "accent",   dot: "bg-accent" },
  shipped:    { label: "Expédiée",     variant: "accent",   dot: "bg-accent" },
  delivered:  { label: "Livrée",       variant: "success",  dot: "bg-[var(--success)]" },
  cancelled:  { label: "Annulée",      variant: "danger",   dot: "bg-[var(--destructive)]" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const s = orderStatusMap[status] || { label: status, variant: "muted" as BadgeVariant, dot: "bg-muted-foreground" };
  return (
    <Badge variant={s.variant}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </Badge>
  );
}

const paymentStatusMap: Record<string, { label: string; variant: BadgeVariant }> = {
  paid:     { label: "Payé",      variant: "success" },
  pending:  { label: "En attente",variant: "warning" },
  failed:   { label: "Échoué",    variant: "danger" },
  refunded: { label: "Remboursé", variant: "muted" },
};

export function PaymentBadge({ status }: { status: string }) {
  const s = paymentStatusMap[status] || { label: status, variant: "muted" as BadgeVariant };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

const productStatusMap: Record<string, { label: string; variant: BadgeVariant }> = {
  active:   { label: "Actif",    variant: "success" },
  draft:    { label: "Brouillon",variant: "muted" },
  inactive: { label: "Inactif",  variant: "warning" },
  pending:  { label: "En attente",variant: "blue" },
  rejected: { label: "Rejeté",   variant: "danger" },
};

export function ProductStatusBadge({ status }: { status: string }) {
  const s = productStatusMap[status] || { label: status, variant: "muted" as BadgeVariant };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

const inventoryStatusMap: Record<string, { label: string; variant: BadgeVariant }> = {
  in_stock:    { label: "En stock",    variant: "success" },
  low_stock:   { label: "Stock bas",   variant: "warning" },
  out_of_stock:{ label: "Épuisé",      variant: "danger" },
};

export function InventoryBadge({ status }: { status: string }) {
  const s = inventoryStatusMap[status] || { label: status, variant: "muted" as BadgeVariant };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

// ── KPI Card ──────────────────────────────────────────────────────────────
export function KpiCard({ label, value, change, icon, accent = false }: {
  label: string;
  value: string;
  change?: number;
  icon: ReactNode;
  accent?: boolean;
}) {
  const positive = change !== undefined && change >= 0;
  return (
    <div className={`bg-card rounded-xl border border-border p-5 flex flex-col gap-3 ${accent ? "ring-1 ring-primary/20" : ""}`}>
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${positive ? "text-[var(--success)] bg-[var(--success)]/10" : "text-[var(--destructive)] bg-[var(--destructive)]/10"}`}>
            {positive ? "+" : ""}{change.toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="font-display font-700 text-2xl text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1.5">{label}</p>
      </div>
    </div>
  );
}

// ── Page header ───────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display font-700 text-xl text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const btnStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90",
};

export function Button({ variant = "secondary", size = "md", children, onClick, disabled, className = "" }: {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const sz = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sz} ${btnStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────
export function Input({ value, onChange, placeholder, type = "text", className = "" }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`px-3 py-2 text-sm rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors ${className}`}
    />
  );
}

// ── Select ────────────────────────────────────────────────────────────────
export function Select({ value, onChange, options, className = "" }: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 text-sm rounded-md border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors cursor-pointer ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="font-display font-600 text-sm text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

// ── Rating stars ─────────────────────────────────────────────────────────
export function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} viewBox="0 0 12 12" className={`w-3 h-3 ${i < Math.round(rating) ? "fill-amber-400" : "fill-border"}`}>
          <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.1L6 8.02l-2.78 1.54.53-3.1L1.5 4.27l3.11-.45z" />
        </svg>
      ))}
    </span>
  );
}

// ── Confirmation modal ────────────────────────────────────────────────────
export function ConfirmModal({ title, message, onConfirm, onCancel, danger = false }: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onCancel} />
      <div className="relative bg-card rounded-xl border border-border p-6 max-w-sm w-full shadow-xl animate-fade-in">
        <button className="absolute top-4 right-4 p-1 rounded hover:bg-muted text-muted-foreground" onClick={onCancel}>
          <X size={16} />
        </button>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${danger ? "bg-[var(--destructive)]/10 text-[var(--destructive)]" : "bg-primary/10 text-primary"}`}>
          {danger ? <AlertTriangle size={18} /> : <Info size={18} />}
        </div>
        <h3 className="font-display font-700 text-base text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onCancel}>Annuler</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>Confirmer</Button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────
export function Toast({ message, type = "success", onDismiss }: {
  message: string;
  type?: "success" | "error" | "info";
  onDismiss: () => void;
}) {
  const styles = {
    success: "bg-[var(--success)] text-white",
    error: "bg-[var(--destructive)] text-white",
    info: "bg-primary text-white",
  };
  const icons = { success: CheckCircle2, error: AlertTriangle, info: Info };
  const Icon = icons[type];

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in ${styles[type]}`}>
      <Icon size={16} />
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-80 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-card rounded-xl border border-border ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 border-b border-border flex items-center justify-between ${className}`}>{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display font-600 text-sm text-foreground">{children}</h2>;
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

// ── Pagination ────────────────────────────────────────────────────────────
export function Pagination({ page, total, pageSize, onChange }: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border">
      <p className="text-xs text-muted-foreground">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} sur {total}
      </p>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => onChange(page - 1)}>Préc.</Button>
        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-7 h-7 rounded text-xs font-medium transition-colors ${p === page ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              {p}
            </button>
          );
        })}
        <Button size="sm" variant="ghost" disabled={page === totalPages} onClick={() => onChange(page + 1)}>Suiv.</Button>
      </div>
    </div>
  );
}
