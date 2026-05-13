import React from "react";
import { useAuthStore } from "../../store/useAuthStore";
import ProviderOnboardingModal from "../../components/ProviderOnboardingModal";
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  Check,
  X,
  MapPin,
  Calendar
} from "lucide-react";

const ProviderDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const stats = [
    { label: "Total Bookings", value: "1,284", icon: BarChart3, color: "text-blue-600 bg-blue-50", trend: "+12.5%" },
    { label: "Pending Bookings", value: "12", icon: Clock, color: "text-orange-600 bg-orange-50" },
    { label: "Completed Bookings", value: "1,150", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Total Earnings", value: "₹14,25,000", icon: Wallet, color: "text-indigo-600 bg-indigo-50", trend: "+8.2%" },
  ];

  const recentRequests = [
    { 
      customer: "Sarah Williams", 
      location: "Austin, TX", 
      service: "Plumbing Repair", 
      date: "Oct 24, 2024", 
      time: "02:30 PM - 04:30 PM",
      status: "Action Required" 
    },
    { 
      customer: "Michael Chen", 
      location: "Round Rock, TX", 
      service: "Electrical Inspection", 
      date: "Oct 25, 2024", 
      time: "09:00 AM - 11:00 AM",
      status: "New" 
    },
    { 
      customer: "Robert Fox", 
      location: "Cedar Park, TX", 
      service: "HVAC Maintenance", 
      date: "Oct 26, 2024", 
      time: "11:00 AM - 01:00 PM",
      status: "New" 
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Onboarding Modal Overlay - Only show if strictly pending */}
      {user?.status === 'pending' && (
        <ProviderOnboardingModal 
          isOpen={true} 
          onComplete={() => {
            // Handled by store update
          }} 
        />
      )}
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Provider Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your services, track earnings, and respond to requests.</p>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              {stat.trend && (
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.trend}</span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* --- BOOKING REQUESTS --- */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-900">Recent Booking Requests</h3>
          <button className="text-blue-600 font-bold text-sm hover:underline">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Service Requested</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Proposed Date & Time</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((req, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.customer}`} alt="" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{req.customer}</p>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                           <MapPin size={10} /> {req.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                          <Calendar size={14} />
                       </div>
                       <span className="text-sm font-semibold text-slate-600">{req.service}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <p className="text-sm font-black text-slate-900">{req.date}</p>
                    <p className="text-[10px] font-bold text-slate-400">{req.time}</p>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      req.status === 'Action Required' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center justify-center gap-2">
                       <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-1 shadow-lg shadow-blue-100">
                          <Check size={14} /> Accept
                       </button>
                       <button className="bg-white border border-slate-100 text-slate-400 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all flex items-center gap-1">
                          <X size={14} /> Decline
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ALERTS --- */}
      {user?.status === 'rejected' && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-2xl flex items-center gap-4 animate-pulse">
           <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shrink-0">
              <X size={24} />
           </div>
           <div>
              <h4 className="text-rose-900 font-black tracking-tight">Application Rejected</h4>
              <p className="text-rose-600 text-sm font-medium mt-0.5 italic">Your account status is currently rejected. Please update your profile or contact support for a re-review.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
