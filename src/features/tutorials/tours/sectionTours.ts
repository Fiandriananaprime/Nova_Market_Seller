import type { TourDefinition } from "../types"

                                                                
                                        
                                                                
export const ordersTour: TourDefinition = {
  id: "orders",
  route: "/orders",
  titleKey: "tutorials.tours.orders.title",
  descriptionKey: "tutorials.tours.orders.description",
  steps: [
    {
      element: '[data-tour="orders-view-toggle"]',
      titleKey: "tutorials.steps.ordersView.title",
      descriptionKey: "tutorials.steps.ordersView.desc",
      side: "bottom",
      align: "end",
      icon: "🔀",
      badgeKey: "tutorials.badges.feature",
    },
    {
      element: '[data-tour="orders-search-filter"]',
      titleKey: "tutorials.steps.ordersFilter.title",
      descriptionKey: "tutorials.steps.ordersFilter.desc",
      side: "bottom",
      align: "start",
      icon: "🔍",
      badgeKey: "tutorials.badges.search",
    },
    {
      element: '[data-tour="orders-content"]',
      titleKey: "tutorials.steps.ordersContent.title",
      descriptionKey: "tutorials.steps.ordersContent.desc",
      side: "top",
      align: "center",
      icon: "⚡",
      badgeKey: "tutorials.badges.pipeline",
    },
    {
      element: '[data-tour="orders-status-tabs"]',
      titleKey: "tutorials.steps.ordersStatusTabs.title",
      descriptionKey: "tutorials.steps.ordersStatusTabs.desc",
      side: "bottom",
      align: "start",
      icon: "🗂️",
      badgeKey: "tutorials.badges.status",
    },
  ],
}

                                                                
                                    
                                                                
export const productsTour: TourDefinition = {
  id: "products",
  route: "/products",
  titleKey: "tutorials.tours.products.title",
  descriptionKey: "tutorials.tours.products.description",
  steps: [
    {
      element: '[data-tour="products-add-btn"]',
      titleKey: "tutorials.steps.productsAdd.title",
      descriptionKey: "tutorials.steps.productsAdd.desc",
      side: "bottom",
      align: "end",
      icon: "➕",
      badgeKey: "tutorials.badges.action",
    },
    {
      element: '[data-tour="products-view-toggle"]',
      titleKey: "tutorials.steps.productsToggle.title",
      descriptionKey: "tutorials.steps.productsToggle.desc",
      side: "bottom",
      align: "start",
      icon: "🖼️",
      badgeKey: "tutorials.badges.catalog",
    },
    {
      element: '[data-tour="products-categories"]',
      titleKey: "tutorials.steps.productsCategories.title",
      descriptionKey: "tutorials.steps.productsCategories.desc",
      side: "bottom",
      align: "start",
      icon: "🏷️",
      badgeKey: "tutorials.badges.filters",
    },
    {
      element: '[data-tour="products-search"]',
      titleKey: "tutorials.steps.productsSearch.title",
      descriptionKey: "tutorials.steps.productsSearch.desc",
      side: "bottom",
      align: "start",
      icon: "🔍",
      badgeKey: "tutorials.badges.search",
    },
  ],
}

                                                                
                              
                                                                
export const inventoryTour: TourDefinition = {
  id: "inventory",
  route: "/inventory",
  titleKey: "tutorials.tours.inventory.title",
  descriptionKey: "tutorials.tours.inventory.description",
  steps: [
    {
      element: '[data-tour="inventory-radar"]',
      titleKey: "tutorials.steps.inventoryRadar.title",
      descriptionKey: "tutorials.steps.inventoryRadar.desc",
      side: "bottom",
      align: "center",
      icon: "🎯",
      badgeKey: "tutorials.badges.radar",
    },
    {
      element: '[data-tour="inventory-filters"]',
      titleKey: "tutorials.steps.inventoryFilters.title",
      descriptionKey: "tutorials.steps.inventoryFilters.desc",
      side: "bottom",
      align: "start",
      icon: "⚠️",
      badgeKey: "tutorials.badges.alerts",
    },
    {
      element: '[data-tour="inventory-steppers"]',
      titleKey: "tutorials.steps.inventorySteppers.title",
      descriptionKey: "tutorials.steps.inventorySteppers.desc",
      side: "top",
      align: "center",
      icon: "🔢",
      badgeKey: "tutorials.badges.adjust",
    },
    {
      element: '[data-tour="inventory-items-grid"]',
      titleKey: "tutorials.steps.inventoryBulk.title",
      descriptionKey: "tutorials.steps.inventoryBulk.desc",
      side: "top",
      align: "center",
      icon: "📋",
      badgeKey: "tutorials.badges.bulk",
    },
  ],
}

                                                                
                                      
                                                                
export const analyticsTour: TourDefinition = {
  id: "analytics",
  route: "/analytics",
  titleKey: "tutorials.tours.analytics.title",
  descriptionKey: "tutorials.tours.analytics.description",
  steps: [
    {
      element: '[data-tour="analytics-period-toggle"]',
      titleKey: "tutorials.steps.analyticsPeriod.title",
      descriptionKey: "tutorials.steps.analyticsPeriod.desc",
      side: "bottom",
      align: "end",
      icon: "📅",
      badgeKey: "tutorials.badges.period",
    },
    {
      element: '[data-tour="analytics-kpis"]',
      titleKey: "tutorials.steps.analyticsKpis.title",
      descriptionKey: "tutorials.steps.analyticsKpis.desc",
      side: "bottom",
      align: "center",
      icon: "📈",
      badgeKey: "tutorials.badges.metrics",
    },
    {
      element: '[data-tour="analytics-charts"]',
      titleKey: "tutorials.steps.analyticsCharts.title",
      descriptionKey: "tutorials.steps.analyticsCharts.desc",
      side: "top",
      align: "center",
      icon: "🍩",
      badgeKey: "tutorials.badges.analytics",
    },
    {
      element: '[data-tour="analytics-export"]',
      titleKey: "tutorials.steps.analyticsExport.title",
      descriptionKey: "tutorials.steps.analyticsExport.desc",
      side: "bottom",
      align: "end",
      icon: "📥",
      badgeKey: "tutorials.badges.export",
    },
  ],
}

                                                                
                                         
                                                                
export const deliveriesTour: TourDefinition = {
  id: "deliveries",
  route: "/deliveries",
  titleKey: "tutorials.tours.deliveries.title",
  descriptionKey: "tutorials.tours.deliveries.description",
  steps: [
    {
      element: '[data-tour="deliveries-kpis"]',
      titleKey: "tutorials.steps.deliveriesKpis.title",
      descriptionKey: "tutorials.steps.deliveriesKpis.desc",
      side: "bottom",
      align: "center",
      icon: "🚚",
      badgeKey: "tutorials.badges.metrics",
    },
    {
      element: '[data-tour="deliveries-filters"]',
      titleKey: "tutorials.steps.deliveriesFilters.title",
      descriptionKey: "tutorials.steps.deliveriesFilters.desc",
      side: "bottom",
      align: "start",
      icon: "🔍",
      badgeKey: "tutorials.badges.search",
    },
    {
      element: '[data-tour="deliveries-map"]',
      titleKey: "tutorials.steps.deliveriesMap.title",
      descriptionKey: "tutorials.steps.deliveriesMap.desc",
      side: "right",
      align: "center",
      icon: "🗺️",
      badgeKey: "tutorials.badges.map",
    },
    {
      element: '[data-tour="deliveries-list"]',
      titleKey: "tutorials.steps.deliveriesList.title",
      descriptionKey: "tutorials.steps.deliveriesList.desc",
      side: "left",
      align: "start",
      icon: "📋",
      badgeKey: "tutorials.badges.list",
    },
    {
      element: '[data-tour="deliveries-simulate"]',
      titleKey: "tutorials.steps.deliveriesSimulate.title",
      descriptionKey: "tutorials.steps.deliveriesSimulate.desc",
      side: "bottom",
      align: "end",
      icon: "📡",
      badgeKey: "tutorials.badges.gps",
    },
  ],
}

                                                                
                                 
                                                                
export const customersTour: TourDefinition = {
  id: "customers",
  route: "/customers",
  titleKey: "tutorials.tours.customers.title",
  descriptionKey: "tutorials.tours.customers.description",
  steps: [
    {
      element: '[data-tour="customers-kpis"]',
      titleKey: "tutorials.steps.customersKpis.title",
      descriptionKey: "tutorials.steps.customersKpis.desc",
      side: "bottom",
      align: "center",
      icon: "👥",
      badgeKey: "tutorials.badges.metrics",
    },
    {
      element: '[data-tour="customers-segments"]',
      titleKey: "tutorials.steps.customersSegments.title",
      descriptionKey: "tutorials.steps.customersSegments.desc",
      side: "bottom",
      align: "start",
      icon: "🏆",
      badgeKey: "tutorials.badges.segments",
    },
    {
      element: '[data-tour="customers-search"]',
      titleKey: "tutorials.steps.customersSearch.title",
      descriptionKey: "tutorials.steps.customersSearch.desc",
      side: "bottom",
      align: "start",
      icon: "🔍",
      badgeKey: "tutorials.badges.search",
    },
    {
      element: '[data-tour="customers-list"]',
      titleKey: "tutorials.steps.customersList.title",
      descriptionKey: "tutorials.steps.customersList.desc",
      side: "top",
      align: "center",
      icon: "📊",
      badgeKey: "tutorials.badges.list",
    },
  ],
}

                                                                
                              
                                                                
export const reviewsTour: TourDefinition = {
  id: "reviews",
  route: "/reviews",
  titleKey: "tutorials.tours.reviews.title",
  descriptionKey: "tutorials.tours.reviews.description",
  steps: [
    {
      element: '[data-tour="reviews-score"]',
      titleKey: "tutorials.steps.reviewsScore.title",
      descriptionKey: "tutorials.steps.reviewsScore.desc",
      side: "right",
      align: "center",
      icon: "⭐",
      badgeKey: "tutorials.badges.score",
    },
    {
      element: '[data-tour="reviews-filters"]',
      titleKey: "tutorials.steps.reviewsFilters.title",
      descriptionKey: "tutorials.steps.reviewsFilters.desc",
      side: "bottom",
      align: "start",
      icon: "🔍",
      badgeKey: "tutorials.badges.filters",
    },
    {
      element: '[data-tour="reviews-list"]',
      titleKey: "tutorials.steps.reviewsList.title",
      descriptionKey: "tutorials.steps.reviewsList.desc",
      side: "top",
      align: "center",
      icon: "💬",
      badgeKey: "tutorials.badges.list",
    },
    {
      element: '[data-tour="reviews-reply"]',
      titleKey: "tutorials.steps.reviewsReply.title",
      descriptionKey: "tutorials.steps.reviewsReply.desc",
      side: "top",
      align: "center",
      icon: "✍️",
      badgeKey: "tutorials.badges.reply",
    },
  ],
}

                                                                
                                         
                                                                
export const storeTour: TourDefinition = {
  id: "store",
  route: "/store",
  titleKey: "tutorials.tours.store.title",
  descriptionKey: "tutorials.tours.store.description",
  steps: [
    {
      element: '[data-tour="store-hero"]',
      titleKey: "tutorials.steps.storeHero.title",
      descriptionKey: "tutorials.steps.storeHero.desc",
      side: "bottom",
      align: "center",
      icon: "🏪",
      badgeKey: "tutorials.badges.store",
    },
    {
      element: '[data-tour="store-vacation"]',
      titleKey: "tutorials.steps.storeVacation.title",
      descriptionKey: "tutorials.steps.storeVacation.desc",
      side: "left",
      align: "center",
      icon: "🌴",
      badgeKey: "tutorials.badges.status",
    },
    {
      element: '[data-tour="store-tabs"]',
      titleKey: "tutorials.steps.storeTabs.title",
      descriptionKey: "tutorials.steps.storeTabs.desc",
      side: "bottom",
      align: "start",
      icon: "⚙️",
      badgeKey: "tutorials.badges.config",
    },
    {
      element: '[data-tour="store-profile-form"]',
      titleKey: "tutorials.steps.storeProfileForm.title",
      descriptionKey: "tutorials.steps.storeProfileForm.desc",
      side: "top",
      align: "center",
      icon: "✏️",
      badgeKey: "tutorials.badges.edit",
    },
  ],
}

                                                                
                                        
                                                                
export const settingsTour: TourDefinition = {
  id: "settings",
  route: "/settings",
  titleKey: "tutorials.tours.settings.title",
  descriptionKey: "tutorials.tours.settings.description",
  steps: [
    {
      element: '[data-tour="settings-quickhub"]',
      titleKey: "tutorials.steps.settingsQuickHub.title",
      descriptionKey: "tutorials.steps.settingsQuickHub.desc",
      side: "bottom",
      align: "center",
      icon: "🚀",
      badgeKey: "tutorials.badges.feature",
    },
    {
      element: '[data-tour="settings-sidebar"]',
      titleKey: "tutorials.steps.settingsSidebar.title",
      descriptionKey: "tutorials.steps.settingsSidebar.desc",
      side: "right",
      align: "start",
      icon: "🗂️",
      badgeKey: "tutorials.badges.nav",
    },
    {
      element: '[data-tour="settings-account"]',
      titleKey: "tutorials.steps.settingsAccount.title",
      descriptionKey: "tutorials.steps.settingsAccount.desc",
      side: "top",
      align: "center",
      icon: "👤",
      badgeKey: "tutorials.badges.profile",
    },
    {
      element: '[data-tour="settings-payments"]',
      titleKey: "tutorials.steps.settingsPayments.title",
      descriptionKey: "tutorials.steps.settingsPayments.desc",
      side: "top",
      align: "center",
      icon: "💳",
      badgeKey: "tutorials.badges.finance",
    },
  ],
}

                                                                
                     
                                                                
export const allTours: TourDefinition[] = [
  ordersTour,
  productsTour,
  inventoryTour,
  analyticsTour,
  deliveriesTour,
  customersTour,
  reviewsTour,
  storeTour,
  settingsTour,
]
