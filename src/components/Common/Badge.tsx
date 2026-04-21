import React from "react";

type BadgeType = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  type?: BadgeType;
}

const Badge: React.FC<BadgeProps> = ({ children, type = "neutral" }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    neutral: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[type]}`}>
       <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
         type === 'success' ? 'bg-emerald-500' : 
         type === 'warning' ? 'bg-amber-500' :
         type === 'danger' ? 'bg-rose-500' :
         type === 'info' ? 'bg-blue-500' : 'bg-slate-400'
       }`}></span>
      {children}
    </span>
  );
};

export default Badge;
