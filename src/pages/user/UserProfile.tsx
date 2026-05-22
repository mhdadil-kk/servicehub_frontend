import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  BadgeCheck,
  Bell,
  Lock,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";

const UserProfile: React.FC = () => {
  const { user } = useAuthStore();

  const [emailNotifications, setEmailNotifications] = useState(true);

  // Parse joined date from created_at
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const handleChangePassword = () => {
    toast("Password change coming soon.", { icon: "🔒" });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-300">

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
        <p className="text-sm text-slate-400 font-medium mt-0.5">Manage your account information</p>
      </div>

      {/* ── PERSONAL INFORMATION ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
            Personal Information
          </h2>
          <button
            onClick={() => toast("Profile update coming soon.", { icon: "✏️" })}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
          >
            Save Changes
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Avatar row */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-50">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name ?? "U"}`}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                aria-label="Change photo"
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow"
              >
                <Camera size={12} className="text-white" />
              </button>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900">{user?.name ?? "—"}</p>
              {user?.is_verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-1">
                  <BadgeCheck size={10} />
                  Verified Account
                </span>
              )}
            </div>
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <UserIcon size={11} /> Full Name
              </label>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700">
                {user?.name ?? "—"}
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={11} /> Account Type
              </label>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 capitalize">
                {user?.role === "user" ? "Customer" : user?.role ?? "—"}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Mail size={11} /> Email Address
              </label>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 flex items-center justify-between">
                <span className="truncate">{user?.email ?? "—"}</span>
                {user?.is_verified && (
                  <span className="shrink-0 flex items-center gap-1 text-[9px] font-black text-emerald-600 ml-2">
                    <BadgeCheck size={11} className="fill-emerald-100" /> Verified
                  </span>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Phone size={11} /> Phone Number
              </label>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700">
                {user?.phone ?? (
                  <span className="text-slate-300 italic">Not provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Member since */}
          <div className="pt-4 border-t border-slate-50">
            <p className="text-[11px] font-bold text-slate-400">
              Member since{" "}
              <span className="text-slate-600">{joinedDate}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── ACCOUNT SECURITY ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
            Account Security
          </h2>
        </div>

        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              <Lock size={17} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Password</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                Update your account password regularly to keep it secure.
              </p>
            </div>
          </div>
          <button
            onClick={handleChangePassword}
            className="shrink-0 ml-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* ── COMMUNICATION PREFERENCES ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
            Communication Preferences
          </h2>
        </div>

        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Bell size={17} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Email Notifications</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                Receive updates about your activity and service status.
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            role="switch"
            aria-checked={emailNotifications}
            onClick={() => setEmailNotifications((v) => !v)}
            className={`relative shrink-0 ml-4 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
              emailNotifications ? "bg-blue-600" : "bg-slate-200"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                emailNotifications ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

    </div>
  );
};

export default UserProfile;
