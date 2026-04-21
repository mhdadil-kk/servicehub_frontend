import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      <label className="text-xs font-bold text-slate-600 tracking-tight ml-1">{label}</label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`input-premium ${icon ? 'pl-10' : ''} ${
            error ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""
          }`}
        />
      </div>
      {error && <span className="text-[11px] text-red-500 font-semibold mt-0.5 ml-1">{error}</span>}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "google";
}

export const Button: React.FC<ButtonProps> = ({ loading, variant = "primary", children, ...props }) => {
  const baseClass = variant === "primary" ? "btn-primary" : "btn-google";
  
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${baseClass} min-h-[48px] ${props.className || ""}`}
    >
      {loading ? (
        <span className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></span>
      ) : (
        children
      )}
    </button>
  );
};
