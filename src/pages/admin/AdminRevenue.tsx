import React, { useState, useEffect } from "react";
import { adminService } from "../../api/admin.service";
import { TrendingUp, DollarSign, CalendarCheck, CheckCircle, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface RevenueData {
  totalRevenue: number;
  revenueByMonth: { month: string; year: number; revenue: number }[];
  totalBookings: number;
  completedBookings: number;
  platformFeeCollected: number;
}

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartH = 200;
  const barW = Math.min(48, Math.floor(700 / Math.max(data.length, 1)) - 10);
  const svgW = Math.max(700, data.length * (barW + 12));

  return (
    <div className="overflow-x-auto">
      <svg width={svgW} height={chartH + 60}>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={0} y1={chartH - chartH * t} x2={svgW} y2={chartH - chartH * t} stroke="#e2e8f0" strokeWidth={1} />
        ))}
        {data.map((d, i) => {
          const barHeight = Math.max((d.value / maxVal) * chartH, d.value > 0 ? 4 : 0);
          const x = i * (barW + 12) + 6;
          const y = chartH - barHeight;
          return (
            <g key={`bar-${d.label}-${i}`}>
              <rect x={x} y={y} width={barW} height={barHeight} rx={6} ry={6} fill="url(#barGrad)" />
              {d.value > 0 && (
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={10} fill="#64748b" fontWeight="600">
                  {d.value >= 1000 ? `₹${(d.value / 1000).toFixed(1)}k` : `₹${d.value}`}
                </text>
              )}
              <text x={x + barW / 2} y={chartH + 20} textAnchor="middle" fontSize={11} fill="#94a3b8" fontWeight="500">
                {d.label}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string; color: string }> = ({ icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex gap-4 items-start">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AdminRevenue: React.FC = () => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"all" | "year" | "month">("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminService.getRevenueReport(timeRange);
        setData(res.data);
      } catch {
        toast.error("Failed to load revenue data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const handleExport = () => {
    if (!data || !data.revenueByMonth) return;
    const rows = [["Month", "Year", "Revenue (Rs.)"], ...data.revenueByMonth.map((r) => [r.month, String(r.year), String(r.revenue)])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-report-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported!");
  };

  const monthlyList = data?.revenueByMonth ?? [];
  const completionRate = data && data.totalBookings > 0 ? ((data.completedBookings / data.totalBookings) * 100).toFixed(1) : "0";
  const chartData = monthlyList.map((r) => ({ label: `${r.month} ${r.year}`, value: r.revenue }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Revenue Report</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Platform fee revenue: ₹100 per confirmed booking.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "all" | "year" | "month")}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition-all outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="month">This Month</option>
          </select>
          <button
            onClick={handleExport}
            disabled={!data || monthlyList.length === 0}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-bold shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              icon={<DollarSign className="text-indigo-600" size={22} />}
              label="Platform Revenue"
              value={`₹${(data?.totalRevenue ?? 0).toLocaleString("en-IN")}`}
              sub="₹100 × fee-paid bookings"
              color="bg-indigo-50"
            />
            <KpiCard icon={<CalendarCheck className="text-emerald-600" size={22} />} label="Total Bookings" value={(data?.totalBookings ?? 0).toLocaleString()} color="bg-emerald-50" />
            <KpiCard
              icon={<CheckCircle className="text-sky-600" size={22} />}
              label="Completed Bookings"
              value={(data?.completedBookings ?? 0).toLocaleString()}
              sub={`${completionRate}% completion rate`}
              color="bg-sky-50"
            />
            <KpiCard
              icon={<TrendingUp className="text-violet-600" size={22} />}
              label="Fee-Paid Bookings"
              value={data ? (data.totalRevenue / 100).toFixed(0) : "0"}
              sub="bookings with confirmed payment"
              color="bg-violet-50"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Monthly Revenue Breakdown</h2>
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 text-slate-400">
                <TrendingUp size={40} className="mb-3 opacity-30" />
                <p className="font-medium">No revenue data for this period</p>
              </div>
            ) : (
              <BarChart data={chartData} />
            )}
          </div>

          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Monthly Breakdown Table</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-500 uppercase text-xs tracking-wider">Month</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-500 uppercase text-xs tracking-wider">Year</th>
                      <th className="px-6 py-3 text-right font-semibold text-slate-500 uppercase text-xs tracking-wider">Bookings Paid</th>
                      <th className="px-6 py-3 text-right font-semibold text-slate-500 uppercase text-xs tracking-wider">Revenue (₹100 × each)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {monthlyList.map((r, i) => (
                      <tr key={`row-${r.year}-${r.month}-${i}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-slate-800">{r.month}</td>
                        <td className="px-6 py-3.5 text-slate-500">{r.year}</td>
                        <td className="px-6 py-3.5 text-right text-slate-600">{r.revenue / 100}</td>
                        <td className="px-6 py-3.5 text-right font-bold text-indigo-600">₹{r.revenue.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-indigo-50">
                    <tr>
                      <td className="px-6 py-3.5 font-bold text-slate-800" colSpan={2}>Total</td>
                      <td className="px-6 py-3.5 text-right font-bold text-slate-700">{(data?.totalRevenue ?? 0) / 100} bookings</td>
                      <td className="px-6 py-3.5 text-right font-extrabold text-indigo-700">₹{(data?.totalRevenue ?? 0).toLocaleString("en-IN")}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminRevenue;
