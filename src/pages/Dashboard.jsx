import { useEffect, useRef, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import api from "../api/apiClient";
import "../styles/Dashboard.css"; // Importamos el nuevo CSS

const toList = (response) => response.data?.data ?? response.data ?? [];

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalProductos: 0,
    totalUsuarios: 0,
    totalEntregas: 0,
    entregasCanceladas: 0,
  });
  const toast = useRef(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const [productsRes, usersRes, deliveriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/users"),
          api.get("/deliveries"),
        ]);

        const productos = toList(productsRes);
        const usuarios = toList(usersRes);
        const entregas = toList(deliveriesRes);
        const canceladas = entregas.filter((item) =>
          String(item.status).toUpperCase().includes("CANCEL"),
        ).length;

        setMetrics({
          totalProductos: productos.length,
          totalUsuarios: usuarios.length,
          totalEntregas: entregas.length,
          entregasCanceladas: canceladas,
        });
      } catch {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron cargar las métricas.",
        });
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  const cards = [
    {
      titulo: "Total productos",
      valor: metrics.totalProductos,
      icono: "pi pi-box",
      color: "blue",
    },
    {
      titulo: "Total usuarios",
      valor: metrics.totalUsuarios,
      icono: "pi pi-users",
      color: "purple",
    },
    {
      titulo: "Total entregas",
      valor: metrics.totalEntregas,
      icono: "pi pi-truck",
      color: "teal",
    },
    {
      titulo: "Entregas canceladas",
      valor: metrics.entregasCanceladas,
      icono: "pi pi-times-circle",
      color: "red",
    },
  ];

  return (
    <div className="dashboard-container animate-fade-in">
      <Toast ref={toast} />

      <div className="dashboard-header mb-5">
        <h1 className="dashboard-title m-0">Dashboard</h1>
        <p className="dashboard-subtitle m-0 mt-1">
          Resumen general de la operación en tiempo real.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-content-center align-items-center py-8">
          <ProgressSpinner />
        </div>
      ) : (
        <div className="grid">
          {cards.map((card) => (
            <div className="col-12 sm:col-6 lg:col-3" key={card.titulo}>
              <div className={`kpi-card kpi-border-${card.color}`}>
                <div className="kpi-content">
                  <div className="kpi-info">
                    <span className="kpi-label">{card.titulo}</span>
                    <h2 className="kpi-value">{card.valor}</h2>
                  </div>
                  <div className={`kpi-icon-wrapper icon-bg-${card.color}`}>
                    <i className={`${card.icono} kpi-icon`} />
                  </div>
                </div>
                <div className="kpi-footer">
                  <i className="pi pi-clock mr-1" />
                  <span>Actualizado ahora</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
