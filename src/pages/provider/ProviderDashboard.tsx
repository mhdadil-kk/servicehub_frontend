import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/useAuthStore";
import { AlertCircle, LogOut, MailQuestion } from "lucide-react";

const ProviderDashboard: React.FC = () => {
  const { logout } = useAuth();
  const { user } = useAuthStore();

  const isRejected = user?.status === "rejected";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Provider Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your services and track your business performance.</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-200 transition-all active:scale-95"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>

      {isRejected && (
        <div className="relative overflow-hidden bg-rose-50 border border-rose-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm shadow-rose-100/50">
          <div className="absolute top-0 right-0 -transe-y-1/2 translate-x-1/2 w-64 h-64 bg-rose-100/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-50 shrink-0">
            <AlertCircle size={32} strokeWidth={2.5} />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-xl font-black text-rose-900">Application Status: Rejected</h2>
            <p className="text-rose-700 leading-relaxed font-medium">
              We regret to inform you that your application to join ServiceHub as a provider has been rejected. 
              This could be due to missing documentation, verification issues, or platform guidelines.
            </p>
            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
               <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-rose-700 transition-colors shadow-md shadow-rose-200">
                  <MailQuestion size={14} />
                  Contact Support
               </button>
               <button className="px-4 py-2 bg-white text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-rose-50 transition-colors">
                  View Guidelines
               </button>
            </div>
          </div>
        </div>
      )}

      {!isRejected && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Account Status</p>
               <h3 className="text-2xl font-black text-slate-900 capitalize">{user?.status || 'Pending'}</h3>
            </div>
         </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
