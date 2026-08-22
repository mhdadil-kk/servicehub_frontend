import { useState, useCallback } from "react";
import { walletApi } from "../api/wallet.service";
import toast from "react-hot-toast";
import type { WalletInfo, WalletTransaction } from "../types/domain.types";

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await walletApi.getWalletData();
      const payload = res.data;
      const w = payload?.wallet ?? null;
      const t = payload?.transactions ?? [];
      setWallet(w);
      setTransactions(t);
      return { wallet: w, transactions: t };
    } catch (error) {
      toast.error("Failed to load wallet data.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    wallet,
    transactions,
    loading,
    fetchWalletData,
  };
};
