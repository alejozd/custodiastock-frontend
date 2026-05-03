import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getRoleLabel } from "../utils/roleLabels";
import pkg from "../../package.json";
import { Tag } from "primereact/tag";
import licenseService from "../services/licenseService";
import { shouldShowActivationScreen } from "../utils/licenseGuards";

function Sidebar({ role, onNavigate }) {
  const [configExpanded, setConfigExpanded] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState(null);

  useEffect(() => {
    if (String(role ?? "").toUpperCase() !== "ADMIN") return;

    const refreshLicense = () => {
      licenseService.getLicenseStatus().then(setLicenseInfo).catch(() => setLicenseInfo(null));
    };

    refreshLicense();
    const intervalId = setInterval(refreshLicense, 15000);
    window.addEventListener("focus", refreshLicense);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", refreshLicense);
    };
  }, [role]);

  const isBlocked = licenseInfo?.status === "BLOCKED";
  const isPendingActivation = shouldShowActivationScreen(licenseInfo);
  const isExpired = licenseInfo?.expirationDate && new Date(licenseInfo.expirationDate) < new Date();
  const isDemoExpired = licenseInfo?.licenseType === "DEMO" && (Number(licenseInfo?.daysRemaining) <= 0 || isExpired);
  const canAccessCritical = licenseInfo?.status === "ACTIVE" && !isDemoExpired && !isBlocked && !isPendingActivation;

  const adminItems = [
    { label: "Dashboard", icon: "pi pi-chart-bar", to: "/dashboard" },
    { label: "Usuarios", icon: "pi pi-users", to: "/usuarios" },
    { label: "Productos", icon: "pi pi-box", to: "/productos" },
    { label: "Entradas", icon: "pi pi-download", to: "/entradas", critical: true },
    { label: "Entregas", icon: "pi pi-truck", to: "/entregas", critical: true },
    { label: "Reporte Stock", icon: "pi pi-file-excel", to: "/reporte-stock", critical: true },
    { label: "Licencia", icon: "pi pi-shield", to: "/licencia" },
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
        <small className="text-600 font-semibold uppercase text-xs">Rol actual</small>
        <p className="m-0 text-primary font-bold mt-1 text-lg">{getRoleLabel(normalizedRole)}</p>
      </div>

      <nav className="flex-grow-1 overflow-y-auto">
        <ul className="list-none p-0 m-0 flex flex-column gap-2">
          {menuItems.map((item) => {
            const locked = normalizedRole === "ADMIN" && item.critical && !canAccessCritical;
            if (locked) {
              return (
                <li key={item.to}>
                  <div className="sidebar-link flex align-items-center justify-content-between gap-3 px-3 py-3 border-round-xl text-500 surface-100" title="Licencia requerida o expirada">
                    <div className="flex align-items-center gap-3">
                      <i className={`${item.icon} text-xl`} />
                      <span className="text-base">{item.label}</span>
                    </div>
                    <i className="pi pi-lock" />
                  </div>
                </li>
              );
            }

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) => `sidebar-link flex align-items-center gap-3 px-3 py-3 border-round-xl transition-all transition-duration-200 ${isActive ? "active font-bold" : "text-700 hover:surface-100"}`}
                >
                  <i className={`${item.icon} text-xl`} />
                  <span className="text-base">{item.label}</span>
                </NavLink>
              </li>
            );
          })}

          {normalizedRole === "ADMIN" && (
            <li>
              <div onClick={() => setConfigExpanded(!configExpanded)} className={`sidebar-link flex align-items-center justify-content-between px-3 py-3 border-round-xl transition-all transition-duration-200 cursor-pointer text-700 hover:surface-100 ${configExpanded ? "bg-blue-50 text-primary font-bold" : ""}`}>
                <div className="flex align-items-center gap-3"><i className="pi pi-cog text-xl" /><span className="text-base">Configuración</span></div>
                <i className={`pi pi-chevron-${configExpanded ? "down" : "right"} text-xs`} />
              </div>
              {configExpanded && (
                <ul className="list-none p-0 m-0 mt-1 flex flex-column gap-1 pl-4 animate-fade-in">
                  <li>
                    <NavLink to="/configuracion/secuencias" onClick={onNavigate} className={({ isActive }) => `sidebar-link flex align-items-center gap-3 px-3 py-2 border-round-lg transition-all transition-duration-200 ${isActive ? "active font-bold" : "text-600 hover:surface-100"}`}>
                      <i className="pi pi-list text-lg" /><span className="text-sm">Secuencias</span>
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>

      <div className="mt-auto p-2">
        <div className="surface-100 border-round-xl p-3 text-center border-1 border-200">
          <img src="/logo.svg" alt="Logo" className="mb-2 opacity-80" style={{ width: "35px", height: "35px" }} />
          <div className="flex flex-column align-items-center gap-1">
            <span className="text-xs font-bold text-700 uppercase" style={{ letterSpacing: "0.5px" }}>{pkg.name}</span>
            <Tag value={`v${pkg.version}`} severity="secondary" className="px-2" style={{ fontSize: "12px", height: "18px", backgroundColor: "#e2e8f0", color: "#475569" }} />
            <div className="mt-2 pt-2 border-top-1 border-200 w-full">
              <p className="m-0 text-500" style={{ fontSize: "12px" }}>© {new Date().getFullYear()} <b>{pkg.author}</b></p>
              <p className="m-0 text-400 mt-1" style={{ fontSize: "10px" }}>Compilación: {pkg.buildDate}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
