import { NavLink } from "react-router-dom";
import { getRoleLabel } from "../utils/roleLabels";

function Sidebar({ role, onNavigate }) {
  const adminItems = [
    { label: "Dashboard", icon: "pi pi-chart-bar", to: "/dashboard" },
    { label: "Usuarios", icon: "pi pi-users", to: "/usuarios" },
    { label: "Productos", icon: "pi pi-box", to: "/productos" },
    { label: "Entregas", icon: "pi pi-truck", to: "/entregas" },
  ];

  const operatorItems = [
    { label: "Productos", icon: "pi pi-box", to: "/productos" },
    { label: "Entregas", icon: "pi pi-plus-circle", to: "/nueva-entrega" },
  ];

  const normalizedRole = String(role ?? "OPERATOR").toUpperCase();
  const menuItems = normalizedRole === "ADMIN" ? adminItems : operatorItems;

  return (
    <aside className="app-sidebar p-3 animate-fade-in">
      <div className="sidebar-header px-3 py-3 mb-4 border-round-xl surface-50 border-1 border-100 shadow-1">
        <small className="text-600 font-semibold uppercase text-xs">Rol actual</small>
        <p className="m-0 text-primary font-bold mt-1 text-lg">{getRoleLabel(normalizedRole)}</p>
      </div>

      <nav>
        <ul className="list-none p-0 m-0 flex flex-column gap-2">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `sidebar-link flex align-items-center gap-3 px-3 py-3 border-round-xl transition-all transition-duration-200 ${isActive ? "active font-bold" : "text-700 hover:surface-100"}`
                }
              >
                <i className={`${item.icon} text-xl`} />
                <span className="text-base">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto p-2">
        <div className="surface-100 border-round-xl p-3 text-center">
            <img src="/logo.svg" alt="CustodiaStock Logo" className="mb-2" style={{ width: '32px', height: '32px' }} />
            <p className="m-0 text-xs font-medium text-600">CustodiaStock v1.0</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
