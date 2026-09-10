import { baseApi } from "./axios";

export const requestLogin = async (email: string, password: string, remember: boolean) => {
    const response = await baseApi.post("/auth/login", {
        email,
        password,
        remember,
    });
    return response.data;
}