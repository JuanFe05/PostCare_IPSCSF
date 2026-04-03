import axiosInstance from "./axiosInstance";
import type { LoginRequest, AuthResponse } from "../types/Auth.types";

export const login = async (payload: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/login', payload);
  return response.data;
};
