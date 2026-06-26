import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../../api/dashboard.service";
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  Calendar,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const ProviderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getProviderDashboard();
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
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  const { totalRequests, activeBookings, completedJobs, totalEarnings, recentBookings } = data;

  const stats = [
    { label: "Total Requests", value: totalRequests, icon: BarChart3, color: "text-blue-600 bg-blue-50" },
    { label: "Active Bookings", value: activeBookings, icon: Clock, color: "text-orange-600 bg-orange-50" },
    { label: "Completed Jobs", value: completedJobs, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Total Earnings", value: `₹${totalEarnings}`, icon: Wallet, color: "text-indigo-600 bg-indigo-50" },
  ];

  const statusConfig: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600",
    awaiting_payment: "bg-indigo-50 text-indigo-600",
    confirmed: "bg-blue-50 text-blue-600",
    in_progress: "bg-purple-50 text-purple-600",
    completed_pending_payment: "bg-orange-50 text-orange-600",
    completed: "bg-emerald-50 text-emerald-600",
    cancelled: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
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
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* --- RECENT BOOKING REQUESTS --- */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-900">Recent Booking Requests</h3>
          <button
            onClick={() => navigate("/provider/bookings")}
            className="text-blue-600 font-bold text-sm hover:underline"
          >
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Service Requested</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date &amp; Time</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings && recentBookings.length > 0 ? (
                recentBookings.map((booking: any, i: number) => {
                  const customerName = booking.userId?.name || "Customer";
                  const serviceName = booking.serviceId?.name || "Service";
                  const statusCls = statusConfig[booking.status] || "bg-slate-50 text-slate-600";
                  return (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/provider/bookings/${booking._id}`)}>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            <img
                              src={booking.userId?.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${customerName}`}
                              alt={customerName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="font-bold text-slate-900 text-sm whitespace-nowrap">{customerName}</p>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                            <Calendar size={14} />
                          </div>
                          <span className="text-sm font-semibold text-slate-600">{serviceName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-sm font-black text-slate-900 whitespace-nowrap">{booking.date}</p>
                        <p className="text-[10px] font-bold text-slate-400">{booking.slot?.start} – {booking.slot?.end}</p>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${statusCls}`}>
                          {booking.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/provider/bookings/${booking._id}`); }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-8 text-center text-sm text-slate-500 font-medium">
                    No recent booking requests.
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

export default ProviderDashboard;
