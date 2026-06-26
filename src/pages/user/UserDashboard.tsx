import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Wallet,
  Loader2
} from "lucide-react";
import { dashboardApi } from "../../api/dashboard.service";
import toast from "react-hot-toast";

const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getUserDashboard();
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const { totalBookings, upcomingBookings, completedBookings, totalSpent, recentBookings } = data;

  const stats = [
    { label: "Total Bookings", value: totalBookings, icon: Calendar, color: "text-blue-600 bg-blue-50" },
    { label: "Upcoming Bookings", value: upcomingBookings, icon: Clock, color: "text-orange-600 bg-orange-50" },
    { label: "Completed Bookings", value: completedBookings, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Total Spent", value: `₹${totalSpent}`, icon: Wallet, color: "text-indigo-600 bg-indigo-50", subtitle: "Total" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      {/* --- WELCOME HEADER --- */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, {user?.name.split(' ')[0]}!</h1>
        <p className="text-slate-500 font-medium mt-1">Here's what's happening with your services today.</p>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              {stat.subtitle && (
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase tracking-widest">{stat.subtitle}</span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* --- RECENT BOOKINGS --- */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-900">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Provider Name</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Service</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings && recentBookings.length > 0 ? (
                recentBookings.map((booking: any, i: number) => {
                  const providerName = booking.providerId?.userId?.name || "Unknown Provider";
                  const serviceName = booking.serviceId?.name || "Service";
                  return (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            <img src={booking.providerId?.profilePhoto || booking.providerId?.userId?.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${providerName}`} alt="" />
                          </div>
                          <span className="font-bold text-slate-900 text-sm whitespace-nowrap">{providerName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-sm font-semibold text-slate-500">{serviceName}</td>
                      <td className="px-8 py-4 text-sm font-semibold text-slate-500 whitespace-nowrap">{booking.date}</td>
                      <td className="px-8 py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                          booking.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          (booking.status === 'pending' || booking.status === 'awaiting_payment') ? 'bg-orange-50 text-orange-600' :
                          ['cancelled', 'rescheduled'].includes(booking.status) ? 'bg-red-50 text-red-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {booking.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-8 text-center text-sm text-slate-500 font-medium">
                    No recent bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
