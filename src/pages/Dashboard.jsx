import { useEffect, useRef, useState } from "react";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import api from "../api/apiClient";

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

        const canceladas = entregas.filter((item) => String(item.status).toUpperCase().includes("CANCEL")).length;

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
          detail: "No se pudieron cargar las métricas del dashboard.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  const cards = [
    { titulo: "Total productos", valor: metrics.totalProductos, icono: "pi pi-box" },
    { titulo: "Total usuarios", valor: metrics.totalUsuarios, icono: "pi pi-users" },
    { titulo: "Total entregas", valor: metrics.totalEntregas, icono: "pi pi-truck" },
    { titulo: "Entregas canceladas", valor: metrics.entregasCanceladas, icono: "pi pi-times-circle" },
  ];

  return (
    <div>
      <Toast ref={toast} />
      <div className="mb-4">
        <h1 className="m-0 text-2xl">Dashboard</h1>
        <p className="text-600 mb-0 mt-2">Resumen general de la operación.</p>
      </div>

      {loading ? (
        <div className="flex justify-content-center py-8">
          <ProgressSpinner />
        </div>
      ) : (
        <div className="grid">
          {cards.map((card) => (
            <div className="col-12 sm:col-6 xl:col-3" key={card.titulo}>
              <Card className="h-full">
                <div className="flex justify-content-between align-items-center">
                  <div>
                    <p className="m-0 text-600">{card.titulo}</p>
                    <h2 className="m-0 mt-2 text-900">{card.valor}</h2>
                  </div>
                  <i className={`${card.icono} text-3xl text-primary`} />
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
