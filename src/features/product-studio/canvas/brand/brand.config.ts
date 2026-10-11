/**
 * Central brand identity.
 *
 * NovaMarket Studio identity for product media and seller campaigns.
 * the sidebar, document titles, exports, live post preview, starter templates,
 * and AI seed context all read from this file. Colours live in `palette.ts`.
 */
export const BRAND = {
  /** Product name shown in the header, document titles, and exports. */
  productName: 'NovaMarket Studio',

  /** Social handle used in the live post preview (no leading @). */
  socialHandle: 'novamarket',

  /** Display name used in the live post preview and templates. */
  displayName: 'NovaMarket',

  /** Public website shown on starter templates. */
  website: 'novamarket.mg',

  /** Seed context for the optional AI Assist feature. */
  ai: {
    productDescription: 'Fiches et visuels de vente sur NovaMarket.',
    targetAudience: 'Vendeurs et commerçants NovaMarket.',
    brandVoice: 'Simple, professionnel et adapté au commerce malgache.',
    callToAction: 'Découvrir le produit',
  },
} as const
