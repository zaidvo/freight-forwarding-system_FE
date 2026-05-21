// Reusable Tabs primitive (placeholder)
import React from "react";

const Tabs: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="tabs">{children}</div>
);

export default Tabs;
