import React, { useState } from "react";
import { Input, Button } from "../../components/Common";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { User, Mail, Phone, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
} from "../../utils/validation";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

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

// ── Component ─────────────────────────────────────────────────────────────────
const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user" as "user" | "provider",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { signup, googleLogin, loading, error } = useAuth();

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: (response) => googleLogin(response.access_token, formData.role),
    onError: () => toast.error("Google Sign-Up failed. Please try again."),
  });

  const validate = (data: typeof formData): FormErrors => ({
    name: validateName(data.name) ?? undefined,
    email: validateEmail(data.email) ?? undefined,
    phone: validatePhone(data.phone) ?? undefined,
    password: validatePassword(data.password) ?? undefined,
    confirmPassword:
      validateConfirmPassword(data.password, data.confirmPassword) ?? undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    // Re-validate the changed field (and confirmPassword if password changes)
    const newErrors = validate(updated);
    setErrors((prev) => ({
      ...prev,
      [name]: touched[name] ? newErrors[name as keyof FormErrors] : prev[name as keyof FormErrors],
      ...(name === "password" && touched.confirmPassword
        ? { confirmPassword: newErrors.confirmPassword }
        : {}),
    }));
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = validate(formData);
    setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
  };

  const setRole = (role: "user" | "provider") => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields touched and run full validation
    const allTouched: Record<string, boolean> = {
      name: true, email: true, phone: true, password: true, confirmPassword: true,
    };
    setTouched(allTouched);
    const newErrors = validate(formData);
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) {
      return;
    }
    if (!agreeTerms) {
      setErrors(prev => ({ ...prev, terms: "You must agree to the Terms of Service to continue." }));
      return;
    }

    await signup(formData);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans">
      {/* LOGO AREA */}
      <div className="flex flex-col items-center mb-8 gap-3">
        <div className="w-full h-16 flex items-center justify-center">
          <img src={logo} alt="ServiceHub" className="h-full object-contain" />
        </div>
        <p className="text-slate-500 text-sm mt-1 font-medium italic">
          Join our community as a customer or service professional.
        </p>
      </div>

      <div className="max-w-md w-full card-premium p-10 shadow-xl shadow-slate-200/50">
        {/* ROLE SELECTION TABS */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
          <button
            type="button"
            onClick={() => setRole("user")}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
              formData.role === "user"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => setRole("provider")}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
              formData.role === "provider"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Provider
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Name */}
          <div>
            <Input
              label="Full Name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur("name")}
              required
              icon={<User size={18} />}
              error={touched.name ? errors.name : undefined}
            />
          </div>

          {/* Email */}
          <div>
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              required
              icon={<Mail size={18} />}
              error={touched.email ? errors.email : undefined}
            />
          </div>

          {/* Phone */}
          <div>
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => handleBlur("phone")}
              icon={<Phone size={18} />}
              error={touched.phone ? errors.phone : undefined}
            />
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Min. 8 chars"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                required
                icon={<Lock size={16} />}
                error={touched.password ? errors.password : undefined}
              />
              <PasswordStrengthBar password={formData.password} />
            </div>
            <div>
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("confirmPassword")}
                required
                icon={<Lock size={16} />}
                error={touched.confirmPassword ? errors.confirmPassword : undefined}
              />
            </div>
          </div>

          {/* API Error Banner */}
          {error && (
            <div className="text-[11px] text-red-600 font-bold bg-red-50 border-l-4 border-red-500 p-3 flex gap-2 items-center rounded">
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Terms */}
          <div className="space-y-1">
            <div className="flex items-start gap-2.5 cursor-pointer group py-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={() => { setAgreeTerms(!agreeTerms); setErrors(prev => ({...prev, terms: undefined})); }}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20 transition-all cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors cursor-pointer select-none leading-relaxed"
              >
                By creating an account, you agree to our{" "}
                <Link to="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs font-semibold ml-1">{errors.terms}</p>}
          </div>

          <Button type="submit" loading={loading}>
            <span>Create Account</span>
            <ArrowRight size={18} />
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-extrabold text-slate-400">
              <span className="px-3 bg-white">OR</span>
            </div>
          </div>

          <Button type="button" variant="google" onClick={() => handleGoogleSignup()}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <p className="text-center text-xs font-semibold text-slate-500 pt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 hover:underline font-bold ml-1 transition-all"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>

      <div className="mt-8 text-[11px] font-bold text-slate-400">
        © 2024 ServiceHub Inc. All rights reserved.
      </div>
    </div>
  );
};

export default Signup;
