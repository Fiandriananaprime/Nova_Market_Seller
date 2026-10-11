import { useState } from "react"
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Mail,
  CheckCircle2,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Badge,
} from "@/components/ui"

interface Member {
  id: string
  name: string
  email: string
  role: "owner" | "manager" | "packer" | "accountant"
  status: "active" | "invited"
}

const ROLE_LABELS: Record<string, { label: string; badge: "primary" | "purple" | "success" | "neutral" }> = {
  owner: { label: "Propriétaire", badge: "purple" },
  manager: { label: "Gestionnaire Commandes & Livraisons", badge: "primary" },
  packer: { label: "Préparateur de Stock", badge: "neutral" },
  accountant: { label: "Comptable", badge: "success" },
}

export function TeamTab({
  showToast,
}: {
  showToast: (msg: string) => void
}) {
  const [members, setMembers] = useState<Member[]>([
    {
      id: "mem-1",
      name: "Rakoto Andry",
      email: "hei.fiandrianana@gmail.com",
      role: "owner",
      status: "active",
    },
    {
      id: "mem-2",
      name: "Hery Rajaonah",
      email: "hery.logistique@gmail.com",
      role: "manager",
      status: "active",
    },
    {
      id: "mem-3",
      name: "Mialy Rasoa",
      email: "mialy.compta@gmail.com",
      role: "accountant",
      status: "invited",
    },
  ])

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<Member["role"]>("manager")

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail) return

    const newMem: Member = {
      id: `mem-${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "invited",
    }
    setMembers([...members, newMem])
    setShowInviteModal(false)
    setInviteEmail("")
    showToast(`Invitation envoyée à ${inviteEmail}`)
  }

  function handleRemove(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id))
    showToast("Membre retiré de l'équipe")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <div>
              <CardTitle>18 · Équipe, Collaborateurs & Permissions</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Déléguez la gestion de vos stocks, commandes et factures en toute sécurité
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowInviteModal(true)}
          >
            <UserPlus size={13} />
            Inviter un collaborateur
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          {showInviteModal && (
            <form
              onSubmit={handleInvite}
              className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3 animate-fade-in"
            >
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Inviter un nouveau collaborateur
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Adresse email du collaborateur *
                  </label>
                  <input
                    required
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="collaborateur@gmail.com"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Rôle & Droits d'accès
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as Member["role"])
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground cursor-pointer"
                  >
                    <option value="manager">Gestionnaire Commandes & Livraisons</option>
                    <option value="packer">Préparateur de Stock</option>
                    <option value="accountant">Comptable (Facturation & Versements)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInviteModal(false)}
                >
                  Annuler
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Envoyer l'invitation
                </Button>
              </div>
            </form>
          )}

          {/* Members list */}
          <div className="divide-y divide-border/60 rounded-xl border border-border bg-card overflow-hidden">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                    {member.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground">
                        {member.name}
                      </p>
                      <Badge variant={ROLE_LABELS[member.role].badge}>
                        {ROLE_LABELS[member.role].label}
                      </Badge>
                      {member.status === "invited" && (
                        <Badge variant="warning">Invitation envoyée</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      {member.email}
                    </p>
                  </div>
                </div>

                {member.role !== "owner" && (
                  <button
                    type="button"
                    onClick={() => handleRemove(member.id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer self-end sm:self-center"
                    title="Retirer les accès"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
