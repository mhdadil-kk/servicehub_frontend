import React, { useEffect, useState } from "react";
import { Wallet, ArrowDownRight, ArrowUpRight, History } from "lucide-react";
import { walletApi } from "../../api/wallet.service";
import toast from "react-hot-toast";

interface ITransaction {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status: "pending" | "success" | "failed";
  createdAt: string;
}

interface IWallet {
  balance: number;
  currency: string;
}

interface WalletData {
  wallet: IWallet;
  transactions: ITransaction[];
}

const UserWallet: React.FC = () => {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await walletApi.getWalletData();
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const successTransactions = data.transactions.filter(
    (t) => t.status === "success"
  );


  const totalSpent = successTransactions
    .filter((t) => t.type === "debit")
    .reduce((acc, t) => acc + t.amount, 0);

  const walletBalance = data.wallet.balance;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Wallet</h1>
        <p className="text-slate-500 font-medium mt-1">Track your spending and refunds.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Spent Card */}
        <div className="bg-indigo-600 rounded-[28px] p-8 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12" />
          <div className="relative z-10">
            <p className="text-indigo-100 font-medium mb-1 uppercase tracking-widest text-xs">Total Spent</p>
            <h2 className="text-4xl font-black tracking-tight">₹{totalSpent}</h2>
            <p className="text-indigo-200 text-xs font-medium mt-2">Paid for services via Stripe</p>
          </div>
          <div className="absolute bottom-6 right-6 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <ArrowUpRight size={22} className="text-white" />
          </div>
        </div>

        {/* Wallet Balance / Refunds Card */}
        <div className="bg-emerald-600 rounded-[28px] p-8 text-white shadow-xl shadow-emerald-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12" />
          <div className="relative z-10">
            <p className="text-emerald-100 font-medium mb-1 uppercase tracking-widest text-xs">Wallet Balance</p>
            <h2 className="text-4xl font-black tracking-tight">₹{walletBalance}</h2>
            <p className="text-emerald-200 text-xs font-medium mt-2">Refunds &amp; credits received</p>
          </div>
          <div className="absolute bottom-6 right-6 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet size={22} className="text-white" />
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 border border-slate-100 shadow-sm">
            <History size={18} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Transaction History</h3>
        </div>

        {successTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No transactions found.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {successTransactions.map((t, idx) => (
              <div
                key={t._id ?? idx}
                className="p-6 sm:px-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
                      t.type === "credit"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                        : "bg-rose-50 border-rose-100 text-rose-600"
                    }`}
                  >
                    {t.type === "credit" ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{t.description}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {new Date(t.createdAt).toLocaleDateString()} at{" "}
                      {new Date(t.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-black text-base ${
                      t.type === "credit" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {t.type === "credit" ? "+" : "-"}₹{t.amount}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {t.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserWallet;
