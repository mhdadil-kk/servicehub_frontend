import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend: string;
  trendType: "up" | "down";
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon: Icon, trend, trendType }) => {
  return (
    <div className="card-premium p-6 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-extrabold ${
          trendType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {trendType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{trend}</span>
        </div>
      </div>
      
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{value}</h3>
        <p className="text-slate-400 text-[11px] font-semibold mt-1">vs. last month</p>
      </div>
    </div>
  );
};

export default StatsCard;

