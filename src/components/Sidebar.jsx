import { useState } from "react";
import { NavLink } from "react-router-dom";
import { getRoleLabel } from "../utils/roleLabels";

function Sidebar({ role, onNavigate }) {
  const [configExpanded, setConfigExpanded] = useState(false);

  const adminItems = [
    { label: "Dashboard", icon: "pi pi-chart-bar", to: "/dashboard" },
    { label: "Usuarios", icon: "pi pi-users", to: "/usuarios" },
    { label: "Productos", icon: "pi pi-box", to: "/productos" },
    { label: "Entradas", icon: "pi pi-download", to: "/entradas" },
    { label: "Entregas", icon: "pi pi-truck", to: "/entregas" },
    { label: "Reporte Stock", icon: "pi pi-file-excel", to: "/reporte-stock" },
  ];

  const operatorItems = [
    { label: "Productos", icon: "pi pi-box", to: "/productos" },
    { label: "Nueva Entrada", icon: "pi pi-download", to: "/nueva-entrada" },
    { label: "Nueva Entrega", icon: "pi pi-truck", to: "/nueva-entrega" },
  ];

  const normalizedRole = String(role ?? "OPERATOR").toUpperCase();
  const menuItems = normalizedRole === "ADMIN" ? adminItems : operatorItems;

  return (
    <aside className="app-sidebar p-3 animate-fade-in">
      <div className="sidebar-header px-3 py-3 mb-4 border-round-xl surface-50 border-1 border-100 shadow-1">
        <small className="text-600 font-semibold uppercase text-xs">
          Rol actual
        </small>
        <p className="m-0 text-primary font-bold mt-1 text-lg">
          {getRoleLabel(normalizedRole)}
        </p>
      </div>

      <nav className="flex-grow-1 overflow-y-auto">
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

          {normalizedRole === "ADMIN" && (
            <li>
              <div
                onClick={() => setConfigExpanded(!configExpanded)}
                className={`sidebar-link flex align-items-center justify-content-between px-3 py-3 border-round-xl transition-all transition-duration-200 cursor-pointer text-700 hover:surface-100 ${configExpanded ? "bg-blue-50 text-primary font-bold" : ""}`}
              >
                <div className="flex align-items-center gap-3">
                  <i className="pi pi-cog text-xl" />
                  <span className="text-base">Configuración</span>
                </div>
                <i
                  className={`pi pi-chevron-${configExpanded ? "down" : "right"} text-xs`}
                />
              </div>
              {configExpanded && (
                <ul className="list-none p-0 m-0 mt-1 flex flex-column gap-1 pl-4 animate-fade-in">
                  <li>
                    <NavLink
                      to="/configuracion/secuencias"
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `sidebar-link flex align-items-center gap-3 px-3 py-2 border-round-lg transition-all transition-duration-200 ${isActive ? "active font-bold" : "text-600 hover:surface-100"}`
                      }
                    >
                      <i className="pi pi-list text-lg" />
                      <span className="text-sm">Secuencias</span>
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>

      <div className="mt-auto p-2">
        <div className="surface-100 border-round-xl p-3 text-center">
          <img
            src="/logo.svg"
            alt="CustodiaStock Logo"
            className="mb-2"
            style={{ width: "32px", height: "32px" }}
          />
          <p className="m-0 text-xs font-medium text-600">CustodiaStock v1.0</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
