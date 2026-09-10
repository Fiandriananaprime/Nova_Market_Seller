export interface Store {
        id: string
        name: string
        slug: string
        logoUrl: string | null
        coverUrl: string | null
        verified:boolean 
        rating: number
        reviewsCount: number
        productsCount: number
        location: string | null
        joinedYear: string
        followersCount: number
        description: string | null
        isOpen: boolean
        annualRevenue: number
        ordersCount: number
}