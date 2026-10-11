export type SellerPlan = "free" | "pro" | "max"
export const SELLER_PLAN: SellerPlan = "pro"
export const PLAN_ENTITLEMENTS: Record<SellerPlan, { price: number; aiQuota: string; automation: "browse" | "simple" | "advanced" }> = {
  free: { price: 0, aiQuota: "basic", automation: "browse" },
  pro: { price: 100_000, aiQuota: "increased", automation: "simple" },
  max: { price: 1_000_000, aiQuota: "five-times-free", automation: "advanced" },
}
export const canUseAutomationBuilder = (plan: SellerPlan) => PLAN_ENTITLEMENTS[plan].automation !== "browse"
