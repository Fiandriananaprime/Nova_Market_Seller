import { api, baseApi } from "./axios";
import type { AuthMe, User } from "@/type/auth"

export const requestLogin = async (identifier: string, password: string, remember: boolean): Promise<User> => {
    const response = await baseApi.post("/auth/login", {
        identifier,
        password,
        remember,
    });
    return response.data;
}

export const getCurrentUser = async (): Promise<AuthMe> => {
    const response = await api.get<AuthMe>("/auth/me")
    return response.data
}

export const requestLogout = async (): Promise<void> => {
    await api.post("/auth/logout");
}