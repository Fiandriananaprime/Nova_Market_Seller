export type OrderStatus = "pending" | "confirmed" | "processing" | "preparing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type ProductStatus = "active" | "draft" | "inactive" | "pending" | "rejected";
export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Order {
  id: string;
  buyerName: string;
  buyerAvatar: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  deliveryMethod: string;
  city: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  rating: number;
  reviewsCount: number;
  status: ProductStatus;
  image: string;
  createdAt: string;
}

export interface InventoryItem {
  productId: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  reserved: number;
  available: number;
  threshold: number;
  status: InventoryStatus;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  initials: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  status: "active" | "inactive";
  city: string;
}

export interface Review {
  id: string;
  productName: string;
  customerName: string;
  customerInitials: string;
  rating: number;
  comment: string;
  date: string;
  replied: boolean;
  reply?: string;
  status: "published" | "pending" | "hidden";
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  orders: number;
}

export const metrics = {
  revenue: 42_850_000,
  revenueChange: 12.4,
  orders: 318,
  ordersChange: 8.7,
  products: 64,
  productsChange: 5.0,
  customers: 211,
  customersChange: 14.2,
  avgOrderValue: 134_750,
  conversionRate: 3.2,
  storeViews: 9_820,
  pendingOrders: 14,
  lowStockCount: 7,
};

export const revenueSeries: RevenuePoint[] = [
  { month: "Sep 25", revenue: 18_200_000, orders: 142 },
  { month: "Oct 25", revenue: 22_400_000, orders: 178 },
  { month: "Nov 25", revenue: 31_600_000, orders: 241 },
  { month: "Dec 25", revenue: 48_900_000, orders: 387 },
  { month: "Jan 26", revenue: 26_300_000, orders: 198 },
  { month: "Feb 26", revenue: 24_100_000, orders: 183 },
  { month: "Mar 26", revenue: 29_700_000, orders: 224 },
  { month: "Apr 26", revenue: 33_500_000, orders: 259 },
  { month: "May 26", revenue: 37_200_000, orders: 281 },
  { month: "Jun 26", revenue: 35_800_000, orders: 271 },
  { month: "Jul 26", revenue: 39_400_000, orders: 299 },
  { month: "Aug 26", revenue: 42_850_000, orders: 318 },
];

export const orders: Order[] = [
  {
    id: "ORD-2026-318",
    buyerName: "Rakoto Andry",
    buyerAvatar: "RA",
    items: [{ name: "Vanille de Madagascar 100g", qty: 2, price: 45_000 }],
    total: 90_000,
    status: "pending",
    paymentStatus: "paid",
    paymentMethod: "MVola",
    deliveryMethod: "standard",
    city: "Antananarivo",
    createdAt: "2026-09-09T08:14:00Z",
  },
  {
    id: "ORD-2026-317",
    buyerName: "Rasoa Miora",
    buyerAvatar: "RM",
    items: [
      { name: "Raphia Tressé Naturel", qty: 1, price: 78_000 },
      { name: "Collier Pierres Locales", qty: 1, price: 34_000 },
    ],
    total: 112_000,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "Orange Money",
    deliveryMethod: "express",
    city: "Toamasina",
    createdAt: "2026-09-09T07:32:00Z",
  },
  {
    id: "ORD-2026-316",
    buyerName: "Randriamanana Luc",
    buyerAvatar: "RL",
    items: [{ name: "Huile d'Ylang-Ylang 30ml", qty: 3, price: 28_500 }],
    total: 85_500,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "MVola",
    deliveryMethod: "standard",
    city: "Mahajanga",
    createdAt: "2026-09-08T16:45:00Z",
  },
  {
    id: "ORD-2026-315",
    buyerName: "Hery Fanja",
    buyerAvatar: "HF",
    items: [{ name: "Café Arabica Premium 250g", qty: 4, price: 22_000 }],
    total: 88_000,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Card",
    deliveryMethod: "standard",
    city: "Fianarantsoa",
    createdAt: "2026-09-07T11:20:00Z",
  },
  {
    id: "ORD-2026-314",
    buyerName: "Voahangy Soa",
    buyerAvatar: "VS",
    items: [{ name: "Lambahoany Traditionnel", qty: 2, price: 65_000 }],
    total: 130_000,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "MVola",
    deliveryMethod: "express",
    city: "Antananarivo",
    createdAt: "2026-09-07T09:05:00Z",
  },
  {
    id: "ORD-2026-313",
    buyerName: "Jean-Baptiste Rabe",
    buyerAvatar: "JR",
    items: [{ name: "Miel Sauvage 500g", qty: 1, price: 48_000 }],
    total: 48_000,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "Orange Money",
    deliveryMethod: "standard",
    city: "Toliara",
    createdAt: "2026-09-06T14:30:00Z",
  },
  {
    id: "ORD-2026-312",
    buyerName: "Ny Aina Ratsimba",
    buyerAvatar: "NR",
    items: [
      { name: "Figurine Bois Palissandre", qty: 1, price: 120_000 },
      { name: "Vanille de Madagascar 100g", qty: 1, price: 45_000 },
    ],
    total: 165_000,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Card",
    deliveryMethod: "express",
    city: "Antananarivo",
    createdAt: "2026-09-05T10:15:00Z",
  },
  {
    id: "ORD-2026-311",
    buyerName: "Lalaina Rivo",
    buyerAvatar: "LR",
    items: [{ name: "Savon Karité Bio", qty: 6, price: 12_000 }],
    total: 72_000,
    status: "preparing",
    paymentStatus: "paid",
    paymentMethod: "MVola",
    deliveryMethod: "standard",
    city: "Nosy Be",
    createdAt: "2026-09-05T08:50:00Z",
  },
];

export const products: Product[] = [
  {
    id: "prod-001",
    name: "Vanille de Madagascar 100g",
    sku: "VAN-100G",
    category: "Épices & Aromates",
    price: 45_000,
    stock: 142,
    sold: 387,
    rating: 4.8,
    reviewsCount: 94,
    status: "active",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop&auto=format",
    createdAt: "2025-03-12",
  },
  {
    id: "prod-002",
    name: "Café Arabica Premium 250g",
    sku: "CAF-250G",
    category: "Boissons",
    price: 22_000,
    stock: 8,
    sold: 241,
    rating: 4.6,
    reviewsCount: 67,
    status: "active",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&h=80&fit=crop&auto=format",
    createdAt: "2025-04-01",
  },
  {
    id: "prod-003",
    name: "Huile d'Ylang-Ylang 30ml",
    sku: "YYL-30ML",
    category: "Cosmétiques",
    price: 28_500,
    stock: 0,
    sold: 198,
    rating: 4.9,
    reviewsCount: 52,
    status: "active",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=80&h=80&fit=crop&auto=format",
    createdAt: "2025-04-15",
  },
  {
    id: "prod-004",
    name: "Lambahoany Traditionnel",
    sku: "LAM-TRD",
    category: "Textile",
    price: 65_000,
    stock: 34,
    sold: 156,
    rating: 4.7,
    reviewsCount: 41,
    status: "active",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=80&h=80&fit=crop&auto=format",
    createdAt: "2025-05-02",
  },
  {
    id: "prod-005",
    name: "Raphia Tressé Naturel",
    sku: "RAP-TRS",
    category: "Artisanat",
    price: 78_000,
    stock: 19,
    sold: 89,
    rating: 4.5,
    reviewsCount: 28,
    status: "active",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=80&h=80&fit=crop&auto=format",
    createdAt: "2025-05-20",
  },
  {
    id: "prod-006",
    name: "Miel Sauvage 500g",
    sku: "MIEL-500",
    category: "Alimentation",
    price: 48_000,
    stock: 5,
    sold: 134,
    rating: 4.8,
    reviewsCount: 39,
    status: "active",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=80&h=80&fit=crop&auto=format",
    createdAt: "2025-06-01",
  },
  {
    id: "prod-007",
    name: "Figurine Bois Palissandre",
    sku: "FIG-PAL",
    category: "Artisanat",
    price: 120_000,
    stock: 12,
    sold: 47,
    rating: 4.9,
    reviewsCount: 18,
    status: "active",
    image: "https://images.unsplash.com/photo-1569401929847-6dfa71a09f30?w=80&h=80&fit=crop&auto=format",
    createdAt: "2025-06-15",
  },
  {
    id: "prod-008",
    name: "Savon Karité Bio",
    sku: "SAV-KAR",
    category: "Cosmétiques",
    price: 12_000,
    stock: 87,
    sold: 312,
    rating: 4.4,
    reviewsCount: 76,
    status: "active",
    image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=80&h=80&fit=crop&auto=format",
    createdAt: "2025-07-01",
  },
  {
    id: "prod-009",
    name: "Collier Pierres Locales",
    sku: "COL-PIE",
    category: "Bijoux",
    price: 34_000,
    stock: 23,
    sold: 68,
    rating: 4.3,
    reviewsCount: 22,
    status: "active",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=80&h=80&fit=crop&auto=format",
    createdAt: "2025-07-10",
  },
  {
    id: "prod-010",
    name: "Tisane Ravintsara Bio",
    sku: "TIS-RAV",
    category: "Boissons",
    price: 18_000,
    stock: 0,
    sold: 203,
    rating: 4.7,
    reviewsCount: 55,
    status: "inactive",
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=80&h=80&fit=crop&auto=format",
    createdAt: "2025-08-01",
  },
  {
    id: "prod-011",
    name: "Huile de Coco Vierge 250ml",
    sku: "HCO-250",
    category: "Alimentation",
    price: 32_000,
    stock: 0,
    sold: 0,
    rating: 0,
    reviewsCount: 0,
    status: "draft",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop&auto=format",
    createdAt: "2026-09-08",
  },
];

export const inventoryItems: InventoryItem[] = [
  { productId: "prod-002", name: "Café Arabica Premium 250g", sku: "CAF-250G", category: "Boissons", stock: 8, reserved: 3, available: 5, threshold: 15, status: "low_stock" },
  { productId: "prod-006", name: "Miel Sauvage 500g", sku: "MIEL-500", category: "Alimentation", stock: 5, reserved: 2, available: 3, threshold: 10, status: "low_stock" },
  { productId: "prod-003", name: "Huile d'Ylang-Ylang 30ml", sku: "YYL-30ML", category: "Cosmétiques", stock: 0, reserved: 0, available: 0, threshold: 10, status: "out_of_stock" },
  { productId: "prod-010", name: "Tisane Ravintsara Bio", sku: "TIS-RAV", category: "Boissons", stock: 0, reserved: 0, available: 0, threshold: 20, status: "out_of_stock" },
  { productId: "prod-005", name: "Raphia Tressé Naturel", sku: "RAP-TRS", category: "Artisanat", stock: 19, reserved: 4, available: 15, threshold: 20, status: "low_stock" },
  { productId: "prod-007", name: "Figurine Bois Palissandre", sku: "FIG-PAL", category: "Artisanat", stock: 12, reserved: 1, available: 11, threshold: 15, status: "low_stock" },
  { productId: "prod-001", name: "Vanille de Madagascar 100g", sku: "VAN-100G", category: "Épices & Aromates", stock: 142, reserved: 8, available: 134, threshold: 20, status: "in_stock" },
  { productId: "prod-004", name: "Lambahoany Traditionnel", sku: "LAM-TRD", category: "Textile", stock: 34, reserved: 6, available: 28, threshold: 15, status: "in_stock" },
  { productId: "prod-008", name: "Savon Karité Bio", sku: "SAV-KAR", category: "Cosmétiques", stock: 87, reserved: 12, available: 75, threshold: 20, status: "in_stock" },
  { productId: "prod-009", name: "Collier Pierres Locales", sku: "COL-PIE", category: "Bijoux", stock: 23, reserved: 3, available: 20, threshold: 10, status: "in_stock" },
];

export const customers: Customer[] = [
  { id: "cust-001", name: "Rakoto Andry", email: "r.andry@gmail.com", initials: "RA", ordersCount: 12, totalSpent: 1_248_000, lastOrderDate: "2026-09-09", status: "active", city: "Antananarivo" },
  { id: "cust-002", name: "Rasoa Miora", email: "rasoa.m@yahoo.fr", initials: "RM", ordersCount: 8, totalSpent: 876_000, lastOrderDate: "2026-09-09", status: "active", city: "Toamasina" },
  { id: "cust-003", name: "Ny Aina Ratsimba", email: "nyaina.r@gmail.com", initials: "NR", ordersCount: 15, totalSpent: 2_145_000, lastOrderDate: "2026-09-05", status: "active", city: "Antananarivo" },
  { id: "cust-004", name: "Hery Fanja", email: "hfanja@outlook.com", initials: "HF", ordersCount: 6, totalSpent: 528_000, lastOrderDate: "2026-09-07", status: "active", city: "Fianarantsoa" },
  { id: "cust-005", name: "Voahangy Soa", email: "vsoa@gmail.com", initials: "VS", ordersCount: 9, totalSpent: 1_170_000, lastOrderDate: "2026-09-07", status: "active", city: "Antananarivo" },
  { id: "cust-006", name: "Lalaina Rivo", email: "lalaina.rv@gmail.com", initials: "LR", ordersCount: 4, totalSpent: 288_000, lastOrderDate: "2026-09-05", status: "active", city: "Nosy Be" },
  { id: "cust-007", name: "Jean-Baptiste Rabe", email: "jb.rabe@gmail.com", initials: "JR", ordersCount: 3, totalSpent: 144_000, lastOrderDate: "2026-09-06", status: "inactive", city: "Toliara" },
  { id: "cust-008", name: "Randriamanana Luc", email: "r.luc@yahoo.fr", initials: "RL", ordersCount: 7, totalSpent: 598_500, lastOrderDate: "2026-09-08", status: "active", city: "Mahajanga" },
  { id: "cust-009", name: "Fiderana Solo", email: "fid.solo@gmail.com", initials: "FS", ordersCount: 2, totalSpent: 90_000, lastOrderDate: "2026-08-28", status: "inactive", city: "Antananarivo" },
  { id: "cust-010", name: "Tianah Rojo", email: "tianah.r@gmail.com", initials: "TR", ordersCount: 11, totalSpent: 1_485_000, lastOrderDate: "2026-09-03", status: "active", city: "Antsiranana" },
];

export const reviews: Review[] = [
  {
    id: "rev-001",
    productName: "Vanille de Madagascar 100g",
    customerName: "Ny Aina Ratsimba",
    customerInitials: "NR",
    rating: 5,
    comment: "Qualité exceptionnelle ! La vanille est d'une fraîcheur et d'un arôme incomparable. Je commande régulièrement et je ne suis jamais déçu. Livraison rapide et emballage soigné.",
    date: "2026-09-07",
    replied: true,
    reply: "Merci infiniment pour votre fidélité et ce retour chaleureux ! Nous sélectionnons uniquement les meilleures gousses de la région SAVA.",
    status: "published",
  },
  {
    id: "rev-002",
    productName: "Huile d'Ylang-Ylang 30ml",
    customerName: "Rasoa Miora",
    customerInitials: "RM",
    rating: 5,
    comment: "Parfum envoûtant et très pur. J'utilise cette huile en aromathérapie et le résultat est remarquable. Authentique ylang-ylang de Nosy Be.",
    date: "2026-09-06",
    replied: false,
    status: "published",
  },
  {
    id: "rev-003",
    productName: "Café Arabica Premium 250g",
    customerName: "Hery Fanja",
    customerInitials: "HF",
    rating: 4,
    comment: "Très bon café, saveur riche et équilibrée. L'emballage pourrait être amélioré mais le produit est excellent.",
    date: "2026-09-05",
    replied: false,
    status: "published",
  },
  {
    id: "rev-004",
    productName: "Lambahoany Traditionnel",
    customerName: "Voahangy Soa",
    customerInitials: "VS",
    rating: 5,
    comment: "Magnifique pièce ! Les couleurs sont vives et le tissu est de très bonne qualité. Conforme aux photos. Je le recommande sans hésitation.",
    date: "2026-09-04",
    replied: true,
    reply: "Merci beaucoup Voahangy ! Nos lambahoany sont tissés par des artisans locaux de Soavinandriana.",
    status: "published",
  },
  {
    id: "rev-005",
    productName: "Miel Sauvage 500g",
    customerName: "Rakoto Andry",
    customerInitials: "RA",
    rating: 4,
    comment: "Miel authentique avec un goût très particulier, différent du miel industriel. On sent le terroir malgache. Légèrement cristallisé à la livraison, ce qui est normal.",
    date: "2026-09-03",
    replied: false,
    status: "published",
  },
  {
    id: "rev-006",
    productName: "Savon Karité Bio",
    customerName: "Lalaina Rivo",
    customerInitials: "LR",
    rating: 3,
    comment: "Savon correct, mais je m'attendais à un parfum plus prononcé. Ma peau est hydratée mais le produit est assez basique.",
    date: "2026-09-01",
    replied: false,
    status: "published",
  },
  {
    id: "rev-007",
    productName: "Figurine Bois Palissandre",
    customerName: "Jean-Baptiste Rabe",
    customerInitials: "JR",
    rating: 5,
    comment: "Superbe sculpture ! Le travail est très détaillé et le bois de palissandre est magnifique. C'est un cadeau idéal pour représenter l'artisanat malgache.",
    date: "2026-08-30",
    replied: true,
    reply: "Merci Jean-Baptiste ! Nos sculpteurs de Zafimaniry travaillent chaque pièce à la main avec un soin exceptionnel.",
    status: "published",
  },
];

export const topProducts = [
  { name: "Vanille de Madagascar 100g", revenue: 17_415_000, units: 387, growth: 18.2 },
  { name: "Savon Karité Bio", revenue: 3_744_000, units: 312, growth: 12.5 },
  { name: "Café Arabica Premium 250g", revenue: 5_302_000, units: 241, growth: 6.8 },
  { name: "Tisane Ravintsara Bio", revenue: 3_654_000, units: 203, growth: -4.2 },
  { name: "Huile d'Ylang-Ylang 30ml", revenue: 5_643_000, units: 198, growth: 9.1 },
];

export const categoryBreakdown = [
  { name: "Épices & Aromates", percentage: 41 },
  { name: "Cosmétiques", percentage: 22 },
  { name: "Boissons", percentage: 16 },
  { name: "Artisanat", percentage: 11 },
  { name: "Autres", percentage: 10 },
];

export const storeInfo = {
  name: "Madagascar Nature Boutique",
  slug: "madagascar-nature",
  description: "Vente de produits naturels et artisanaux authentiques de Madagascar. Nous travaillons directement avec des producteurs locaux pour garantir la qualité et soutenir l'économie locale.",
  location: "Antananarivo, Madagascar",
  phone: "+261 34 12 345 67",
  email: "contact@madagascar-nature.mg",
  logoUrl: "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=200&h=200&fit=crop&auto=format",
  coverUrl: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&h=400&fit=crop&auto=format",
  verified: true,
  rating: 4.7,
  reviewsCount: 430,
  productsCount: 64,
  followersCount: 1_248,
  joinedYear: "2024",
  isOpen: true,
  vacationMode: false,
  socialLinks: {
    facebook: "fb.com/madagascar-nature",
    instagram: "@madagascar_nature",
    website: "madagascar-nature.mg",
  },
};

export function formatMGA(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M Ar`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K Ar`;
  }
  return `${amount.toLocaleString()} Ar`;
}

export function formatFullMGA(amount: number): string {
  return `${amount.toLocaleString("fr-MG")} Ar`;
}
