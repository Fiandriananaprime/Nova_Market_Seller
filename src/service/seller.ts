import { api } from "./axios"
import type {
  ApiKey,
  Automation,
  PayoutMethod,
  PayoutMethodInput,
  SellerBusiness,
  SellerAiChatRequest,
  SellerAiChatResponse,
  SellerIntegrations,
  SellerNotificationPreferences,
  SellerProfile,
  SellerPromotion,
  SellerPromotionInput,
  SellerSettings,
  SellerWebhook,
  SellerWebhookTestResponse,
  ShippingSettings,
  StorePolicies,
  Subscription,
  SubscriptionCheckoutResponse,
  SubscriptionPlanRequest,
  SubscriptionPlan,
  TeamMember,
  TeamMemberInviteRequest,
} from "@/type/seller"

export const getSellerProfile = async () => {
  const response = await api.get<SellerProfile>("/seller/profile")
  return response.data
};

export const updateSellerProfile = async (payload: Partial<SellerProfile>) => {
  const response = await api.patch<SellerProfile>("/seller/profile", payload)
  return response.data
};

export const getSellerBusiness = async () => {
  const response = await api.get<SellerBusiness>("/seller/business")
  return response.data
};

export const updateSellerBusiness = async (payload: Partial<SellerBusiness>) => {
  const response = await api.patch<SellerBusiness>("/seller/business", payload)
  return response.data
};

export const getStorePolicies = async () => {
  const response = await api.get<StorePolicies>("/seller/store/policies")
  return response.data
};

export const updateStorePolicies = async (payload: StorePolicies) => {
  const response = await api.patch<StorePolicies>("/seller/store/policies", payload)
  return response.data
};

export const getSellerSettings = async () => {
  const response = await api.get<SellerSettings>("/seller/settings")
  return response.data
};

export const updateSellerSettings = async (payload: Partial<SellerSettings>) => {
  const response = await api.patch<SellerSettings>("/seller/settings", payload)
  return response.data
};

export const getNotificationPreferences = async () => {
  const response = await api.get<SellerNotificationPreferences>("/seller/notifications/preferences")
  return response.data
};

export const updateNotificationPreferences = async (payload: SellerNotificationPreferences) => {
  const response = await api.patch<SellerNotificationPreferences>("/seller/notifications/preferences", payload)
  return response.data
};

export const getPayoutMethods = async () => {
  const response = await api.get<PayoutMethod[]>("/seller/payout-methods")
  return response.data
};

export const createPayoutMethod = async (payload: PayoutMethodInput) => {
  const response = await api.post<PayoutMethod>("/seller/payout-methods", payload)
  return response.data
};

export const updatePayoutMethod = async (id: string, payload: PayoutMethodInput) => {
  const response = await api.patch<PayoutMethod>(`/seller/payout-methods/${id}`, payload)
  return response.data
};

export const deletePayoutMethod = async (id: string) => {
  await api.delete(`/seller/payout-methods/${id}`)
};

export const getShippingSettings = async () => {
  const response = await api.get<ShippingSettings>("/seller/shipping/settings")
  return response.data
};

export const updateShippingSettings = async (payload: ShippingSettings) => {
  const response = await api.patch<ShippingSettings>("/seller/shipping/settings", payload)
  return response.data
};

export const getSubscription = async () => {
  const response = await api.get<Subscription>("/seller/subscription")
  return response.data
};

export const updateSubscription = async (payload: SubscriptionPlanRequest) => {
  const response = await api.patch<Subscription>("/seller/subscription", payload)
  return response.data
};

export const getSubscriptionPlans = async () => {
  const response = await api.get<SubscriptionPlan[]>("/seller/subscription/plans")
  return response.data
};

export const checkoutSubscription = async (payload: SubscriptionPlanRequest) => {
  const response = await api.post<SubscriptionCheckoutResponse>("/seller/subscription/checkout", payload)
  return response.data
};

export const cancelSubscription = async () => {
  const response = await api.post<Subscription>("/seller/subscription/cancel")
  return response.data
};

export const sendSellerAiMessage = async (message: string) => {
  const payload: SellerAiChatRequest = { message }
  const response = await api.post<SellerAiChatResponse>("/seller/ai/chat", payload)
  return response.data
};

export const getAutomations = async () => {
  const response = await api.get<Automation[]>("/seller/automations")
  return response.data
};

export const createAutomation = async (payload: Omit<Automation, "id">) => {
  const response = await api.post<Automation>("/seller/automations", payload)
  return response.data
};

export const updateAutomation = async (id: string, payload: Partial<Automation>) => {
  const response = await api.patch<Automation>(`/seller/automations/${id}`, payload)
  return response.data
};

export const deleteAutomation = async (id: string) => {
  await api.delete(`/seller/automations/${id}`)
};

export const getTeamMembers = async () => {
  const response = await api.get<TeamMember[]>("/seller/team")
  return response.data
};

export const inviteTeamMember = async (payload: TeamMemberInviteRequest) => {
  const response = await api.post<TeamMember>("/seller/team", payload)
  return response.data
};

export const updateTeamMember = async (id: string, payload: Partial<TeamMember>) => {
  const response = await api.patch<TeamMember>(`/seller/team/${id}`, payload)
  return response.data
};

export const deleteTeamMember = async (id: string) => {
  await api.delete(`/seller/team/${id}`)
};

export const getSellerApiKeys = async () => {
  const response = await api.get<ApiKey[] | ApiKey>("/seller/api-keys")
  return response.data
};

export const rotateSellerApiKey = async () => {
  const response = await api.post<ApiKey>("/seller/api-keys/rotate")
  return response.data
};

export const getSellerWebhooks = async () => {
  const response = await api.get<SellerWebhook[]>("/seller/webhooks")
  return response.data
};

export const createSellerWebhook = async (payload: Pick<SellerWebhook, "url" | "events">) => {
  const response = await api.post<SellerWebhook>("/seller/webhooks", payload)
  return response.data
};

export const updateSellerWebhook = async (id: string, payload: Partial<SellerWebhook>) => {
  const response = await api.patch<SellerWebhook>(`/seller/webhooks/${id}`, payload)
  return response.data
};

export const deleteSellerWebhook = async (id: string) => {
  await api.delete(`/seller/webhooks/${id}`)
};

export const testSellerWebhook = async (id: string) => {
  const response = await api.post<SellerWebhookTestResponse>(`/seller/webhooks/${id}/test`)
  return response.data
};

export const getSellerIntegrations = async () => {
  const response = await api.get<SellerIntegrations>("/seller/integrations")
  return response.data
};

export const updateSellerIntegrations = async (payload: SellerIntegrations) => {
  const response = await api.patch<SellerIntegrations>("/seller/integrations", payload)
  return response.data
};

export const getSellerPromotions = async () => {
  const response = await api.get<{ data: SellerPromotion[] } | SellerPromotion[]>("/seller/promotions")
  return Array.isArray(response.data) ? response.data : response.data.data
};

export const createSellerPromotion = async (payload: SellerPromotionInput) => {
  const response = await api.post<SellerPromotion>("/seller/promotions", payload)
  return response.data
};

export const updateSellerPromotion = async (id: string, payload: SellerPromotionInput) => {
  const response = await api.patch<SellerPromotion>(`/seller/promotions/${id}`, payload)
  return response.data
};

export const deleteSellerPromotion = async (id: string) => {
  await api.delete(`/seller/promotions/${id}`)
};
