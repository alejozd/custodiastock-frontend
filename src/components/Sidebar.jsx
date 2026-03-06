import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", icon: "pi pi-home", to: "/dashboard" },
  { label: "Users", icon: "pi pi-users", to: "/users" },
  { label: "Products", icon: "pi pi-box", to: "/products" },
  { label: "Deliveries", icon: "pi pi-truck", to: "/deliveries" },
];

function Sidebar() {
  return (
    <aside className="app-sidebar surface-100 border-right-1 border-200 p-3">
      <nav>
        <ul className="list-none p-0 m-0 flex flex-column gap-2">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link flex align-items-center gap-2 px-3 py-2 border-round ${
                    isActive ? "active" : "text-700"
                  }`
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
