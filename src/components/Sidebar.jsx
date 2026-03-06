import { NavLink } from "react-router-dom";

function Sidebar({ role, onNavigate }) {
  const adminItems = [
    { label: "Dashboard", icon: "pi pi-chart-bar", to: "/dashboard" },
    { label: "Usuarios", icon: "pi pi-users", to: "/usuarios" },
    { label: "Productos", icon: "pi pi-box", to: "/productos" },
    { label: "Entregas", icon: "pi pi-truck", to: "/entregas" },
  ];

  const operatorItems = [
    { label: "Productos", icon: "pi pi-box", to: "/productos" },
    { label: "Nueva entrega", icon: "pi pi-plus-circle", to: "/nueva-entrega" },
  ];

  const menuItems = role === "ADMIN" ? adminItems : operatorItems;

  return (
    <aside className="app-sidebar surface-0 border-right-1 border-200 p-3">
      <div className="px-2 pb-3">
        <small className="text-500">Rol: {role || "OPERADOR"}</small>
      </div>

      <nav>
        <ul className="list-none p-0 m-0 flex flex-column gap-2">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `sidebar-link flex align-items-center gap-2 px-3 py-2 border-round ${isActive ? "active" : ""}`
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
