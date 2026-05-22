import React from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Wallet
} from "lucide-react";

const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const stats = [
    { label: "Total Bookings", value: "24", icon: Calendar, color: "text-blue-600 bg-blue-50", trend: "+12%" },
    { label: "Upcoming Bookings", value: "2", icon: Clock, color: "text-orange-600 bg-orange-50" },
    { label: "Completed Bookings", value: "22", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Total Spent", value: "₹1,24,000", icon: Wallet, color: "text-indigo-600 bg-indigo-50", subtitle: "Total" },
  ];

  const recentBookings = [
    { provider: "John Doe", service: "Home Cleaning", date: "May 24, 2024", status: "Completed" },
    { provider: "Jane Smith", service: "Plumbing Repair", date: "May 22, 2024", status: "Pending" },
    { provider: "Mike Ross", service: "AC Maintenance", date: "May 20, 2024", status: "In Progress" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
              {stat.trend && (
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.trend}</span>
              )}
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
          <button className="text-blue-600 font-bold text-sm hover:underline">View all</button>
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
              {recentBookings.map((booking, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.provider}`} alt="" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{booking.provider}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm font-semibold text-slate-500">{booking.service}</td>
                  <td className="px-8 py-4 text-sm font-semibold text-slate-500">{booking.date}</td>
                  <td className="px-8 py-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      booking.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                      booking.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- BOTTOM GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Help Banner */}
        <div className="bg-blue-600 rounded-[40px] p-10 text-white relative overflow-hidden group shadow-xl shadow-blue-200">
           <div className="relative z-10 max-w-xs">
              <h3 className="text-2xl font-black mb-3">Need more help?</h3>
              <p className="text-blue-100 text-sm font-medium mb-8 leading-relaxed">Explore new services in your area. Get 15% off your next booking with code SAVEMORE.</p>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-black text-sm hover:scale-105 transition-transform">
                Explore Now
              </button>
           </div>
           {/* Decorative circles */}
           <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
           <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
              <Calendar size={180} />
           </div>
        </div>

        {/* Quick Messages */}
        <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-xl shadow-slate-200">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black">Quick Messages</h3>
            <span className="bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-slate-400">3 New</span>
          </div>
          <div className="space-y-6">
            {[
              { name: "Support Agent Sarah", msg: "Your booking has been confirmed...", time: "2m ago" },
              { name: "John Doe", msg: "I'll be there in 15 minutes.", time: "1h ago" },
            ].map((msg, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                   <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${msg.name}`} alt="" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{msg.name}</p>
                  <p className="text-xs font-medium text-slate-400 line-clamp-1">{msg.msg}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{msg.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
