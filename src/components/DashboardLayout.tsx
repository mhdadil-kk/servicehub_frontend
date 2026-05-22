import React from "react";
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
  CalendarCheck
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import logo from "../assets/logo.png";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const getHeaderTitle = () => {
    if (location.pathname === "/user" || location.pathname === "/user/dashboard") return "Dashboard";
    if (location.pathname === "/user/browse") return "Browse Services";
    if (location.pathname === "/user/bookings") return "My Bookings";
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
    </div>
  );
};

export default DashboardLayout;
