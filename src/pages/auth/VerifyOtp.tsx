import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components/Common";
import { useAuth } from "../../hooks/useAuth";
import { useLocation, Navigate } from "react-router-dom";
import { Mail, ShieldCheck } from "lucide-react";
import logo from "../../assets/logo.png";

const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [timer, setTimer] = useState(60); 
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const location = useLocation();
  const email = location.state?.email || "alex@example.com"; 
  const { verifyOtp, loading, error } = useAuth();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setValidationError("Please enter the complete 6-digit code.");
      return;
    }
    setValidationError("");
    if (email) {
      await verifyOtp(email, otpCode);
    }
  };

  const shouldRedirect = !location.state?.email && typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  if (shouldRedirect) return <Navigate to="/register" />;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans">
      {/* LOGO AREA */}
      <div className="flex flex-col items-center mb-8 gap-3">
        <div className="w-full h-16 flex items-center justify-center">
          <img src={logo} alt="ServiceHub" className="h-full object-contain" />
        </div>
      </div>

      <div className="max-w-md w-full card-premium p-10 shadow-xl shadow-slate-200/50 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
          <Mail size={32} />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Verify your email</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            We've sent a 6-digit verification code to<br />
            <span className="text-slate-900 font-bold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-8">
          <div className="flex justify-between gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none transition-all"
              />
            ))}
          </div>

          {validationError && (
            <div className="text-[11px] text-red-600 font-bold bg-red-50 border-l-4 border-red-500 p-3 flex gap-2 items-center rounded">
               <span>⚠️ {validationError}</span>
            </div>
          )}

          {error && (
            <div className="text-[11px] text-red-600 font-bold bg-red-50 border-l-4 border-red-500 p-3 flex gap-2 items-center rounded">
               <span>⚠️ {error}</span>
            </div>
          )}

          <Button type="submit" loading={loading}>
            <ShieldCheck size={18} />
            <span>Verify</span>
          </Button>

          <div className="text-center space-y-1">
             <p className="text-xs font-semibold text-slate-500">Didn't receive the code?</p>
             <button 
                type="button" 
                disabled={timer > 0} 
                className="text-xs font-extrabold text-blue-600 hover:text-blue-700 disabled:text-slate-300 transition-all uppercase tracking-wider"
             >
                {timer > 0 ? `Resend code in ${formatTime(timer)}` : "Resend code now"}
             </button>
          </div>
        </form>
      </div>

      {/* FOOTER */}
      <div className="mt-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
         © 2024 ServiceHub Inc. All rights reserved. • Terms • Privacy
      </div>
    </div>
  );
};

export default VerifyOtp;
