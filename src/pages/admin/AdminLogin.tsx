import React, { useState } from "react";
import { Input, Button } from "../../components/Common";
import { useAuth } from "../../hooks/useAuth";
import { validateEmail, validatePassword } from "../../utils/validation";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    
    const passErr = validatePassword(password);
    if (passErr) errors.password = passErr;
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    await login(email, password);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white p-10 border-t-4 border-gray-900 rounded shadow-md">
        <div className="text-center mb-10">
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-widest mb-1 leading-none">ADMIN LOGIN</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Admin Email" type="email" placeholder="Email" 
            value={email} onChange={(e) => { setEmail(e.target.value); setValidationErrors(prev => ({...prev, email: ""})); }} 
            error={validationErrors.email}
          />
          <Input 
            label="Admin Password" type="password" placeholder="••••••••" 
            value={password} onChange={(e) => { setPassword(e.target.value); setValidationErrors(prev => ({...prev, password: ""})); }} 
            error={validationErrors.password}
          />

          {error && <div className="text-xs text-red-600 font-bold border-l-2 border-red-600 pl-3 py-1 mb-4 leading-relaxed uppercase tracking-tighter">Access Denied: {error}</div>}

          <Button type="submit" loading={loading} className="w-full !bg-gray-900">Enter Dashboard</Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
