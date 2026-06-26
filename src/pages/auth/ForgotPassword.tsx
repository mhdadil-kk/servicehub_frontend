import React, { useState } from "react";
import { Input, Button } from "../../components/Common";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import logo from "../../assets/logo.png";
import { validateEmail } from "../../utils/validation";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { forgotPassword, loading, error } = useAuth();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (touched) {
      setEmailError(validateEmail(e.target.value) ?? undefined);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setEmailError(validateEmail(email) ?? undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const err = validateEmail(email);
    setEmailError(err ?? undefined);
    if (err) {
      return;
    }
    try {
      await forgotPassword(email);
      setIsSent(true);
    } catch {
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans">
      {/* LOGO AREA */}
      <div className="flex flex-col items-center mb-8 gap-3">
        <div className="w-full h-16 flex items-center justify-center">
          <img src={logo} alt="ServiceHub" className="h-full object-contain" />
        </div>
      </div>

      <div className="max-w-md w-full card-premium p-10 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col items-center mb-8">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isSent ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
            }`}
          >
            {isSent ? <CheckCircle2 size={32} /> : <KeyRound size={32} />}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
            {isSent ? "Email sent!" : "Forgot password?"}
          </h1>
          <p className="text-slate-500 text-sm font-medium text-center mt-2 leading-relaxed">
            {isSent
              ? `We've sent reset instructions to ${email}`
              : "No worries, we'll send you reset instructions via email."}
          </p>
        </div>

        {isSent ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-[13px] font-semibold text-emerald-700 leading-relaxed text-center">
              Please check your inbox (and spam folder) for the link to reset your
              account password.
            </div>
            <Button onClick={() => { setIsSent(false); setEmail(""); setTouched(false); setEmailError(undefined); }} variant="primary" className="w-full">
              Try another email
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
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleBlur}
              required
              icon={<Mail size={18} />}
              error={touched ? emailError : undefined}
            />

            {error && (
              <div className="text-[11px] text-red-600 font-bold bg-red-50 border-l-4 border-red-500 p-3 flex gap-2 items-center rounded">
                <span>⚠️ {error}</span>
              </div>
            )}

            <Button type="submit" loading={loading}>
              Reset password
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
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        © 2024 ServiceHub Inc. All rights reserved. • Support
      </div>
    </div>
  );
};

export default ForgotPassword;
