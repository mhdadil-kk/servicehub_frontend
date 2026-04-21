import React from "react";
import { useAuth } from "../../hooks/useAuth";

const UserDashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
      <button 
        onClick={logout}
        className="px-6 py-2 bg-black text-white rounded font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default UserDashboard;
