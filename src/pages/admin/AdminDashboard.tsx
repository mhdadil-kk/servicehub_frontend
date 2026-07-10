import React, { useState, useEffect } from "react";
import StatsCard from "../../components/Admin/StatsCard";
import { Users, Briefcase, CalendarCheck, Wallet, ArrowUpRight, Loader2, AlertCircle } from "lucide-react";
import { adminService } from "../../api/admin.service";
import toast from "react-hot-toast";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"all" | "year" | "month">("all");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats(timeRange);
        setStats(res.data);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1 italic">Overview of your service ecosystem performance.</p>
        </div>
        <div className="flex gap-3">
           <select 
             value={timeRange} 
             onChange={(e) => setTimeRange(e.target.value as "all" | "year" | "month")}
             className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition-all outline-none focus:ring-2 focus:ring-blue-500"
           >
             <option value="all">All Time</option>
             <option value="year">This Year</option>
             <option value="month">This Month</option>
           </select>
           <button className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-bold shadow-sm shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
              <ArrowUpRight size={16} />
              <span>Export Report</span>
           </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Customers" value={stats?.totalUsers?.toString() || "0"} icon={Users} />
        <StatsCard label="Total Providers" value={stats?.totalProviders?.toString() || "0"} icon={Briefcase} />
        <StatsCard label="Total Bookings" value={stats?.totalBookings?.toString() || "0"} icon={CalendarCheck} />
        <StatsCard label="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString() || "0"}`} icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GROWTH CHART SIMULATION */}
        <div className="lg:col-span-2 card-premium p-8 h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">User Growth Over Time</h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">New registered users across all regions.</p>
            </div>
            <div className="flex gap-4 items-center">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Active Users
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                  Inactive
               </div>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-3 pt-4">
            {(stats?.userGrowth || []).map((item: any, idx: number) => {
              const maxVal = Math.max(...(stats?.userGrowth || []).map((d: any) => d.value), 1);
              const heightPct = Math.max((item.value / maxVal) * 100, 5);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3">
                  <div 
                    className="w-full bg-blue-500 rounded-t-md relative group transition-all duration-700 ease-out hover:bg-blue-600"
                    style={{ height: `${heightPct}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.value}
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRENDS LIST */}
        <div className="card-premium p-8 flex flex-col">
          <h3 className="text-lg font-extrabold text-slate-900 mb-6">Booking Trends by Category</h3>
          <div className="space-y-7 overflow-auto pr-2">
            {(stats?.bookingTrends || []).map((item: any, i: number) => {
              const maxVal = Math.max(...(stats?.bookingTrends || []).map((d: any) => d.val), 1);
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-slate-900">{item.val.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div 
                      className={`${item.color} h-full rounded-full transition-all duration-1000 ease-in-out`} 
                      style={{ width: `${(item.val / maxVal) * 100}%` }}
                     ></div>
                  </div>
                </div>
              );
            })}
            {(!stats?.bookingTrends || stats.bookingTrends.length === 0) && (
              <div className="text-sm text-slate-500 italic text-center py-8">No booking data available for this period.</div>
            )}
          </div>
          
          <div className="mt-10 pt-8 border-t border-slate-100 flex-1 flex flex-col justify-center items-center text-center">
             <div className="w-24 h-24 rounded-full border-[10px] border-slate-100 border-t-blue-600 border-r-blue-500 flex items-center justify-center relative">
                <span className="text-xs font-black text-slate-900 leading-tight">₹{stats?.totalRevenue?.toLocaleString() || "0"}<br/><span className="text-[8px] text-slate-400 font-bold uppercase">TOTAL</span></span>
             </div>
             <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest leading-relaxed">Revenue Breakdown<br/>{timeRange === 'all' ? 'All Time' : timeRange === 'year' ? 'This Year' : 'This Month'} Analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
