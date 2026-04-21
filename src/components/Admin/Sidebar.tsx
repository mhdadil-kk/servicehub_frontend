import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CalendarCheck, 
  Headset, 
  Settings,
  LogOut
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useAuth } from "../../hooks/useAuth";

const SidebarItem = ({ icon: Icon, label, path, active }: { icon: any, label: string, path: string, active: boolean }) => (
  <Link 
    to={path}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
      active 
      ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50" 
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    }`}
  >
    <Icon size={20} className={active ? "text-blue-600" : "text-slate-400"} />
    <span>{label}</span>
  </Link>
);

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Briefcase, label: "Providers", path: "/admin/providers" },
    { icon: CalendarCheck, label: "Bookings", path: "/admin/bookings" },
    { icon: Headset, label: "Support", path: "/admin/support" },
    { icon: Settings, label: "Services", path: "/admin/services" },
  ];

  return (
    <aside className="w-72 h-screen bg-white border-r border-slate-200 sticky top-0 flex flex-col p-6 shadow-sm z-50">
      {/* BRANDING */}
      <div className="flex items-center justify-center mb-10 h-12 w-full">
         <img src={logo} alt="Logo" className="h-full object-contain" />
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1.5 font-medium">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            active={location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))}
          />
        ))}
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="pt-6 border-t border-slate-100">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-semibold text-sm group"
        >
          <LogOut size={20} className="text-slate-400 group-hover:text-red-500" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
