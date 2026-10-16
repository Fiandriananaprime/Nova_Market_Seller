import { useState } from "react"
import {
  FileText,
  MessageCircle,
  PhoneCall,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  LifeBuoy,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardBody, Button, Badge } from "@/components/ui"

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: "Quand et comment sont versés mes fonds de vente (MVola / Orange Money / Banque) ?",
    answer:
      "Les reversements sont déclenchés automatiquement tous les lundis matin pour les commandes livrées et validées par les clients durant la semaine précédente. Vous pouvez également demander un déblocage express en milieu de semaine si votre solde dépasse 100 000 Ar.",
  },
  {
    question: "Que faire si un acheteur refuse son colis lors de la livraison à Antananarivo ?",
    answer:
      "Le livreur Nova Market ou votre transporteur partenaire enregistre le motif de refus sur l'application. Si le motif est imputable au client (absence, changement d'avis), les frais de livraison restent facturés conformément aux CGV Vendeur et l'article est réintégré à votre stock.",
  },
  {
    question: "Comment fonctionne la commission Nova Market sur les ventes ?",
    answer:
      "La commission est de 5% HT sur les commandes finalisées pour les vendeurs abonnés au forfait Pro. Les frais de livraison sont reversés à 100% sans commission déduite.",
  },
  {
    question: "Comment faire certifier ma boutique avec le badge officiel 'Marchand Vérifié' ?",
    answer:
      "Rendez-vous dans l'onglet 'Informations Professionnelles & Fiscalité' et téléversez votre Carte Statistique (STAT), votre NIF et la pièce d'identité du gérant. L'équipe conformité valide le dossier sous 24 à 48 heures ouvrées.",
  },
]

export const HelpPoliciesTab = ({ showToast }: { showToast: (message: string) => void }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LifeBuoy size={18} className="text-primary" />
            <CardTitle>26. Aide & Support Vendeur Dédié</CardTitle>
          </div>
          <Badge variant="success">Support Actif 7j/7</Badge>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Une équipe d'assistance Nova Market basée à Antananarivo est disponible pour vous accompagner dans vos opérations quotidiennes.
          </p>

          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <a
              href="https://wa.me/261340000000?text=Bonjour%20Support%20Nova%20Market,%20j'ai%20besoin%20d'aide%20pour%20mon%20compte%20vendeur"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MessageCircle size={18} />
                </div>
                <ExternalLink size={14} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold text-foreground">WhatsApp Vendeur</p>
                <p className="text-[11px] text-muted-foreground">+261 34 00 000 00</p>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Réponse &lt; 15 min</span>
              </div>
            </a>

            
            <a
              href="tel:+261202200000"
              className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <PhoneCall size={18} />
                </div>
                <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold text-foreground">Ligne Téléphonique</p>
                <p className="text-[11px] text-muted-foreground">+261 20 22 000 00</p>
                <span className="text-[10px] text-muted-foreground mt-1 block">Lun - Sam 08h-18h</span>
              </div>
            </a>

            
            <a
              href="mailto:support.seller@novamarket.mg"
              className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold text-foreground">Email Dédié</p>
                <p className="text-[11px] text-muted-foreground truncate">support.seller@novamarket.mg</p>
                <span className="text-[10px] text-muted-foreground mt-1 block">Sous 24 heures</span>
              </div>
            </a>
          </div>

          
          <div className="pt-2 space-y-2">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <BookOpen size={14} className="text-primary" />
              Questions Fréquentes (FAQ Vendeur)
            </p>

            <div className="space-y-2">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={index}
                    className="border border-border/80 rounded-xl overflow-hidden bg-card"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-semibold text-foreground hover:bg-muted/30 transition-colors"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp size={15} className="shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronDown size={15} className="shrink-0 text-muted-foreground" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-2.5">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <CardTitle>27. Conditions, Chartes & Politiques Juridiques</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast("Accords contractuels synchronisés")}
          >
            <CheckCircle2 size={14} className="mr-1" />
            Attestation vérifiée
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Documents régissant l'utilisation de la plateforme de commerce électronique Nova Market conformément à la législation malagasy (Loi n° 2014-006).
          </p>

          <div className="space-y-3">
            
            <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Conditions Générales de Vente Marchand (CGV Seller v3.2)
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Acceptées le 15 Janvier 2026 • Barème de commissions et règles de versement
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Accepté</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => showToast("Téléchargement du contrat PDF...")}
                >
                  Lire PDF
                </Button>
              </div>
            </div>

            
            <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Charte de Qualité des Produits & Lutte Anti-Contrefaçon
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Engagement d'authenticité et respect des normes sanitaires et de sécurité
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Conforme</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => showToast("Téléchargement de la charte qualité...")}
                >
                  Lire PDF
                </Button>
              </div>
            </div>

            
            <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Protection des Données Personnelles (Loi n° 2014-006 Madagascar)
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Confidentialité stricte des coordonnées acheteurs et interdiction de prospection non sollicitée
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Ratifié</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => showToast("Téléchargement de la politique vie privée...")}
                >
                  Lire PDF
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
};
