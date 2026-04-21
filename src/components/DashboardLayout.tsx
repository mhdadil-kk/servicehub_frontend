import React from "react";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md text-center">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
