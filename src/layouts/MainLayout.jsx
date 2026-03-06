import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function MainLayout() {
  return (
    <div className="app-shell min-h-screen surface-ground">
      <Navbar />
      <div className="flex" style={{ minHeight: "calc(100vh - 73px)" }}>
        <Sidebar />
        <main className="app-content flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
