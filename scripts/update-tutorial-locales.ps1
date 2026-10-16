$frPath = "src/locales/fr.json"
$enPath = "src/locales/en.json"

$fr = Get-Content $frPath -Raw | ConvertFrom-Json
$en = Get-Content $enPath -Raw | ConvertFrom-Json

# ── FR: New Tours ──────────────────────────────────────────────
$fr.tutorials.tours | Add-Member -NotePropertyName "deliveries" -NotePropertyValue @{
  title = "Suivi GPS & Logistique de Livraison"
  description = "Visualisez et pilotez vos livraisons en temps réel sur la cartographie d'Antananarivo."
} -Force

$fr.tutorials.tours | Add-Member -NotePropertyName "customers" -NotePropertyValue @{
  title = "CRM & Segmentation Clients"
  description = "Analysez votre portefeuille acheteurs et identifiez vos clients VIP, réguliers et nouveaux."
} -Force

$fr.tutorials.tours | Add-Member -NotePropertyName "reviews" -NotePropertyValue @{
  title = "Réputation & Gestion des Avis"
  description = "Surveillez votre note globale, filtrez les avis et répondez professionnellement aux évaluations."
} -Force

$fr.tutorials.tours | Add-Member -NotePropertyName "store" -NotePropertyValue @{
  title = "Configuration de la Boutique"
  description = "Personnalisez l'identité visuelle, les horaires et le mode vacances de votre vitrine en ligne."
} -Force

$fr.tutorials.tours | Add-Member -NotePropertyName "settings" -NotePropertyValue @{
  title = "Paramètres & Centre de Configuration"
  description = "Maîtrisez les 29 paramètres métiers : compte, paiements, équipe, intégrations et conformité."
} -Force

# ── FR: New Steps ──────────────────────────────────────────────

# Orders extra step
$fr.tutorials.steps | Add-Member -NotePropertyName "ordersStatusTabs" -NotePropertyValue @{
  title = "Onglets de Statut de Commande"
  description = "Filtrez par statut (En attente, En préparation, Expédié, Livré, Annulé) pour un traitement ciblé et rapide de votre file de travail."
} -Force

# Products extra step
$fr.tutorials.steps | Add-Member -NotePropertyName "productsSearch" -NotePropertyValue @{
  title = "Recherche & Filtrage du Catalogue"
  description = "Retrouvez instantanément n'importe quelle référence par son nom, SKU ou catégorie. Combinez recherche et filtres de catégorie pour cibler précisément."
} -Force

# Inventory extra step
$fr.tutorials.steps | Add-Member -NotePropertyName "inventoryBulk" -NotePropertyValue @{
  title = "Actions en Masse sur le Stock"
  description = "Sélectionnez plusieurs références simultanément pour ajuster les quantités, exporter ou appliquer un réapprovisionnement groupé — idéal après une livraison fournisseur."
} -Force

# Analytics extra step
$fr.tutorials.steps | Add-Member -NotePropertyName "analyticsExport" -NotePropertyValue @{
  title = "Export & Rapports Financiers"
  description = "Téléchargez vos données de ventes en CSV ou PDF pour vos déclarations fiscales (NIF/STAT Madagascar) ou vos réunions de performance mensuelle."
} -Force

# Deliveries steps
$fr.tutorials.steps | Add-Member -NotePropertyName "deliveriesKpis" -NotePropertyValue @{
  title = "Tableau de Bord Logistique en Temps Réel"
  description = "Quatre indicateurs synthétisent l'état de votre réseau : coursiers en transit, colis en attente d'expédition, livraisons du jour et retards signalés."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "deliveriesFilters" -NotePropertyValue @{
  title = "Filtres de Statut & Contrôle GPS"
  description = "Filtrez la carte par statut de livraison et activez le bouton 'Simuler mouvement' pour observer la mise à jour en direct des positions GPS des coursiers partenaires."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "deliveriesMap" -NotePropertyValue @{
  title = "Cartographie Interactive — Grand Antananarivo"
  description = "Chaque marqueur représente un coursier sur la carte d'Antananarivo (Analakely, Ankorondrano, Ivato, Tanjombato). Cliquez sur un marqueur pour voir le détail de la commande et l'itinéraire prévu."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "deliveriesList" -NotePropertyValue @{
  title = "Liste Synchronisée des Livraisons"
  description = "La liste à droite est synchronisée avec la carte : cliquer sur une livraison centre automatiquement la carte sur le coursier. Utilisez 'Centrer' pour recentrer l'affichage si vous avez bougé la carte."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "deliveriesSimulate" -NotePropertyValue @{
  title = "Simulation de Mouvement GPS"
  description = "Ce mode de démonstration met à jour les positions des coursiers toutes les 3 secondes pour simuler un suivi GPS réel. En production, ce bouton sera remplacé par un flux de données GPS en temps réel depuis votre API backend."
} -Force

# Customers steps
$fr.tutorials.steps | Add-Member -NotePropertyName "customersKpis" -NotePropertyValue @{
  title = "Indicateurs CRM Clés"
  description = "Trois métriques résument la santé de votre base clients : taille du portefeuille, panier moyen par commande et valeur vie totale (LTV) cumulée en Ariary."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "customersSegments" -NotePropertyValue @{
  title = "Segmentation Automatique des Clients"
  description = "Nova Market classe automatiquement vos acheteurs en 4 segments : Tous, VIP (dépenses > 1 000 000 Ar), Réguliers (5+ commandes) et Nouveaux. Utilisez ces filtres pour cibler vos actions commerciales."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "customersSearch" -NotePropertyValue @{
  title = "Recherche Client par Nom ou Email"
  description = "Localisez immédiatement un acheteur pour consulter son historique de commandes, ses coordonnées WhatsApp et son niveau de fidélité."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "customersList" -NotePropertyValue @{
  title = "Fiches Clients & Détail du Profil"
  description = "Cliquez sur n'importe quelle fiche pour ouvrir le panneau détaillé : historique complet des commandes, panier moyen personnel, villes de livraison et actions de contact direct (WhatsApp, email)."
} -Force

# Reviews steps
$fr.tutorials.steps | Add-Member -NotePropertyName "reviewsScore" -NotePropertyValue @{
  title = "Score de Satisfaction Globale"
  description = "Votre note moyenne sur 5 et le taux de satisfaction positifs sont visibles ici. Ce score influence directement votre classement dans les recherches Nova Market et la confiance des acheteurs."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "reviewsFilters" -NotePropertyValue @{
  title = "Filtres Prioritaires des Avis"
  description = "Affichez uniquement les avis 'À répondre' pour vous concentrer sur les clients en attente d'une réponse. Répondre sous 24 heures améliore votre indice de réactivité vendeur."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "reviewsList" -NotePropertyValue @{
  title = "Flux des Avis Vérifiés"
  description = "Chaque avis affiche le nom du client, le produit commandé, la note détaillée et le statut de réponse. Les avis sans réponse sont signalés par un badge orange 'En attente'."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "reviewsReply" -NotePropertyValue @{
  title = "Répondre Professionnellement aux Avis"
  description = "Cliquez sur 'Répondre' pour ouvrir l'éditeur de réponse. Utilisez les modèles de réponses rapides (Remerciement, Satisfaction, Support) pour gagner du temps. Votre réponse est publiée publiquement sur la fiche produit."
} -Force

# Store steps
$fr.tutorials.steps | Add-Member -NotePropertyName "storeHero" -NotePropertyValue @{
  title = "Identité Visuelle de la Boutique"
  description = "La bannière de couverture et le logo sont les premiers éléments vus par les acheteurs. Cliquez sur les boutons appareil photo pour mettre à jour vos visuels. Un profil complet avec photo augmente le taux de conversion de 40%."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "storeVacation" -NotePropertyValue @{
  title = "Mode Vacances & Statut d'Ouverture"
  description = "Activez le Mode Vacances si vous ne pouvez pas expédier temporairement. Les clients verront un message d'indisponibilité et ne pourront plus commander jusqu'à la réactivation. Cela protège votre note de délai d'expédition."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "storeTabs" -NotePropertyValue @{
  title = "Sections de Configuration Boutique"
  description = "Trois onglets structurent la gestion : Informations Générales (nom, description, contact), Horaires d'Ouverture (planning semaine par semaine), et Politiques & Livraison (règles de retour, zones de livraison)."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "storeProfileForm" -NotePropertyValue @{
  title = "Formulaire de Profil & Liens Sociaux"
  description = "Renseignez le nom de votre enseigne, une description engageante et vos coordonnées. Ajoutez vos liens Facebook, Instagram et site web pour renforcer votre crédibilité auprès des acheteurs malgaches."
} -Force

# Settings steps
$fr.tutorials.steps | Add-Member -NotePropertyName "settingsQuickHub" -NotePropertyValue @{
  title = "Accès Rapide aux Pages Dédiées"
  description = "Ce hub regroupe les 8 sections qui disposent d'une page complète indépendante. Cliquez sur une icône pour naviguer directement vers Boutique, Produits, Inventaire, Commandes, Livraisons, Clients, Avis ou Analytiques."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "settingsSidebar" -NotePropertyValue @{
  title = "Navigation par Catégorie de Paramètres"
  description = "La barre latérale classe les 29 paramètres métiers en 4 groupes : Général & Identité, Commerce & Finance, Opérations & Système, et Ressources & Légal. Chaque groupe regroupe les réglages qui fonctionnent ensemble."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "settingsAccount" -NotePropertyValue @{
  title = "Profil & Préférences Personnelles"
  description = "Mettez à jour vos informations de compte (nom, email, téléphone, avatar), choisissez votre thème (Clair/Sombre), changez la langue du portail (Français, Malagasy, English) et configurez l'accessibilité."
} -Force

$fr.tutorials.steps | Add-Member -NotePropertyName "settingsPayments" -NotePropertyValue @{
  title = "Comptes de Versement & Abonnement"
  description = "Gérez vos comptes Mobile Money (Telma MVola, Orange Money, Airtel Money) et bancaires (BNI Madagascar) pour recevoir vos reversements hebdomadaires. Consultez votre abonnement Nova Pro et vos factures de commission."
} -Force

# ── FR: New Settings Labels ────────────────────────────────────
$fr.tutorials.settings | Add-Member -NotePropertyName "deliveriesTour" -NotePropertyValue @{
  title = "Guide Suivi des Livraisons GPS"
  desc = "Apprenez à utiliser la carte interactive, les filtres de statut et la simulation de mouvement GPS pour piloter vos coursiers."
} -Force

$fr.tutorials.settings | Add-Member -NotePropertyName "customersTour" -NotePropertyValue @{
  title = "Guide CRM & Fidélisation Clients"
  desc = "Maîtrisez la segmentation VIP/Régulier/Nouveau et apprenez à consulter les profils acheteurs et leurs historiques de commandes."
} -Force

$fr.tutorials.settings | Add-Member -NotePropertyName "reviewsTour" -NotePropertyValue @{
  title = "Guide Gestion de la Réputation"
  desc = "Apprenez à répondre aux avis, utiliser les modèles de réponses rapides et améliorer votre score de satisfaction vendeur."
} -Force

$fr.tutorials.settings | Add-Member -NotePropertyName "storeTour" -NotePropertyValue @{
  title = "Guide Configuration de la Boutique"
  desc = "Configurez votre identité visuelle, horaires d'ouverture, mode vacances et politiques de retour pour votre vitrine Nova Market."
} -Force

$fr.tutorials.settings | Add-Member -NotePropertyName "settingsTour" -NotePropertyValue @{
  title = "Guide Centre de Paramètres Complet"
  desc = "Naviguez dans les 29 paramètres métiers organisés en 4 groupes : compte, finances, opérations et ressources légales."
} -Force

# ── FR: New Badges ─────────────────────────────────────────────
$fr.tutorials.badges | Add-Member -NotePropertyName "status" -NotePropertyValue "Statut" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "pipeline" -NotePropertyValue "Pipeline" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "bulk" -NotePropertyValue "Masse" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "export" -NotePropertyValue "Export" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "map" -NotePropertyValue "Carte" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "list" -NotePropertyValue "Liste" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "gps" -NotePropertyValue "GPS" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "segments" -NotePropertyValue "Segments" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "score" -NotePropertyValue "Score" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "reply" -NotePropertyValue "Réponse" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "config" -NotePropertyValue "Config" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "edit" -NotePropertyValue "Édition" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "profile" -NotePropertyValue "Profil" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "finance" -NotePropertyValue "Finance" -Force
$fr.tutorials.badges | Add-Member -NotePropertyName "nav" -NotePropertyValue "Navigation" -Force

# Save FR
$fr | ConvertTo-Json -Depth 20 | Set-Content $frPath -Encoding UTF8
Write-Host "FR locale updated successfully"

# ── EN: Mirror with English translations ───────────────────────
$en.tutorials.tours | Add-Member -NotePropertyName "deliveries" -NotePropertyValue @{
  title = "GPS & Delivery Logistics Tracking"
  description = "Visualize and manage your deliveries in real time on the Antananarivo map."
} -Force

$en.tutorials.tours | Add-Member -NotePropertyName "customers" -NotePropertyValue @{
  title = "CRM & Customer Segmentation"
  description = "Analyze your buyer portfolio and identify VIP, regular, and new customers."
} -Force

$en.tutorials.tours | Add-Member -NotePropertyName "reviews" -NotePropertyValue @{
  title = "Reputation & Review Management"
  description = "Monitor your overall rating, filter reviews, and reply professionally to evaluations."
} -Force

$en.tutorials.tours | Add-Member -NotePropertyName "store" -NotePropertyValue @{
  title = "Store Configuration"
  description = "Customize the visual identity, opening hours, and vacation mode of your online storefront."
} -Force

$en.tutorials.tours | Add-Member -NotePropertyName "settings" -NotePropertyValue @{
  title = "Settings & Configuration Hub"
  description = "Master all 29 business settings: account, payments, team, integrations, and compliance."
} -Force

$en.tutorials.steps | Add-Member -NotePropertyName "ordersStatusTabs" -NotePropertyValue @{ title = "Order Status Tabs"; desc = "Filter by status (Pending, Preparing, Shipped, Delivered, Cancelled) for targeted processing of your work queue." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "productsSearch" -NotePropertyValue @{ title = "Catalog Search & Filter"; desc = "Instantly find any product by name, SKU or category. Combine search and category filters to pinpoint exactly what you need." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "inventoryBulk" -NotePropertyValue @{ title = "Bulk Stock Actions"; desc = "Select multiple products simultaneously to adjust quantities, export, or apply bulk restocking — ideal after a supplier delivery." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "analyticsExport" -NotePropertyValue @{ title = "Export & Financial Reports"; desc = "Download your sales data in CSV or PDF for tax declarations or monthly performance reviews." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "deliveriesKpis" -NotePropertyValue @{ title = "Real-Time Logistics Dashboard"; desc = "Four indicators summarize your delivery network: couriers in transit, parcels awaiting dispatch, deliveries today, and reported delays." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "deliveriesFilters" -NotePropertyValue @{ title = "Status Filters & GPS Control"; desc = "Filter the map by delivery status and activate the 'Simulate movement' button to observe real-time GPS position updates of partner couriers." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "deliveriesMap" -NotePropertyValue @{ title = "Interactive Map — Greater Antananarivo"; desc = "Each marker represents a courier on the Antananarivo map. Click a marker to view order details and the planned itinerary." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "deliveriesList" -NotePropertyValue @{ title = "Synchronized Deliveries List"; desc = "The list on the right is synchronized with the map: clicking a delivery automatically centers the map on the courier. Use 'Center' to re-center if you have panned the map." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "deliveriesSimulate" -NotePropertyValue @{ title = "GPS Movement Simulation"; desc = "This demo mode updates courier positions every 3 seconds to simulate real GPS tracking. In production, this will be replaced by a live GPS data stream from your backend API." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "customersKpis" -NotePropertyValue @{ title = "Key CRM Metrics"; desc = "Three metrics summarize your customer base health: portfolio size, average basket per order, and total lifetime value (LTV) in Ariary." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "customersSegments" -NotePropertyValue @{ title = "Automatic Customer Segmentation"; desc = "Nova Market automatically classifies buyers into 4 segments: All, VIP (spending > 1,000,000 Ar), Regular (5+ orders), and New. Use these filters to target your commercial actions." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "customersSearch" -NotePropertyValue @{ title = "Customer Search by Name or Email"; desc = "Instantly locate a buyer to view their order history, WhatsApp contact details, and loyalty level." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "customersList" -NotePropertyValue @{ title = "Customer Cards & Profile Details"; desc = "Click any card to open the detailed panel: complete order history, personal average basket, delivery cities, and direct contact actions (WhatsApp, email)." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "reviewsScore" -NotePropertyValue @{ title = "Global Satisfaction Score"; desc = "Your average rating out of 5 and positive satisfaction rate are visible here. This score directly influences your ranking in Nova Market searches and buyer trust." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "reviewsFilters" -NotePropertyValue @{ title = "Priority Review Filters"; desc = "Show only 'To reply' reviews to focus on customers waiting for a response. Replying within 24 hours improves your seller responsiveness index." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "reviewsList" -NotePropertyValue @{ title = "Verified Reviews Feed"; desc = "Each review shows the customer name, ordered product, detailed rating, and reply status. Unanswered reviews are flagged with an orange 'Pending' badge." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "reviewsReply" -NotePropertyValue @{ title = "Replying Professionally to Reviews"; desc = "Click 'Reply' to open the response editor. Use quick reply templates (Thanks, Satisfaction, Support) to save time. Your response is publicly published on the product page." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "storeHero" -NotePropertyValue @{ title = "Store Visual Identity"; desc = "The cover banner and logo are the first elements buyers see. Click the camera buttons to update your visuals. A complete profile with photo increases conversion rate by 40%." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "storeVacation" -NotePropertyValue @{ title = "Vacation Mode & Opening Status"; desc = "Activate Vacation Mode if you temporarily cannot ship. Customers will see an unavailability message and cannot order until reactivation. This protects your shipping delay score." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "storeTabs" -NotePropertyValue @{ title = "Store Configuration Sections"; desc = "Three tabs structure management: General Information (name, description, contact), Opening Hours (week-by-week schedule), and Policies & Delivery (return rules, delivery zones)." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "storeProfileForm" -NotePropertyValue @{ title = "Profile Form & Social Links"; desc = "Fill in your store name, an engaging description, and contact details. Add your Facebook, Instagram, and website links to strengthen credibility with Malagasy buyers." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "settingsQuickHub" -NotePropertyValue @{ title = "Quick Access to Dedicated Pages"; desc = "This hub groups the 8 sections with independent full pages. Click an icon to navigate directly to Store, Products, Inventory, Orders, Deliveries, Customers, Reviews, or Analytics." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "settingsSidebar" -NotePropertyValue @{ title = "Settings Category Navigation"; desc = "The sidebar organizes 29 business settings into 4 groups: General & Identity, Commerce & Finance, Operations & System, and Resources & Legal." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "settingsAccount" -NotePropertyValue @{ title = "Profile & Personal Preferences"; desc = "Update your account information (name, email, phone, avatar), choose your theme (Light/Dark), change the portal language, and configure accessibility." } -Force
$en.tutorials.steps | Add-Member -NotePropertyName "settingsPayments" -NotePropertyValue @{ title = "Payout Accounts & Subscription"; desc = "Manage your Mobile Money accounts (Telma MVola, Orange Money, Airtel Money) and bank accounts (BNI Madagascar) to receive weekly payouts. View your Nova Pro subscription and commission invoices." } -Force

$en.tutorials.settings | Add-Member -NotePropertyName "deliveriesTour" -NotePropertyValue @{ title = "GPS Delivery Tracking Guide"; desc = "Learn to use the interactive map, status filters, and GPS movement simulation to manage your couriers." } -Force
$en.tutorials.settings | Add-Member -NotePropertyName "customersTour" -NotePropertyValue @{ title = "CRM & Customer Loyalty Guide"; desc = "Master VIP/Regular/New segmentation and learn to view buyer profiles and their order histories." } -Force
$en.tutorials.settings | Add-Member -NotePropertyName "reviewsTour" -NotePropertyValue @{ title = "Reputation Management Guide"; desc = "Learn to reply to reviews, use quick reply templates, and improve your seller satisfaction score." } -Force
$en.tutorials.settings | Add-Member -NotePropertyName "storeTour" -NotePropertyValue @{ title = "Store Configuration Guide"; desc = "Configure your visual identity, opening hours, vacation mode, and return policies for your Nova Market storefront." } -Force
$en.tutorials.settings | Add-Member -NotePropertyName "settingsTour" -NotePropertyValue @{ title = "Complete Settings Hub Guide"; desc = "Navigate through 29 business settings organized in 4 groups: account, finances, operations, and legal resources." } -Force

$en.tutorials.badges | Add-Member -NotePropertyName "status" -NotePropertyValue "Status" -Force
$en.tutorials.badges | Add-Member -NotePropertyName "bulk" -NotePropertyValue "Bulk" -Force
$en.tutorials.badges | Add-Member -NotePropertyName "export" -NotePropertyValue "Export" -Force
$en.tutorials.badges | Add-Member -NotePropertyName "map" -NotePropertyValue "Map" -Force
$en.tutorials.badges | Add-Member -NotePropertyName "list" -NotePropertyValue "List" -Force
$en.tutorials.badges | Add-Member -NotePropertyName "gps" -NotePropertyValue "GPS" -Force
$en.tutorials.badges | Add-Member -NotePropertyName "segments" -NotePropertyValue "Segments" -Force
$en.tutorials.badges | Add-Member -NotePropertyName "score" -NotePropertyValue "Score" -Force
$en.tutorials.badges | Add-Member -NotePropertyName "reply" -NotePropertyValue "Reply" -Force
$en.tutorials.badges | Add-Member -NotePropertyName "config" -NotePropertyValue "Config" -Force
$en.tutorials.badges | Add-Member -NotePropertyName "edit" -NotePropertyValue "Edit" -Force
$en.tutorials.badges | Add-Member -NotePropertyName "profile" -NotePropertyValue "Profile" -Force
$en.tutorials.badges | Add-Member -NotePropertyName "finance" -NotePropertyValue "Finance" -Force
$en.tutorials.badges | Add-Member -NotePropertyName "nav" -NotePropertyValue "Navigation" -Force

# Save EN
$en | ConvertTo-Json -Depth 20 | Set-Content $enPath -Encoding UTF8
Write-Host "EN locale updated successfully"
