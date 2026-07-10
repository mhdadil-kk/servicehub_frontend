import { useState, useCallback } from "react";
import { walletApi } from "../api/wallet.service";
import toast from "react-hot-toast";

export const useWallet = () => {
  const [wallet, setWallet] = useState<unknown>(null);
  const [transactions, setTransactions] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await walletApi.getWalletData();
      const { wallet: w, transactions: t } = (res as any).data || {};
      setWallet(w || null);
      setTransactions(t || []);
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
