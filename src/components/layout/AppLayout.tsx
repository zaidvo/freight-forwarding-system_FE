// Sidebar + topbar shell
import React from "react";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-layout">
      {/* Sidebar and Topbar go here */}
      <main>{children}</main>
    </div>
  );
};

export default AppLayout;
