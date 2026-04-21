import React, { useState } from "react";
import { Input, Button } from "../../components/Common";
import { useAuth } from "../../hooks/useAuth";
import { useSearchParams, Link } from "react-router-dom";
import { Lock, ShieldAlert, ArrowLeft, RefreshCw } from "lucide-react";
import logo from "../../assets/logo.png";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const { resetPassword, loading, error: apiError } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    if (token && email) {
      await resetPassword({ email, token, newPassword: formData.newPassword });
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-full h-16 flex items-center justify-center">
            <img src={logo} alt="ServiceHub" className="h-full object-contain" />
          </div>
        </div>
        <div className="max-w-md w-full card-premium p-10 shadow-xl shadow-slate-200/50 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Invalid Link</h1>
          <p className="text-slate-500 text-sm font-medium mt-3 leading-relaxed mb-8">
            The link you followed is invalid or has expired. Please request a new password recovery link.
          </p>
          <Link to="/forgot-password" title="Access Recovery" className="w-full">
            <Button variant="primary" className="w-full">Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans">
      <div className="flex flex-col items-center mb-8 gap-3">
        <div className="w-full h-16 flex items-center justify-center">
          <img src={logo} alt="ServiceHub" className="h-full object-contain" />
        </div>
      </div>

      <div className="max-w-md w-full card-premium p-10 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <RefreshCw size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">Set new password</h1>
            <p className="text-slate-500 text-sm font-medium text-center mt-2 leading-relaxed">
                Create a new, strong password for your account<br />
                <span className="text-slate-900 font-bold">{email}</span>
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="New Password" 
            type="password" 
            name="newPassword" 
            placeholder="Enter new password" 
            value={formData.newPassword} 
            onChange={handleChange} 
            required 
            icon={<Lock size={18} />}
          />
          <Input 
            label="Confirm New Password" 
            type="password" 
            name="confirmPassword" 
            placeholder="Confirm new password" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required 
            icon={<Lock size={18} />}
          />

          {(validationError || apiError) && (
            <div className="text-[11px] text-red-600 font-bold bg-red-50 border-l-4 border-red-500 p-3 flex gap-2 items-center rounded">
               <span>⚠️ {validationError || apiError}</span>
            </div>
          )}

          <Button type="submit" loading={loading}>
            Update password
          </Button>

          <div className="flex justify-center">
            <Link to="/login" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft size={14} />
              <span>Back to login</span>
            </Link>
          </div>
        </form>
      </div>

      {/* FOOTER */}
      <div className="mt-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
         © 2024 ServiceHub Inc. All rights reserved. • Privacy Policy
      </div>
    </div>
  );
};

export default ResetPassword;
