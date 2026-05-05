import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/useAuthStore";

const ProviderDashboard: React.FC = () => {
  const { logout } = useAuth();
  const { user } = useAuthStore();

  const isRejected = user?.status === "rejected";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>

      <div className="pt-2">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Account Status</p>
        <p className={`text-lg font-bold capitalize ${isRejected ? 'text-red-600' : 'text-gray-900'}`}>
          {user?.status}
        </p>
        {isRejected && (
          <p className="text-sm text-red-500 mt-1 italic font-medium">
            ⚠️ Your application was rejected. Please contact support.
          </p>
        )}
      </div>

      <button 
        onClick={logout}
        className="px-6 py-2 bg-black text-white rounded font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default ProviderDashboard;
