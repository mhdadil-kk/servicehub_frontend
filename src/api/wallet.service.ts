import axiosInstance from "./axios.instance";

export const walletApi = {
  getWalletData: () => axiosInstance.get("/wallet"),
};

