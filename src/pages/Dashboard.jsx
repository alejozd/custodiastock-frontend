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
    usuariosAdmin: 0,
    usuariosOperario: 0,
    totalEntradas: 0,
    entradasCanceladas: 0,
    totalEntregas: 0,
    entregasCanceladas: 0,
  });
  const toast = useRef(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const [productsRes, usersRes, deliveriesRes, entriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/users"),
          api.get("/deliveries"),
          api.get("/entries"),
        ]);

        const productos = toList(productsRes);
        const usuarios = toList(usersRes);
        const entregas = toList(deliveriesRes);
        const entradas = toList(entriesRes);

        const uAdmin = usuarios.filter((u) => u.role === "ADMIN").length;
        const uOperario = usuarios.filter((u) => u.role === "OPERATOR").length;

        const entriesCanceladas = entradas.filter((item) =>
          String(item.status).toUpperCase().includes("CANCEL"),
        ).length;

        const deliveriesCanceladas = entregas.filter((item) =>
          String(item.status).toUpperCase().includes("CANCEL"),
        ).length;

        setMetrics({
          totalProductos: productos.length,
          usuariosAdmin: uAdmin,
          usuariosOperario: uOperario,
          totalEntradas: entradas.length,
          entradasCanceladas: entriesCanceladas,
          totalEntregas: entregas.length,
          entregasCanceladas: deliveriesCanceladas,
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
      titulo: "Usuarios",
      icono: "pi pi-users",
      color: "purple",
      detalles: [
        { label: "ADMIN", valor: metrics.usuariosAdmin },
        { label: "Operario", valor: metrics.usuariosOperario },
      ],
    },
    {
      titulo: "Entradas",
      icono: "pi pi-download",
      color: "teal",
      detalles: [
        { label: "Total", valor: metrics.totalEntradas },
        { label: "Canceladas", valor: metrics.entradasCanceladas },
      ],
    },
    {
      titulo: "Entregas",
      icono: "pi pi-truck",
      color: "red",
      detalles: [
        { label: "Total", valor: metrics.totalEntregas },
        { label: "Canceladas", valor: metrics.entregasCanceladas },
      ],
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
                    {card.detalles ? (
                      <div className="kpi-breakdown">
                        {card.detalles.map((det, idx) => (
                          <div key={idx} className="breakdown-item">
                            <span className="breakdown-valor">{det.valor}</span>
                            <span className="breakdown-label">{det.label}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <h2 className="kpi-value">{card.valor}</h2>
                    )}
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
