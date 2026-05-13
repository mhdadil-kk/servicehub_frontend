import React from "react";
import StatsCard from "../../components/Admin/StatsCard";
import { Users, Briefcase, CalendarCheck, Wallet, ArrowUpRight } from "lucide-react";

/**
 * MOCK DATA FOR DEMO PURPOSES
 */
const USER_GROWTH_DATA = [
  { month: "Jan", value: 30 }, { month: "Feb", value: 45 }, { month: "Mar", value: 55 },
  { month: "Apr", value: 40 }, { month: "May", value: 70 }, { month: "Jun", value: 65 },
  { month: "Jul", value: 85 }, { month: "Aug", value: 80 }, { month: "Sep", value: 95 },
  { month: "Oct", value: 110 }, { month: "Nov", value: 125 }, { month: "Dec", value: 120 },
];

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1 italic">Overview of your service ecosystem performance.</p>
        </div>
        <div className="flex gap-3">
           <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-600 flex items-center gap-2 shadow-sm cursor-pointer hover:bg-slate-50 transition-all">
              <span>Last 30 Days</span>
              <ArrowUpRight size={14} className="text-slate-400" />
           </div>
           <button className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-bold shadow-sm shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
              <ArrowUpRight size={16} />
              <span>Export Report</span>
           </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Users" value="12,450" icon={Users} trend="12%" trendType="up" />
        <StatsCard label="Total Providers" value="1,840" icon={Briefcase} trend="5%" trendType="up" />
        <StatsCard label="Total Bookings" value="45,200" icon={CalendarCheck} trend="8%" trendType="up" />
        <StatsCard label="Total Revenue" value="₹1,25,00,000" icon={Wallet} trend="15%" trendType="up" />
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
            {USER_GROWTH_DATA.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-3">
                <div 
                  className="w-full bg-blue-500 rounded-t-md relative group transition-all duration-700 ease-out hover:bg-blue-600"
                  style={{ height: `${item.value}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.value * 123}
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TRENDS LIST */}
        <div className="card-premium p-8 flex flex-col">
          <h3 className="text-lg font-extrabold text-slate-900 mb-6">Booking Trends by Category</h3>
          <div className="space-y-7 overflow-auto pr-2">
            {[
              { label: "Cleaning", val: 12400, color: "bg-blue-600" },
              { label: "Plumbing", val: 8200, color: "bg-blue-500" },
              { label: "Electrical", val: 6150, color: "bg-blue-400" },
              { label: "HVAC", val: 4900, color: "bg-blue-300" },
              { label: "Painting", val: 3200, color: "bg-blue-200" },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-slate-900">{item.val.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                    className={`${item.color} h-full rounded-full transition-all duration-1000 ease-in-out`} 
                    style={{ width: `${(item.val / 12400) * 100}%` }}
                   ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 pt-8 border-t border-slate-100 flex-1 flex flex-col justify-center items-center text-center">
             <div className="w-24 h-24 rounded-full border-[10px] border-slate-100 border-t-blue-600 border-r-blue-500 flex items-center justify-center relative">
                <span className="text-xs font-black text-slate-900 leading-tight">₹1.25Cr<br/><span className="text-[8px] text-slate-400 font-bold uppercase">TOTAL YTD</span></span>
             </div>
             <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest leading-relaxed">Revenue Breakdown<br/>Monthly Analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
