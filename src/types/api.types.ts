export interface ApiError {
  field?: string;
  message: string;
}

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ApiError[] | string;
  timestamp: string;
};

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "user" | "provider";
  profilePhoto?: string;
  is_verified: boolean;
  status: "approved" | "rejected" | "pending" | "in_review";
  isDeleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "user" | "provider";
}

export interface ResetPasswordData {
  email: string;
  token: string;
  newPassword: string;
}

export interface IService {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  basePrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
