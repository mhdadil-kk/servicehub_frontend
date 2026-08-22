import axiosInstance from "./axios.instance";
import { API_ROUTES } from "../constants/api.routes";
import type { ApiResponse } from "../types/api.types";
import type { WalletData } from "../types/domain.types";

export type { WalletData, WalletInfo, WalletTransaction } from "../types/domain.types";

export const walletApi = {
  getWalletData: () =>
    axiosInstance.get<unknown, ApiResponse<WalletData>>(API_ROUTES.WALLET.GET),
};
