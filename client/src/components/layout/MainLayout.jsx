
import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import MobileNavbar from "./MobileNavbar";
import BottomNavigation from "./BottomNavigation";

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Desktop and mobile header */}
      <Header
        onMenuClick={() => setSidebarOpen((value) => !value)}
      />

      {/* Mobile top navigation */}
      <MobileNavbar />

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Desktop sidebar */}
        <aside
          className={[
            "hidden shrink-0 border-r border-white/10 bg-slate-900 transition-all duration-300 lg:block",
            sidebarCollapsed ? "w-20" : "w-64",
          ].join(" ")}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() =>
              setSidebarCollapsed((value) => !value)
            }
          />
        </aside>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside
          className={[
            "fixed bottom-0 left-0 top-16 z-50 w-72 overflow-y-auto border-r border-white/10 bg-slate-900 transition-transform duration-300 lg:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <Sidebar
            mobile
            onNavigate={() => setSidebarOpen(false)}
          />
        </aside>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-w-0 flex-1 px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:pb-8">
            {children ?? <Outlet />}
          </main>

          <Footer />
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNavigation />
    </div>
  );
}

export default MainLayout;
