import React, { useState } from "react";
import { Input, Button } from "../../components/Common";
import { useAuth } from "../../hooks/useAuth";
import { useSearchParams, Link } from "react-router-dom";
import { Lock, ShieldAlert, ArrowLeft, RefreshCw } from "lucide-react";
import logo from "../../assets/logo.png";
import toast from "react-hot-toast";
import {
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
} from "../../utils/validation";

// ── Password Strength Bar ─────────────────────────────────────────────────────
const PasswordStrengthBar: React.FC<{ password: string }> = ({ password }) => {
  if (!password) return null;
  const { score, label, color } = getPasswordStrength(password);
  const bars = [0, 1, 2, 3];
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {bars.map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i < score ? color : "#e2e8f0" }}
          />
        ))}
      </div>
      <p className="text-[10px] font-bold" style={{ color }}>
        {label}
      </p>
    </div>
  );
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const { resetPassword, loading, error: apiError } = useAuth();

  const validate = (data: typeof formData): FormErrors => ({
    newPassword: validatePassword(data.newPassword) ?? undefined,
    confirmPassword:
      validateConfirmPassword(data.newPassword, data.confirmPassword) ?? undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    const newErrors = validate(updated);
    setErrors((prev) => ({
      ...prev,
      [name]: touched[name] ? newErrors[name as keyof FormErrors] : prev[name as keyof FormErrors],
      ...(name === "newPassword" && touched.confirmPassword
        ? { confirmPassword: newErrors.confirmPassword }
        : {}),
    }));
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = validate(formData);
    setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ newPassword: true, confirmPassword: true });
    const newErrors = validate(formData);
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    if (token && email) {
      await resetPassword({ email, token, newPassword: formData.newPassword });
    }
  };

  // ── Invalid link screen ───────────────────────────────────────────────────
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
            The link you followed is invalid or has expired. Please request a new
            password recovery link.
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
            Set new password
          </h1>
          <p className="text-slate-500 text-sm font-medium text-center mt-2 leading-relaxed">
            Create a new, strong password for your account
            <br />
            <span className="text-slate-900 font-bold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* New Password */}
          <div>
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              placeholder="Min. 8 chars, uppercase & number"
              value={formData.newPassword}
              onChange={handleChange}
              onBlur={() => handleBlur("newPassword")}
              required
              icon={<Lock size={18} />}
              error={touched.newPassword ? errors.newPassword : undefined}
            />
            <PasswordStrengthBar password={formData.newPassword} />
          </div>

          {/* Confirm Password */}
          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            placeholder="Repeat your new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={() => handleBlur("confirmPassword")}
            required
            icon={<Lock size={18} />}
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
          />

          {/* API Error Banner */}
          {apiError && (
            <div className="text-[11px] text-red-600 font-bold bg-red-50 border-l-4 border-red-500 p-3 flex gap-2 items-center rounded">
              <span>⚠️ {apiError}</span>
            </div>
          )}

          <Button type="submit" loading={loading}>
            Update password
          </Button>

          <div className="flex justify-center">
            <Link
              to="/login"
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
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
