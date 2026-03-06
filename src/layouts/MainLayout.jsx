import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role } = useAuth();

  return (
    <div className="app-shell min-h-screen">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="app-body">
        <div className="hidden lg:block app-sidebar-desktop">
          <Sidebar role={role} />
        </div>

        {sidebarOpen && (
          <>
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
            <div className="sidebar-mobile">
              <Sidebar role={role} onNavigate={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        <main className="app-content p-3 md:p-4">
          <div className="content-panel border-round-xl p-3 md:p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
