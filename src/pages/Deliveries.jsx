import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
// import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { InputTextarea } from "primereact/inputtextarea";
import { Image } from "primereact/image";
import "../styles/Products.css";
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
    setSelectedView(null); // Limpiamos primero por si acaso
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
      setLoading(true); // Reutilizamos el loading para feedback visual
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

  const handleActionClick = (delivery) => {
    openCancel(delivery); // Abre directo el modal del motivo
  };

  return (
    <div className="deliveries-container animate-fade-in">
      <Toast ref={toast} />
      {/* <ConfirmDialog /> */}

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
                {/* BOTÓN PARA VER DETALLE / FIRMA */}
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
                  onClick={() => handleActionClick(row)}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      {/* MODAL DE COMPROBANTE DE ENTREGA */}
      <Dialog
        visible={viewDialogVisible}
        onHide={() => setViewDialogVisible(false)}
        header="Comprobante de Entrega Digital"
        style={{ width: "min(95vw, 450px)" }}
        modal
        dismissableMask
      >
        {selectedView && (
          <div className="p-2">
            <div className="surface-card border-1 border-200 border-round p-4 shadow-1">
              {/* Encabezado del Recibo */}
              <div className="text-center mb-4">
                <i className="pi pi-check-circle text-green-500 text-4xl mb-2"></i>
                <h3 className="m-0 text-900">Entrega Exitosa</h3>
                <small className="text-500 font-mono">
                  ID: #{selectedView.id}
                </small>
              </div>

              <Divider />

              {/* Información del Producto */}
              <div className="flex justify-content-between mb-2">
                <span className="text-600">Producto:</span>
                <span className="font-bold text-900">
                  {selectedView.product?.name}
                </span>
              </div>
              <div className="flex justify-content-between mb-3">
                <span className="text-600">Cantidad:</span>
                <span className="font-bold text-900">
                  {selectedView.quantity} unds.
                </span>
              </div>

              <Divider layout="horizontal" align="center">
                <span className="p-tag p-tag-info text-xs">ACTORES</span>
              </Divider>

              <div className="grid text-sm mb-3">
                <div className="col-6">
                  <div className="text-600 mb-1 italic text-xs">
                    Entregado por:
                  </div>
                  <div className="font-semibold">
                    {selectedView.deliveredBy?.fullName || "Admin"}
                  </div>
                </div>
                <div className="col-6 text-right">
                  <div className="text-600 mb-1 italic text-xs">
                    Recibido por:
                  </div>
                  <div className="font-semibold text-primary">
                    {selectedView.receivedBy?.fullName}
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <div className="text-600 mb-2 italic text-xs">
                  Firma del Receptor:
                </div>
                <div
                  className="border-1 border-100 border-round surface-50 flex justify-content-center align-items-center p-2"
                  style={{ minHeight: "150px" }}
                >
                  {selectedView?.signatureImage ? (
                    <Image
                      src={selectedView.signatureImage}
                      alt="Firma Digital"
                      width="100%"
                      preview
                      className="signature-img-rendered"
                    />
                  ) : (
                    <div className="flex flex-column align-items-center text-400">
                      <i className="pi pi-eye-slash text-2xl mb-2"></i>
                      <span className="italic">Sin firma registrada</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center mt-4 pt-3 border-top-1 border-100">
                <small className="text-500 font-italic">
                  Fecha: {new Date(selectedView.createdAt).toLocaleString()}
                </small>
              </div>
            </div>

            <div className="flex justify-content-center mt-4">
              <Button
                label="Cerrar Comprobante"
                severity="secondary"
                outlined
                onClick={() => setViewDialogVisible(false)}
                className="w-full"
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* DIÁLOGO DE CANCELACIÓN (Único paso) */}
      <Dialog
        visible={dialogVisible}
        header={
          <div className="flex align-items-center gap-2 text-red-600">
            <i className="pi pi-exclamation-triangle text-xl"></i>
            <span>¿Anular Entrega #{selectedDelivery?.id}?</span>
          </div>
        }
        onHide={() => setDialogVisible(false)}
        style={{ width: "min(95vw, 30rem)" }}
        modal
        footer={
          <div className="flex justify-content-end gap-2 p-3">
            <Button
              label="No, volver"
              icon="pi pi-times"
              text
              severity="secondary"
              onClick={() => setDialogVisible(false)}
            />
            <Button
              label="Sí, Cancelar Entrega"
              icon="pi pi-check"
              severity="danger"
              loading={loading} // Feedback de carga
              onClick={submitCancel}
            />
          </div>
        }
      >
        <div className="flex flex-column gap-3 pt-2">
          <p className="m-0 text-700">
            Estás a punto de anular esta entrega. Por favor, explica brevemente
            el motivo para el registro:
          </p>
          <InputTextarea
            id="cancelReason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            autoResize
            className="w-full"
            placeholder="Ej: Error en los datos del receptor..."
            autoFocus // Para que el usuario pueda escribir de una vez
          />
        </div>
      </Dialog>
    </div>
  );
}

export default Deliveries;
