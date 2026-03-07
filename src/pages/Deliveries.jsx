import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import DeliveryViewDialog from "../components/deliveries/DeliveryViewDialog";
import DeliveryCancelDialog from "../components/deliveries/DeliveryCancelDialog";
import "../styles/Common.css";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

const toList = (response) => response.data?.data ?? response.data ?? [];

function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [selectedView, setSelectedView] = useState(null);
  const toast = useRef(null);
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get("/deliveries");
      setDeliveries(toList(response));
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar las entregas.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusSeverity = (status) => {
    const s = String(status).toUpperCase();
    if (s.includes("CANCEL")) return "danger";
    if (s.includes("PENDING")) return "warning";
    return "success";
  };

  const openView = (delivery) => {
    setSelectedView(null);
    setTimeout(() => {
      setSelectedView(delivery);
      setViewDialogVisible(true);
    }, 10);
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const openCancel = (delivery) => {
    setSelectedDelivery(delivery);
    setCancelReason("");
    setDialogVisible(true);
  };

  const submitCancel = async () => {
    if (!selectedDelivery || !currentUser) return;

    if (!cancelReason.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Atención",
        detail: "Debes ingresar un motivo para la cancelación.",
        life: 5000,
      });
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/deliveries/${selectedDelivery.id}/cancel`, {
        adminUserId: currentUser.id,
        reason: cancelReason,
      });

      toast.current?.show({
        severity: "success",
        summary: "Entrega cancelada",
        detail: `La entrega #${selectedDelivery.id} ha sido anulada con éxito.`,
        life: 5000,
      });

      setDialogVisible(false);
      setSelectedDelivery(null);
      setCancelReason("");
      loadDeliveries();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "No se pudo cancelar.",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deliveries-container animate-fade-in">
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="m-0 page-title">Historial de Entregas</h1>
          <p className="text-600 m-0">
            Registro detallado de movimientos y firmas.
          </p>
        </div>
        <Button
          label="Nueva Entrega"
          icon="pi pi-plus"
          className="p-button-raised"
          onClick={() => navigate("/nueva-entrega")}
        />
      </div>

      <div className="table-card">
        <DataTable
          value={deliveries}
          loading={loading}
          paginator
          rows={10}
          size="small"
          className="p-datatable-modern"
          dataKey="id"
          responsiveLayout="stack"
          breakpoint="960px"
        >
          <Column
            field="id"
            header="ID"
            body={(row) => (
              <span className="font-mono font-bold text-primary">
                #{row.id}
              </span>
            )}
            style={{ width: "5rem" }}
          />

          <Column
            header="Producto / Cantidad"
            body={(row) => (
              <div className="flex flex-column">
                <span className="font-bold text-900">
                  {row.product?.name ?? row.productId}
                </span>
                <small className="text-600">
                  Cantidad: {row.quantity} unidades
                </small>
              </div>
            )}
          />

          <Column
            header="Responsables"
            body={(row) => (
              <div className="flex flex-column gap-1">
                <div className="flex align-items-center gap-2">
                  <i
                    className="pi pi-arrow-up-right text-green-500 text-xs"
                    title="Entregado por"
                  ></i>
                  <span className="text-sm">
                    <b>De:</b>{" "}
                    {row.deliveredBy?.fullName ||
                      row.deliveredBy?.name ||
                      "Sistema"}
                  </span>
                </div>
                <div className="flex align-items-center gap-2">
                  <i
                    className="pi pi-arrow-down-left text-blue-500 text-xs"
                    title="Recibido por"
                  ></i>
                  <span className="text-sm">
                    <b>Para:</b>{" "}
                    {row.receivedBy?.fullName || row.receivedBy?.name}
                  </span>
                </div>
              </div>
            )}
          />

          <Column
            header="Estado"
            body={(row) => (
              <Tag
                value={String(row.status).toUpperCase()}
                severity={getStatusSeverity(row.status)}
                style={{ borderRadius: "5px", padding: "0.2rem 0.5rem" }}
              />
            )}
          />

          <Column
            header="Fecha y Hora"
            body={(row) => (
              <div className="flex flex-column">
                <span className="text-900">
                  {new Date(row.createdAt).toLocaleDateString("es-CO")}
                </span>
                <small className="text-500">
                  {new Date(row.createdAt).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
            )}
          />

          <Column
            header="Acciones"
            body={(row) => (
              <div className="flex gap-1">
                <Button
                  icon="pi pi-eye"
                  text
                  rounded
                  severity="info"
                  tooltip="Ver Comprobante"
                  onClick={() => openView(row)}
                />
                <Button
                  icon="pi pi-ban"
                  text
                  rounded
                  severity="danger"
                  disabled={String(row.status).toUpperCase().includes("CANCEL")}
                  onClick={() => openCancel(row)}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <DeliveryViewDialog
        visible={viewDialogVisible}
        onHide={() => setViewDialogVisible(false)}
        delivery={selectedView}
      />

      <DeliveryCancelDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        delivery={selectedDelivery}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        onCancel={submitCancel}
        loading={loading}
      />
    </div>
  );
}

export default Deliveries;
