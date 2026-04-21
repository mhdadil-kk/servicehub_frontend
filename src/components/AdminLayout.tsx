import React from "react";
import Sidebar from "./Admin/Sidebar";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans">
      <Sidebar />
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
