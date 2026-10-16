import type {
  DeliveryRecord,
  DeliveryStats,
} from "../types/deliveryTracking.types"

const INITIAL_MOCK_DELIVERIES: DeliveryRecord[] = [
  {
    id: "DEL-2026-001",
    orderId: "ORD-2026-318",
    orderReference: "ORD-2026-318",
    status: "in_transit",
    coordinates: { lat: -18.8925, lng: 47.521 },
    initialCoordinates: { lat: -18.8821, lng: 47.5189 },
    targetCoordinates: { lat: -18.9067, lng: 47.5256 },
    heading: 165,
    destination: {
      recipientName: "Hanta Raveloson",
      phone: "+261 34 88 123 45",
      street: "14 Rue Patrice Lumumba",
      district: "Analakely",
      city: "Antananarivo",
      postalCode: "101",
      instructions: "Immeuble rose en face de la pharmacie, 2ème étage.",
    },
    driver: {
      id: "DRV-01",
      name: "Rado Rakoto",
      phone: "+261 34 12 345 67",
      vehicleType: "motorcycle",
      vehiclePlate: "4512 TAB",
      rating: 4.9,
    },
    items: [
      { id: "item-1", name: "Café Arabica de Madagascar 500g", qty: 2, price: 32000 },
      { id: "item-2", name: "Miel d'Eucalyptus Pur 250g", qty: 1, price: 18000 },
    ],
    totalAmount: 82000,
    paymentMethod: "mvola",
    deliveryMethod: "express",
    dispatchedAt: "2026-10-09T12:45:00Z",
    estimatedArrival: "2026-10-09T13:25:00Z",
    lastUpdate: "Il y a 3 min",
    timeline: [
      {
        status: "order_created",
        timestamp: "12:10",
        label: "Commande confirmée",
        description: "Paiement Mvola vérifié",
      },
      {
        status: "awaiting_dispatch",
        timestamp: "12:30",
        label: "Préparée au centre de tri",
        location: "Hub Andraharo",
      },
      {
        status: "in_transit",
        timestamp: "12:45",
        label: "Prise en charge par le coursier",
        description: "En route vers Analakely",
      },
    ],
    isDelayed: false,
  },
  {
    id: "DEL-2026-002",
    orderId: "ORD-2026-315",
    orderReference: "ORD-2026-315",
    status: "in_transit",
    coordinates: { lat: -18.878, lng: 47.531 },
    initialCoordinates: { lat: -18.8872, lng: 47.5273 },
    targetCoordinates: { lat: -18.8681, lng: 47.5482 },
    heading: 42,
    destination: {
      recipientName: "Michel Randriamihaingo",
      phone: "+261 32 77 456 78",
      street: "Villa Soa, Lot IVB",
      district: "Analamahitsy",
      city: "Antananarivo",
      postalCode: "101",
      instructions: "Sonner au portail vert ou appeler à l'arrivée.",
    },
    driver: {
      id: "DRV-02",
      name: "Tojo Andriamaharo",
      phone: "+261 32 45 678 90",
      vehicleType: "motorcycle",
      vehiclePlate: "8914 TAA",
      rating: 4.8,
    },
    items: [
      { id: "item-3", name: "Gousses de Vanille Bourbon Gourmet 50g", qty: 3, price: 54000 },
      { id: "item-4", name: "Poivre Sauvage Voatsiperifery 100g", qty: 2, price: 28000 },
    ],
    totalAmount: 218000,
    paymentMethod: "orange_money",
    deliveryMethod: "express",
    dispatchedAt: "2026-10-09T12:50:00Z",
    estimatedArrival: "2026-10-09T13:35:00Z",
    lastUpdate: "Il y a 1 min",
    timeline: [
      {
        status: "order_created",
        timestamp: "11:55",
        label: "Commande validée",
      },
      {
        status: "awaiting_dispatch",
        timestamp: "12:25",
        label: "Colis scellé et étiqueté",
        location: "Entrepôt Ankorondrano",
      },
      {
        status: "in_transit",
        timestamp: "12:50",
        label: "Pris en charge",
        description: "En route vers Analamahitsy",
      },
    ],
    isDelayed: false,
  },
  {
    id: "DEL-2026-003",
    orderId: "ORD-2026-312",
    orderReference: "ORD-2026-312",
    status: "delayed",
    coordinates: { lat: -18.948, lng: 47.524 },
    initialCoordinates: { lat: -18.9542, lng: 47.5264 },
    targetCoordinates: { lat: -18.962, lng: 47.531 },
    heading: 195,
    destination: {
      recipientName: "Bao Faniry",
      phone: "+261 33 44 987 65",
      street: "Résidence Iavoloha, Bloc C",
      district: "Iavoloha",
      city: "Antananarivo",
      postalCode: "102",
      instructions: "Laisser au poste de garde si absent.",
    },
    driver: {
      id: "DRV-03",
      name: "Mamy Razafindrakoto",
      phone: "+261 33 98 765 43",
      vehicleType: "van",
      vehiclePlate: "2390 TBC",
      rating: 4.7,
    },
    items: [
      { id: "item-5", name: "Baies Roses de Sambava Grade A 200g", qty: 4, price: 24000 },
      { id: "item-6", name: "Curcuma Pur de Manakara 250g", qty: 2, price: 16000 },
    ],
    totalAmount: 128000,
    paymentMethod: "card",
    deliveryMethod: "standard",
    dispatchedAt: "2026-10-09T11:40:00Z",
    estimatedArrival: "2026-10-09T13:45:00Z",
    lastUpdate: "Il y a 6 min",
    timeline: [
      {
        status: "order_created",
        timestamp: "10:30",
        label: "Commande enregistrée",
      },
      {
        status: "in_transit",
        timestamp: "11:40",
        label: "Expédié par camionnette",
      },
      {
        status: "delayed",
        timestamp: "12:55",
        label: "Ralentissement détecté",
        description: "Embouteillage majeur sur l'axe RN7 / Tanjombato",
      },
    ],
    isDelayed: true,
    delayReason: "Embouteillage important au rond-point Tanjombato (+25 min)",
  },
  {
    id: "DEL-2026-004",
    orderId: "ORD-2026-310",
    orderReference: "ORD-2026-310",
    status: "awaiting_dispatch",
    coordinates: { lat: -18.7969, lng: 47.4789 },
    initialCoordinates: { lat: -18.7969, lng: 47.4789 },
    targetCoordinates: { lat: -18.835, lng: 47.502 },
    heading: 140,
    destination: {
      recipientName: "Soa Rabearivelo",
      phone: "+261 34 55 333 22",
      street: "Lot VT 89 Talatamaty",
      district: "Talatamaty",
      city: "Antananarivo",
      postalCode: "105",
      instructions: "Livraison avant 16h au bureau.",
    },
    items: [
      { id: "item-7", name: "Huile Essentielle Ravintsara Bio 30ml", qty: 5, price: 35000 },
    ],
    totalAmount: 175000,
    paymentMethod: "mvola",
    deliveryMethod: "standard",
    estimatedArrival: "2026-10-09T15:30:00Z",
    lastUpdate: "Il y a 14 min",
    timeline: [
      {
        status: "order_created",
        timestamp: "12:15",
        label: "Commande enregistrée",
      },
      {
        status: "awaiting_dispatch",
        timestamp: "12:40",
        label: "Conditionnement terminé",
        location: "Plateforme Logistique Ivato",
      },
    ],
    isDelayed: false,
  },
  {
    id: "DEL-2026-005",
    orderId: "ORD-2026-308",
    orderReference: "ORD-2026-308",
    status: "in_transit",
    coordinates: { lat: -18.911, lng: 47.518 },
    initialCoordinates: { lat: -18.9135, lng: 47.5218 },
    targetCoordinates: { lat: -18.924, lng: 47.529 },
    heading: 130,
    destination: {
      recipientName: "Arisoa Rakotomalala",
      phone: "+261 32 11 999 88",
      street: "Rue Ravelojaona, Ambanidia",
      district: "Ambanidia",
      city: "Antananarivo",
      postalCode: "101",
    },
    driver: {
      id: "DRV-04",
      name: "Hery Randrianarivelo",
      phone: "+261 34 56 789 01",
      vehicleType: "motorcycle",
      vehiclePlate: "1105 TAC",
      rating: 5.0,
    },
    items: [
      { id: "item-8", name: "Chocolat Artisanal Menakao 72% 100g", qty: 6, price: 15000 },
    ],
    totalAmount: 90000,
    paymentMethod: "cod",
    deliveryMethod: "express",
    dispatchedAt: "2026-10-09T13:00:00Z",
    estimatedArrival: "2026-10-09T13:20:00Z",
    lastUpdate: "Il y a 2 min",
    timeline: [
      {
        status: "order_created",
        timestamp: "12:35",
        label: "Commande passée",
      },
      {
        status: "in_transit",
        timestamp: "13:00",
        label: "Coursier en route",
        location: "Centre Isoraka",
      },
    ],
    isDelayed: false,
  },
  {
    id: "DEL-2026-006",
    orderId: "ORD-2026-304",
    orderReference: "ORD-2026-304",
    status: "delivered",
    coordinates: { lat: -18.8732, lng: 47.4912 },
    initialCoordinates: { lat: -18.8821, lng: 47.5189 },
    targetCoordinates: { lat: -18.8732, lng: 47.4912 },
    heading: 270,
    destination: {
      recipientName: "Dr. Nirina Rajaonah",
      phone: "+261 33 12 777 66",
      street: "Cabinet Médical, Ambohimanarina",
      district: "Ambohimanarina",
      city: "Antananarivo",
      postalCode: "101",
    },
    driver: {
      id: "DRV-01",
      name: "Rado Rakoto",
      phone: "+261 34 12 345 67",
      vehicleType: "motorcycle",
      vehiclePlate: "4512 TAB",
      rating: 4.9,
    },
    items: [
      { id: "item-9", name: "Thé Vert Sahambavy Sélection 250g", qty: 3, price: 14000 },
      { id: "item-10", name: "Tisane Citronnelle & Gingembre Bio", qty: 2, price: 11000 },
    ],
    totalAmount: 64000,
    paymentMethod: "mvola",
    deliveryMethod: "standard",
    dispatchedAt: "2026-10-09T10:30:00Z",
    deliveredAt: "2026-10-09T11:42:00Z",
    lastUpdate: "Livrée à 11:42",
    timeline: [
      {
        status: "order_created",
        timestamp: "09:40",
        label: "Commande validée",
      },
      {
        status: "in_transit",
        timestamp: "10:30",
        label: "En cours d'acheminement",
      },
      {
        status: "delivered",
        timestamp: "11:42",
        label: "Remis en main propre",
        description: "Signature client enregistrée",
      },
    ],
    isDelayed: false,
  },
  {
    id: "DEL-2026-007",
    orderId: "ORD-2026-301",
    orderReference: "ORD-2026-301",
    status: "delivered",
    coordinates: { lat: -18.901, lng: 47.534 },
    initialCoordinates: { lat: -18.8872, lng: 47.5273 },
    targetCoordinates: { lat: -18.901, lng: 47.534 },
    heading: 155,
    destination: {
      recipientName: "Clara Ramanantsoa",
      phone: "+261 34 77 000 11",
      street: "Logement 12, Ampandrana Est",
      district: "Ampandrana",
      city: "Antananarivo",
      postalCode: "101",
    },
    driver: {
      id: "DRV-02",
      name: "Tojo Andriamaharo",
      phone: "+261 32 45 678 90",
      vehicleType: "motorcycle",
      vehiclePlate: "8914 TAA",
      rating: 4.8,
    },
    items: [
      { id: "item-11", name: "Cannelle de Ceylan moulue 100g", qty: 2, price: 12500 },
      { id: "item-12", name: "Clous de Girofle de Mananjary 100g", qty: 2, price: 18000 },
    ],
    totalAmount: 61000,
    paymentMethod: "orange_money",
    deliveryMethod: "express",
    dispatchedAt: "2026-10-09T09:20:00Z",
    deliveredAt: "2026-10-09T10:15:00Z",
    lastUpdate: "Livrée à 10:15",
    timeline: [
      {
        status: "order_created",
        timestamp: "08:50",
        label: "Commande confirmée",
      },
      {
        status: "in_transit",
        timestamp: "09:20",
        label: "Départ livreur",
      },
      {
        status: "delivered",
        timestamp: "10:15",
        label: "Livraison terminée",
      },
    ],
    isDelayed: false,
  },
  {
    id: "DEL-2026-008",
    orderId: "ORD-2026-298",
    orderReference: "ORD-2026-298",
    status: "awaiting_dispatch",
    coordinates: { lat: -18.9542, lng: 47.5264 },
    initialCoordinates: { lat: -18.9542, lng: 47.5264 },
    targetCoordinates: { lat: -18.908, lng: 47.519 },
    heading: 350,
    destination: {
      recipientName: "Jean-Marc Andrianasolo",
      phone: "+261 32 99 222 11",
      street: "Rue Gallieni, Antaninarenina",
      district: "Antaninarenina",
      city: "Antananarivo",
      postalCode: "101",
    },
    items: [
      { id: "item-13", name: "Coffret Prestige Épices de Madagascar (5 variétés)", qty: 1, price: 110000 },
    ],
    totalAmount: 110000,
    paymentMethod: "card",
    deliveryMethod: "express",
    estimatedArrival: "2026-10-09T16:00:00Z",
    lastUpdate: "Il y a 30 min",
    timeline: [
      {
        status: "order_created",
        timestamp: "11:20",
        label: "Commande confirmée",
      },
      {
        status: "awaiting_dispatch",
        timestamp: "12:00",
        label: "En attente de ramassage coursier",
        location: "Dépôt Tanjombato",
      },
    ],
    isDelayed: false,
  },
]

export class MockDeliveryTrackingService {
  private deliveries: DeliveryRecord[] = [...INITIAL_MOCK_DELIVERIES]

  async getDeliveries(): Promise<DeliveryRecord[]> {
                                     
    await new Promise((resolve) => setTimeout(resolve, 150))
    return JSON.parse(JSON.stringify(this.deliveries))
  }

  async getDeliveryById(id: string): Promise<DeliveryRecord | null> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    const item = this.deliveries.find((d) => d.id === id || d.orderReference === id)
    return item ? JSON.parse(JSON.stringify(item)) : null
  }

  async getDeliveryStats(): Promise<DeliveryStats> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    const inTransit = this.deliveries.filter((d) => d.status === "in_transit").length
    const awaitingDispatch = this.deliveries.filter((d) => d.status === "awaiting_dispatch").length
    const today = new Date().toDateString()
    const deliveredToday = this.deliveries.filter((d) =>
      d.status === "delivered" && d.deliveredAt && new Date(d.deliveredAt).toDateString() === today,
    ).length
    const delayed = this.deliveries.filter((d) => d.status === "delayed" || d.isDelayed).length

    return {
      totalActive: this.deliveries.filter((d) => d.status !== "delivered").length,
      awaitingDispatch,
      inTransit,
      deliveredToday,
      delayed,
    }
  }

     
                                                                                             
                                                
     
  simulateMovement(records: DeliveryRecord[]): DeliveryRecord[] {
    return records.map((record) => {
      if (record.status !== "in_transit" && record.status !== "delayed") {
        return record
      }

      const { lat: curLat, lng: curLng } = record.coordinates
      const { lat: targetLat, lng: targetLng } = record.targetCoordinates

                                                                   
      const stepFactor = record.status === "delayed" ? 0.0003 : 0.0008
      const dLat = (targetLat - curLat) * 0.05 + (Math.random() - 0.5) * stepFactor
      const dLng = (targetLng - curLng) * 0.05 + (Math.random() - 0.5) * stepFactor

      const nextLat = curLat + dLat
      const nextLng = curLng + dLng

                                         
      const angle = (Math.atan2(dLng, dLat) * 180) / Math.PI
      const normalizedHeading = (angle + 360) % 360

      return {
        ...record,
        coordinates: {
          lat: Number(nextLat.toFixed(6)),
          lng: Number(nextLng.toFixed(6)),
        },
        heading: Math.round(normalizedHeading),
        lastUpdate: "À l'instant",
      }
    })
  }
}

export const mockDeliveryTrackingService = new MockDeliveryTrackingService()
