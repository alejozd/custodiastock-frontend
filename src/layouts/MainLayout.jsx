import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { authService } from "../auth/authService";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = authService.getRole() || "OPERATOR";

  return (
    <div className="app-shell min-h-screen surface-ground">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="app-body">
        <div className="hidden lg:block">
          <Sidebar role={role} />
        </div>

        {sidebarOpen && (
          <>
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
            <div className="sidebar-mobile surface-0">
              <Sidebar role={role} onNavigate={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        <main className="app-content p-3 md:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
