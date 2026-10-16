/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")

const frPath = path.join(__dirname, "../src/locales/fr.json")
const enPath = path.join(__dirname, "../src/locales/en.json")

const fr = JSON.parse(fs.readFileSync(frPath, "utf8"))
const en = JSON.parse(fs.readFileSync(enPath, "utf8"))

// ── Helper ─────────────────────────────────────────────────────
function merge(target, additions) {
  for (const [k, v] of Object.entries(additions)) {
    if (typeof v === "object" && !Array.isArray(v) && target[k] && typeof target[k] === "object") {
      merge(target[k], v)
    } else {
      target[k] = v
    }
  }
}

// ── FR additions ───────────────────────────────────────────────
merge(fr, {
  tutorials: {
    tours: {
      deliveries: {
        title: "Suivi GPS & Logistique de Livraison",
        description: "Visualisez et pilotez vos livraisons en temps réel sur la cartographie d'Antananarivo.",
      },
      customers: {
        title: "CRM & Segmentation Clients",
        description: "Analysez votre portefeuille acheteurs et identifiez vos clients VIP, réguliers et nouveaux.",
      },
      reviews: {
        title: "Réputation & Gestion des Avis",
        description: "Surveillez votre note globale, filtrez les avis et répondez professionnellement aux évaluations.",
      },
      store: {
        title: "Configuration de la Boutique",
        description: "Personnalisez l'identité visuelle, les horaires et le mode vacances de votre vitrine en ligne.",
      },
      settings: {
        title: "Paramètres & Centre de Configuration",
        description: "Maîtrisez les 29 paramètres métiers : compte, paiements, équipe, intégrations et conformité.",
      },
    },
    steps: {
      ordersStatusTabs: {
        title: "Onglets de Statut de Commande",
        desc: "Filtrez par statut (En attente, En préparation, Expédié, Livré, Annulé) pour un traitement ciblé et rapide de votre file de travail.",
      },
      productsSearch: {
        title: "Recherche & Filtrage du Catalogue",
        desc: "Retrouvez instantanément n'importe quelle référence par son nom, SKU ou catégorie. Combinez recherche et filtres de catégorie pour cibler précisément.",
      },
      inventoryBulk: {
        title: "Actions en Masse sur le Stock",
        desc: "Sélectionnez plusieurs références simultanément pour ajuster les quantités, exporter ou appliquer un réapprovisionnement groupé — idéal après une livraison fournisseur.",
      },
      analyticsExport: {
        title: "Export & Rapports Financiers",
        desc: "Téléchargez vos données de ventes en CSV ou PDF pour vos déclarations fiscales (NIF/STAT Madagascar) ou vos réunions de performance mensuelle.",
      },
      deliveriesKpis: {
        title: "Tableau de Bord Logistique en Temps Réel",
        desc: "Quatre indicateurs synthétisent l'état de votre réseau : coursiers en transit, colis en attente d'expédition, livraisons du jour et retards signalés.",
      },
      deliveriesFilters: {
        title: "Filtres de Statut & Contrôle GPS",
        desc: "Filtrez la carte par statut de livraison et activez le bouton 'Simuler mouvement' pour observer la mise à jour en direct des positions GPS des coursiers partenaires.",
      },
      deliveriesMap: {
        title: "Cartographie Interactive — Grand Antananarivo",
        desc: "Chaque marqueur représente un coursier sur la carte d'Antananarivo (Analakely, Ankorondrano, Ivato, Tanjombato). Cliquez sur un marqueur pour voir le détail de la commande et l'itinéraire prévu.",
      },
      deliveriesList: {
        title: "Liste Synchronisée des Livraisons",
        desc: "La liste à droite est synchronisée avec la carte : cliquer sur une livraison centre automatiquement la carte sur le coursier. Utilisez 'Centrer' pour recentrer l'affichage si vous avez bougé la carte.",
      },
      deliveriesSimulate: {
        title: "Simulation de Mouvement GPS",
        desc: "Ce mode de démonstration met à jour les positions des coursiers toutes les 3 secondes pour simuler un suivi GPS réel. En production, ce bouton sera remplacé par un flux de données GPS en temps réel depuis votre API backend.",
      },
      customersKpis: {
        title: "Indicateurs CRM Clés",
        desc: "Trois métriques résument la santé de votre base clients : taille du portefeuille, panier moyen par commande et valeur vie totale (LTV) cumulée en Ariary.",
      },
      customersSegments: {
        title: "Segmentation Automatique des Clients",
        desc: "Nova Market classe automatiquement vos acheteurs en 4 segments : Tous, VIP (dépenses > 1 000 000 Ar), Réguliers (5+ commandes) et Nouveaux. Utilisez ces filtres pour cibler vos actions commerciales.",
      },
      customersSearch: {
        title: "Recherche Client par Nom ou Email",
        desc: "Localisez immédiatement un acheteur pour consulter son historique de commandes, ses coordonnées WhatsApp et son niveau de fidélité.",
      },
      customersList: {
        title: "Fiches Clients & Détail du Profil",
        desc: "Cliquez sur n'importe quelle fiche pour ouvrir le panneau détaillé : historique complet des commandes, panier moyen personnel, villes de livraison et actions de contact direct (WhatsApp, email).",
      },
      reviewsScore: {
        title: "Score de Satisfaction Globale",
        desc: "Votre note moyenne sur 5 et le taux de satisfaction positifs sont visibles ici. Ce score influence directement votre classement dans les recherches Nova Market et la confiance des acheteurs.",
      },
      reviewsFilters: {
        title: "Filtres Prioritaires des Avis",
        desc: "Affichez uniquement les avis 'À répondre' pour vous concentrer sur les clients en attente d'une réponse. Répondre sous 24 heures améliore votre indice de réactivité vendeur.",
      },
      reviewsList: {
        title: "Flux des Avis Vérifiés",
        desc: "Chaque avis affiche le nom du client, le produit commandé, la note détaillée et le statut de réponse. Les avis sans réponse sont signalés par un badge orange 'En attente'.",
      },
      reviewsReply: {
        title: "Répondre Professionnellement aux Avis",
        desc: "Cliquez sur 'Répondre' pour ouvrir l'éditeur de réponse. Utilisez les modèles de réponses rapides (Remerciement, Satisfaction, Support) pour gagner du temps. Votre réponse est publiée publiquement sur la fiche produit.",
      },
      storeHero: {
        title: "Identité Visuelle de la Boutique",
        desc: "La bannière de couverture et le logo sont les premiers éléments vus par les acheteurs. Cliquez sur les boutons appareil photo pour mettre à jour vos visuels. Un profil complet avec photo augmente le taux de conversion de 40%.",
      },
      storeVacation: {
        title: "Mode Vacances & Statut d'Ouverture",
        desc: "Activez le Mode Vacances si vous ne pouvez pas expédier temporairement. Les clients verront un message d'indisponibilité et ne pourront plus commander jusqu'à la réactivation. Cela protège votre note de délai d'expédition.",
      },
      storeTabs: {
        title: "Sections de Configuration Boutique",
        desc: "Trois onglets structurent la gestion : Informations Générales (nom, description, contact), Horaires d'Ouverture (planning hebdomadaire), et Politiques & Livraison (règles de retour, zones de livraison).",
      },
      storeProfileForm: {
        title: "Formulaire de Profil & Liens Sociaux",
        desc: "Renseignez le nom de votre enseigne, une description engageante et vos coordonnées. Ajoutez vos liens Facebook, Instagram et site web pour renforcer votre crédibilité auprès des acheteurs malgaches.",
      },
      settingsQuickHub: {
        title: "Accès Rapide aux Pages Dédiées",
        desc: "Ce hub regroupe les 8 sections qui disposent d'une page complète indépendante. Cliquez sur une icône pour naviguer directement vers Boutique, Produits, Inventaire, Commandes, Livraisons, Clients, Avis ou Analytiques.",
      },
      settingsSidebar: {
        title: "Navigation par Catégorie de Paramètres",
        desc: "La barre latérale classe les 29 paramètres métiers en 4 groupes : Général & Identité, Commerce & Finance, Opérations & Système, et Ressources & Légal. Chaque groupe regroupe les réglages qui fonctionnent ensemble.",
      },
      settingsAccount: {
        title: "Profil & Préférences Personnelles",
        desc: "Mettez à jour vos informations de compte (nom, email, téléphone, avatar), choisissez votre thème (Clair/Sombre), changez la langue du portail et configurez les options d'accessibilité.",
      },
      settingsPayments: {
        title: "Comptes de Versement & Abonnement",
        desc: "Gérez vos comptes Mobile Money (Telma MVola, Orange Money, Airtel Money) et bancaires (BNI Madagascar) pour recevoir vos reversements hebdomadaires. Consultez votre abonnement Nova Pro et vos factures de commission.",
      },
    },
    settings: {
      deliveriesTour: {
        title: "Guide Suivi des Livraisons GPS",
        desc: "Apprenez à utiliser la carte interactive, les filtres de statut et la simulation de mouvement GPS pour piloter vos coursiers.",
      },
      customersTour: {
        title: "Guide CRM & Fidélisation Clients",
        desc: "Maîtrisez la segmentation VIP/Régulier/Nouveau et apprenez à consulter les profils acheteurs et leurs historiques de commandes.",
      },
      reviewsTour: {
        title: "Guide Gestion de la Réputation",
        desc: "Apprenez à répondre aux avis, utiliser les modèles de réponses rapides et améliorer votre score de satisfaction vendeur.",
      },
      storeTour: {
        title: "Guide Configuration de la Boutique",
        desc: "Configurez votre identité visuelle, horaires d'ouverture, mode vacances et politiques de retour pour votre vitrine Nova Market.",
      },
      settingsTour: {
        title: "Guide Centre de Paramètres Complet",
        desc: "Naviguez dans les 29 paramètres métiers organisés en 4 groupes : compte, finances, opérations et ressources légales.",
      },
    },
    badges: {
      status: "Statut",
      bulk: "Masse",
      export: "Export",
      map: "Carte",
      list: "Liste",
      gps: "GPS",
      segments: "Segments",
      score: "Score",
      reply: "Réponse",
      config: "Config",
      edit: "Édition",
      profile: "Profil",
      finance: "Finance",
    },
  },
})

// ── EN additions ───────────────────────────────────────────────
merge(en, {
  tutorials: {
    tours: {
      deliveries: {
        title: "GPS & Delivery Logistics Tracking",
        description: "Visualize and manage your deliveries in real time on the Antananarivo map.",
      },
      customers: {
        title: "CRM & Customer Segmentation",
        description: "Analyze your buyer portfolio and identify VIP, regular, and new customers.",
      },
      reviews: {
        title: "Reputation & Review Management",
        description: "Monitor your overall rating, filter reviews, and reply professionally to evaluations.",
      },
      store: {
        title: "Store Configuration",
        description: "Customize the visual identity, opening hours, and vacation mode of your online storefront.",
      },
      settings: {
        title: "Settings & Configuration Hub",
        description: "Master all 29 business settings: account, payments, team, integrations, and compliance.",
      },
    },
    steps: {
      ordersStatusTabs: { title: "Order Status Tabs", desc: "Filter by status (Pending, Preparing, Shipped, Delivered, Cancelled) for targeted processing of your work queue." },
      productsSearch: { title: "Catalog Search & Filter", desc: "Instantly find any product by name, SKU or category. Combine search and category filters to pinpoint exactly what you need." },
      inventoryBulk: { title: "Bulk Stock Actions", desc: "Select multiple products simultaneously to adjust quantities, export, or apply bulk restocking — ideal after a supplier delivery." },
      analyticsExport: { title: "Export & Financial Reports", desc: "Download your sales data in CSV or PDF for tax declarations or monthly performance reviews." },
      deliveriesKpis: { title: "Real-Time Logistics Dashboard", desc: "Four indicators summarize your delivery network: couriers in transit, parcels awaiting dispatch, deliveries today, and reported delays." },
      deliveriesFilters: { title: "Status Filters & GPS Control", desc: "Filter the map by delivery status and activate the 'Simulate movement' button to observe real-time GPS position updates of partner couriers." },
      deliveriesMap: { title: "Interactive Map — Greater Antananarivo", desc: "Each marker represents a courier on the Antananarivo map. Click a marker to view order details and the planned itinerary." },
      deliveriesList: { title: "Synchronized Deliveries List", desc: "The list on the right is synchronized with the map: clicking a delivery automatically centers the map on the courier." },
      deliveriesSimulate: { title: "GPS Movement Simulation", desc: "This demo mode updates courier positions every 3 seconds to simulate real GPS tracking. In production, this will be replaced by a live GPS data stream from your backend API." },
      customersKpis: { title: "Key CRM Metrics", desc: "Three metrics summarize your customer base health: portfolio size, average basket per order, and total lifetime value (LTV) in Ariary." },
      customersSegments: { title: "Automatic Customer Segmentation", desc: "Nova Market classifies buyers into 4 segments: All, VIP (spending > 1,000,000 Ar), Regular (5+ orders), and New. Use these filters to target your commercial actions." },
      customersSearch: { title: "Customer Search by Name or Email", desc: "Instantly locate a buyer to view their order history, WhatsApp contact details, and loyalty level." },
      customersList: { title: "Customer Cards & Profile Details", desc: "Click any card to open the detailed panel: complete order history, personal average basket, delivery cities, and direct contact actions (WhatsApp, email)." },
      reviewsScore: { title: "Global Satisfaction Score", desc: "Your average rating out of 5 and positive satisfaction rate are visible here. This score directly influences your ranking in Nova Market searches and buyer trust." },
      reviewsFilters: { title: "Priority Review Filters", desc: "Show only 'To reply' reviews to focus on customers waiting for a response. Replying within 24 hours improves your seller responsiveness index." },
      reviewsList: { title: "Verified Reviews Feed", desc: "Each review shows the customer name, ordered product, detailed rating, and reply status. Unanswered reviews are flagged with an orange 'Pending' badge." },
      reviewsReply: { title: "Replying Professionally to Reviews", desc: "Click 'Reply' to open the response editor. Use quick reply templates (Thanks, Satisfaction, Support) to save time. Your response is publicly published on the product page." },
      storeHero: { title: "Store Visual Identity", desc: "The cover banner and logo are the first elements buyers see. Click the camera buttons to update your visuals. A complete profile with photo increases conversion rate by 40%." },
      storeVacation: { title: "Vacation Mode & Opening Status", desc: "Activate Vacation Mode if you temporarily cannot ship. Customers will see an unavailability message and cannot order until reactivation. This protects your shipping delay score." },
      storeTabs: { title: "Store Configuration Sections", desc: "Three tabs structure management: General Information (name, description, contact), Opening Hours (weekly schedule), and Policies & Delivery (return rules, delivery zones)." },
      storeProfileForm: { title: "Profile Form & Social Links", desc: "Fill in your store name, an engaging description, and contact details. Add your Facebook, Instagram, and website links to strengthen credibility with Malagasy buyers." },
      settingsQuickHub: { title: "Quick Access to Dedicated Pages", desc: "This hub groups the 8 sections with independent full pages. Click an icon to navigate directly to Store, Products, Inventory, Orders, Deliveries, Customers, Reviews, or Analytics." },
      settingsSidebar: { title: "Settings Category Navigation", desc: "The sidebar organizes 29 business settings into 4 groups: General & Identity, Commerce & Finance, Operations & System, and Resources & Legal." },
      settingsAccount: { title: "Profile & Personal Preferences", desc: "Update your account information (name, email, phone, avatar), choose your theme (Light/Dark), change the portal language, and configure accessibility." },
      settingsPayments: { title: "Payout Accounts & Subscription", desc: "Manage your Mobile Money accounts (Telma MVola, Orange Money, Airtel Money) and bank accounts (BNI Madagascar) to receive weekly payouts." },
    },
    settings: {
      deliveriesTour: { title: "GPS Delivery Tracking Guide", desc: "Learn to use the interactive map, status filters, and GPS movement simulation to manage your couriers." },
      customersTour: { title: "CRM & Customer Loyalty Guide", desc: "Master VIP/Regular/New segmentation and learn to view buyer profiles and their order histories." },
      reviewsTour: { title: "Reputation Management Guide", desc: "Learn to reply to reviews, use quick reply templates, and improve your seller satisfaction score." },
      storeTour: { title: "Store Configuration Guide", desc: "Configure your visual identity, opening hours, vacation mode, and return policies for your Nova Market storefront." },
      settingsTour: { title: "Complete Settings Hub Guide", desc: "Navigate through 29 business settings organized in 4 groups: account, finances, operations, and legal resources." },
    },
    badges: {
      status: "Status",
      bulk: "Bulk",
      export: "Export",
      map: "Map",
      list: "List",
      gps: "GPS",
      segments: "Segments",
      score: "Score",
      reply: "Reply",
      config: "Config",
      edit: "Edit",
      profile: "Profile",
      finance: "Finance",
    },
  },
})

fs.writeFileSync(frPath, JSON.stringify(fr, null, 2), "utf8")
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), "utf8")
console.log("✅ Both locales updated successfully")
console.log(`  FR: ${frPath}`)
console.log(`  EN: ${enPath}`)
