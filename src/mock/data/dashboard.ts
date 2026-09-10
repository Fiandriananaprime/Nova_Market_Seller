export const sellerDashboard = {
  metrics: {
    revenue: 8450000,
    orders: 184,
    products: 47,
    lowStock: 6,

    revenueChangePct: 12.8,
    ordersChangePct: 8.4,
    productsChangePct: 4.2,
    lowStockChangePct: -14.3,
  },

  revenueSeries: [
    {
      month: "Jan",
      revenue: 5200000,
      orders: 96,
    },
    {
      month: "Feb",
      revenue: 6100000,
      orders: 108,
    },
    {
      month: "Mar",
      revenue: 5700000,
      orders: 102,
    },
    {
      month: "Apr",
      revenue: 6900000,
      orders: 121,
    },
    {
      month: "May",
      revenue: 7350000,
      orders: 143,
    },
    {
      month: "Jun",
      revenue: 8100000,
      orders: 167,
    },
    {
      month: "Jul",
      revenue: 8450000,
      orders: 184,
    },
  ],

  recentOrders: [
    {
      id: "ORD-2026-001",
      buyerId: "b1f6c7a2-1001-4c8e-9001-000000000001",
      buyerName: "Rakoto Andry",

      items: [
        {
          productId: "p001",
          productName: "Smartphone Samsung Galaxy A15",
          image: "https://placehold.co/100x100",
          price: 899000,
          qty: 1,
          sellerId: "s001",
          sellerName: "Nova Tech",
        },
      ],

      sellers: [
        {
          id: "s001",
          name: "Nova Tech",
        },
      ],

      subtotal: 899000,
      shippingFee: 15000,
      total: 914000,

      status: "delivered",
      deliveryMethod: "standard",
      paymentMethod: "mvola",
      paymentStatus: "paid",

      address: {
        id: "addr001",
        label: "Maison",
        recipientName: "Rakoto Andry",
        phone: "+261341234567",
        street: "Lot II M 45",
        district: "Analakely",
        city: "Antananarivo",
        region: "Analamanga",
        postalCode: "101",
        country: "MG",
        latitude: -18.91,
        longitude: 47.52,
        instructions: null,
        isDefault: true,
      },

      tracking: "TRK-MG-001",
      estimatedDelivery: "2026-09-08T10:00:00+03:00",
      note: null,

      createdAt: "2026-09-01T09:30:00+03:00",
      updatedAt: "2026-09-05T15:20:00+03:00",
    },

    {
      id: "ORD-2026-002",
      buyerId: "b1f6c7a2-1002-4c8e-9001-000000000002",
      buyerName: "Rasoa Marie",

      items: [
        {
          productId: "p002",
          productName: "Casque Bluetooth JBL",
          image: "https://placehold.co/100x100",
          price: 245000,
          qty: 2,
          sellerId: "s001",
          sellerName: "Nova Tech",
        },
      ],

      sellers: [
        {
          id: "s001",
          name: "Nova Tech",
        },
      ],

      subtotal: 490000,
      shippingFee: 10000,
      total: 500000,

      status: "processing",
      deliveryMethod: "express",
      paymentMethod: "orange_money",
      paymentStatus: "paid",

      address: {
        id: "addr002",
        label: "Bureau",
        recipientName: "Rasoa Marie",
        phone: "+261325678901",
        street: "Rue Rainandriamampandry",
        district: "Behoririka",
        city: "Antananarivo",
        region: "Analamanga",
        postalCode: "101",
        country: "MG",
        latitude: -18.905,
        longitude: 47.525,
        instructions: "Appeler avant livraison",
        isDefault: false,
      },

      tracking: "TRK-MG-002",
      estimatedDelivery: "2026-09-11T14:00:00+03:00",
      note: "Livraison urgente",

      createdAt: "2026-09-07T11:15:00+03:00",
      updatedAt: "2026-09-09T08:45:00+03:00",
    },

    {
      id: "ORD-2026-003",
      buyerId: "b1f6c7a2-1003-4c8e-9001-000000000003",
      buyerName: "Hery Rakotomalala",

      items: [
        {
          productId: "p003",
          productName: "Clavier mécanique RGB",
          image: "https://placehold.co/100x100",
          price: 320000,
          qty: 1,
          sellerId: "s001",
          sellerName: "Nova Tech",
        },
      ],

      sellers: [
        {
          id: "s001",
          name: "Nova Tech",
        },
      ],

      subtotal: 320000,
      shippingFee: 15000,
      total: 335000,

      status: "pending",
      deliveryMethod: "pickup",
      paymentMethod: "cod",
      paymentStatus: "pending",

      address: {
        id: "addr003",
        label: "Pickup",
        recipientName: "Hery Rakotomalala",
        phone: "+261331112233",
        street: "Indépendance",
        district: "Analakely",
        city: "Antananarivo",
        region: "Analamanga",
        postalCode: "101",
        country: "MG",
        latitude: null,
        longitude: null,
        instructions: null,
        isDefault: false,
      },

      tracking: null,
      estimatedDelivery: null,
      note: null,

      createdAt: "2026-09-10T09:20:00+03:00",
      updatedAt: "2026-09-10T09:20:00+03:00",
    },
  ],
};