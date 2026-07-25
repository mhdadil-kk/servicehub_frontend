import React, { useState, useEffect } from "react";
import StatsCard from "../../components/Admin/StatsCard";
import { Users, Briefcase, CalendarCheck, Wallet, ArrowUpRight, Loader2 } from "lucide-react";
import { adminService } from "../../api/admin.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/* ────────── User Growth Bar Chart ────────── */
const UserGrowthChart: React.FC<{ data: { month: string; value: number }[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Users size={36} className="opacity-25" />
        <p className="text-sm font-medium">No user data for this period</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const CHART_H = 160; // px

  return (
    <div className="flex-1 flex flex-col">
      {/* bars area */}
      <div className="flex items-end gap-2 flex-1" style={{ minHeight: `${CHART_H}px` }}>
        {data.map((item, idx) => {
          const barHeightPx = Math.max(Math.round((item.value / maxVal) * CHART_H), item.value > 0 ? 6 : 2);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
              {/* value label */}
              <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.value}
              </span>
              {/* bar */}
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-700 ease-out group-hover:from-blue-700 group-hover:to-blue-500 relative"
                style={{ height: `${barHeightPx}px` }}
              />
            </div>
          );
        })}
      </div>
      {/* x-axis labels */}
      <div className="flex gap-2 mt-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase leading-tight block">
              {item.month.split(" ")[0]}
            </span>
            <span className="text-[9px] text-slate-300 block">
              {item.month.split(" ")[1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ────────── Main Page ────────── */
const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"all" | "year" | "month">("all");
  const navigate = useNavigate();

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

  const TREND_COLORS: Record<string, string> = {
    "bg-blue-500":    "bg-blue-500",
    "bg-emerald-500": "bg-emerald-500",
    "bg-violet-500":  "bg-violet-500",
    "bg-orange-500":  "bg-orange-500",
    "bg-pink-500":    "bg-pink-500",
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const userGrowth: { month: string; value: number }[] = stats?.userGrowth || [];
  const bookingTrends: { label: string; val: number; color: string }[] = stats?.bookingTrends || [];
  const totalRevenue: number = stats?.totalRevenue || 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1 italic">Overview of your service ecosystem performance.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "all" | "year" | "month")}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition-all outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="month">This Month</option>
          </select>
          <button
            onClick={() => navigate("/admin/revenue")}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-bold shadow-sm shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <ArrowUpRight size={16} />
            <span>Revenue Report</span>
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Customers" value={stats?.totalUsers?.toString() || "0"} icon={Users} />
        <StatsCard label="Total Providers" value={stats?.totalProviders?.toString() || "0"} icon={Briefcase} />
        <StatsCard label="Total Bookings" value={stats?.totalBookings?.toString() || "0"} icon={CalendarCheck} />
        <StatsCard label="Platform Revenue" value={`\u20b9${totalRevenue.toLocaleString("en-IN")}`} icon={Wallet} />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* USER GROWTH CHART */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col" style={{ minHeight: "360px" }}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">User Growth</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {timeRange === "month" ? "Daily registrations this month" : timeRange === "year" ? "Monthly registrations this year" : "Yearly registrations all time"}
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-500 block" />
                Customers
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 block" />
                Providers
              </div>
            </div>
          </div>

          {userGrowth.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Users size={36} className="opacity-25" />
              <p className="text-sm font-medium">No user data for this period</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Bars */}
              <div className="flex items-end gap-3" style={{ height: "180px" }}>
                {userGrowth.map((item: any, idx: number) => {
                  const maxVal = Math.max(...userGrowth.map((d: any) => Math.max(d.users || 0, d.providers || 0)), 1);
                  const userH = Math.max(Math.round(((item.users || 0) / maxVal) * 160), (item.users || 0) > 0 ? 6 : 2);
                  const provH = Math.max(Math.round(((item.providers || 0) / maxVal) * 160), (item.providers || 0) > 0 ? 6 : 2);
                  return (
                    <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full">
                      {/* Grouped bars side by side */}
                      <div className="flex items-end gap-0.5 w-full relative">
                        {/* Customer bar */}
                        <div className="flex-1 flex flex-col items-center group relative">
                          <span className="absolute -top-5 text-[9px] font-bold text-blue-600">{item.users || 0}</span>
                          <div
                            className="w-full rounded-t bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-all duration-300"
                            style={{ height: `${userH}px` }}
                          />
                        </div>
                        {/* Provider bar */}
                        <div className="flex-1 flex flex-col items-center group relative">
                          <span className="absolute -top-5 text-[9px] font-bold text-emerald-600">{item.providers || 0}</span>
                          <div
                            className="w-full rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-700 hover:to-emerald-500 transition-all duration-300"
                            style={{ height: `${provH}px` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* X-axis labels */}
              <div className="flex gap-3 mt-3 border-t border-slate-100 pt-3">
                {userGrowth.map((item: any, idx: number) => {
                  const parts = item.label.split(" ");
                  return (
                    <div key={idx} className="flex-1 text-center">
                      <span className="text-[10px] font-bold text-slate-500 block">{parts[0]}</span>
                      {parts[1] && <span className="text-[9px] text-slate-400 block">{parts[1]}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* BOOKING TRENDS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col">
          <h3 className="text-lg font-extrabold text-slate-900 mb-2">Booking Trends</h3>
          <p className="text-xs font-semibold text-slate-400 mb-6">Top categories by completed bookings.</p>

          <div className="flex-1 space-y-5 overflow-auto pr-1">
            {bookingTrends.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-36 text-slate-400 gap-2">
                <CalendarCheck size={32} className="opacity-25" />
                <p className="text-sm font-medium">No booking data yet</p>
              </div>
            ) : (
              bookingTrends.map((item, i) => {
                const maxVal = Math.max(...bookingTrends.map((d) => d.val), 1);
                const colorClass = TREND_COLORS[item.color] ?? "bg-blue-500";
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-600 truncate pr-2">{item.label}</span>
                      <span className="text-slate-900 flex-shrink-0">{item.val.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`${colorClass} h-full rounded-full transition-all duration-1000 ease-in-out`}
                        style={{ width: `${(item.val / maxVal) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Revenue summary card */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {timeRange === "all" ? "All-Time" : timeRange === "year" ? "This Year" : "This Month"} Platform Revenue
              </p>
              <p className="text-2xl font-extrabold text-blue-700">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">₹100 per confirmed booking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
