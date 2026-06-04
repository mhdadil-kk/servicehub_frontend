import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Search, 
  Calendar, 
  MessageSquare, 
  User, 
  LogOut, 
  HelpCircle,
  Bell,
  Clock,
  Wallet,
  CalendarCheck,
  MapPin,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import logo from "../assets/logo.png";
import { providerApi } from "../api/provider.service";
import ProviderOnboardingModal from "./ProviderOnboardingModal";
import toast from "react-hot-toast";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, setUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showReapplyModal, setShowReapplyModal] = useState(false);

  useEffect(() => {
    if (user?.role === "provider") {
      providerApi.getProfile()
        .then(res => {
          if (res.data) {
            setProfile(res.data);
            if (user.status !== res.data.onboardingStatus) {
              setUser({ ...user, status: res.data.onboardingStatus });
            }
          }
        })
        .catch(err => console.error("Error fetching provider profile in layout:", err));
    }
  }, [user?.role, user?.status]);

  const handleReapply = async () => {
    try {
      setIsResetting(true);
      await providerApi.resetForReapply();
      if (user) {
        setUser({ ...user, status: "pending" });
      }
      setShowReapplyModal(true);
      toast.success("Application reset. Please fill out onboarding steps again.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reset application state");
    } finally {
      setIsResetting(false);
    }
  };

  const getHeaderTitle = () => {
    if (location.pathname === "/user" || location.pathname === "/user/dashboard") return "Dashboard";
    if (location.pathname === "/user/browse") return "Browse Services";
    if (location.pathname === "/user/bookings") return "My Bookings";
    if (location.pathname === "/user/addresses") return "Address Book";
    if (location.pathname === "/user/messages") return "Messages";
    if (location.pathname === "/user/profile" || location.pathname === "/provider/profile") return "Profile";
    
    if (location.pathname.startsWith("/provider")) {
      if (location.pathname === "/provider/bookings") return "Bookings";
      if (location.pathname === "/provider/availability") return "Availability";
      if (location.pathname === "/provider/revenue") return "Revenue";
      if (location.pathname === "/provider/messages") return "Messages";
      return "Provider Dashboard";
    }
    return "Dashboard";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userNavigation = [
    { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { name: "Browse Services", href: "/user/browse", icon: Search },
    { name: "My Bookings", href: "/user/bookings", icon: Calendar },
    { name: "Addresses", href: "/user/addresses", icon: MapPin },
    { name: "Messages", href: "/user/messages", icon: MessageSquare },
  ];

  const providerNavigation = [
    { name: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
    { name: "Bookings", href: "/provider/bookings", icon: CalendarCheck },
    { name: "Availability", href: "/provider/availability", icon: Clock },
    { name: "Revenue", href: "/provider/revenue", icon: Wallet },
    { name: "Messages", href: "/provider/messages", icon: MessageSquare },
  ];

  const navigation = user?.role === "provider" ? providerNavigation : userNavigation;

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col">
        <div className="p-6 h-20 flex items-center">
          <img src={logo} alt="ServiceHub" className="h-10 object-contain" />
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-50 space-y-1">
          <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Account</p>
          <Link
            to={user?.role === "provider" ? "/provider/profile" : "/user/profile"}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all"
          >
            <User size={20} />
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        <div className="p-4">
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex items-center gap-3 cursor-pointer hover:bg-orange-100 transition-colors">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
              <HelpCircle size={20} />
            </div>
            <span className="text-sm font-bold text-orange-700">Support Center</span>
          </div>
        </div>

        <div className="p-4 border-t border-slate-50">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
             <img 
               src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
               alt="" 
               className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
             />
             <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-slate-900 truncate">{user?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 capitalize">{user?.role} Plan</p>
             </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">{getHeaderTitle()}</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search services..." 
                className="bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all w-64"
              />
            </div>
            <button className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-px h-6 bg-slate-100"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900">{user?.name}</p>
                <p className="text-[10px] font-bold text-slate-400">{user?.role === 'provider' ? 'Senior Professional' : 'Premium Member'}</p>
              </div>
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
                alt="" 
                className="w-10 h-10 rounded-xl shadow-sm border border-slate-100"
              />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>

      {/* --- PROVIDER VERIFICATION OVERLAYS --- */}
      {user?.role === "provider" && (
        <>
          {/* Onboarding stepper (Pending) */}
          {(user?.status === "pending" || showReapplyModal) && (
            <ProviderOnboardingModal
              isOpen={true}
              onComplete={() => {
                setShowReapplyModal(false);
              }}
            />
          )}

          {/* In Review Overlay */}
          {user?.status === "in_review" && !showReapplyModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-md">
              <div className="relative w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl p-10 text-center space-y-6 animate-in zoom-in-95 duration-300">
                <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-400 absolute top-0 left-0 right-0" />
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[28px] flex items-center justify-center shadow-lg shadow-blue-100 mx-auto">
                  <Clock size={36} className="animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Application Status</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Application In Review</h2>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  Thank you for completing your profile! Our admin team is currently reviewing your verification documents and onboarding details.
                </p>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs font-semibold text-slate-400">
                  This process typically takes 24-48 hours. We will approve your account once everything is verified.
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 py-4 rounded-[20px] font-black text-sm transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Rejected Overlay */}
          {user?.status === "rejected" && !showReapplyModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-md">
              <div className="relative w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl p-10 text-center space-y-6 animate-in zoom-in-95 duration-300">
                <div className="h-2 w-full bg-gradient-to-r from-rose-600 via-rose-500 to-orange-400 absolute top-0 left-0 right-0" />
                <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[28px] flex items-center justify-center shadow-lg shadow-rose-100 mx-auto">
                  <AlertTriangle size={36} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Application Status</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Application Rejected</h2>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  Your provider application was reviewed and could not be approved at this time.
                </p>
                {profile?.rejectionReason && (
                  <div className="bg-rose-50 border border-rose-100 rounded-3xl p-4 text-left">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Reason from Admin</p>
                    <p className="text-xs font-semibold text-rose-700 leading-relaxed italic">
                      "{profile.rejectionReason}"
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  <button
                    onClick={handleReapply}
                    disabled={isResetting}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-[20px] font-black text-sm shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} className={isResetting ? "animate-spin" : ""} />
                    {isResetting ? "Preparing..." : "Review & Re-apply"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-[20px] font-black text-xs transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardLayout;
