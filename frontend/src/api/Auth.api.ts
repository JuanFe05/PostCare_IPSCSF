import axiosInstance from "./axiosInstance";
import type { LoginRequest, RegisterRequest, AuthResponse } from "../types/Auth.types";

export const login = async (payload: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/login', payload);
  return response.data;
};

export const register = async (payload: RegisterRequest) => {
  const response = await axiosInstance.post('/auth/register', payload);
  return response.data;
};
