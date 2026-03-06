import { NavLink } from "react-router-dom";
import { getRoleLabel } from "../utils/roleLabels";

function Sidebar({ role, onNavigate }) {
  const adminItems = [
    { label: "Dashboard", icon: "pi pi-chart-bar", to: "/dashboard" },
    { label: "Usuarios", icon: "pi pi-users", to: "/usuarios" },
    { label: "Productos", icon: "pi pi-box", to: "/productos" },
    { label: "Entregas", icon: "pi pi-truck", to: "/entregas" },
    { label: "Nueva entrega", icon: "pi pi-plus-circle", to: "/nueva-entrega" },
  ];

  const operatorItems = [
    { label: "Productos", icon: "pi pi-box", to: "/productos" },
    { label: "Nueva entrega", icon: "pi pi-plus-circle", to: "/nueva-entrega" },
  ];

  const normalizedRole = String(role ?? "OPERATOR").toUpperCase();
  const menuItems = normalizedRole === "ADMIN" ? adminItems : operatorItems;

  return (
    <aside className="app-sidebar p-3">
      <div className="sidebar-header px-2 py-3 mb-3 border-round-lg">
        <small className="text-700 font-semibold">Rol actual</small>
        <p className="m-0 text-900 font-bold mt-1">{getRoleLabel(normalizedRole)}</p>
      </div>

      <nav>
        <ul className="list-none p-0 m-0 flex flex-column gap-2">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `sidebar-link flex align-items-center gap-2 px-3 py-2 border-round-lg ${isActive ? "active" : ""}`
                }
              >
                <i className={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
