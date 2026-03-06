import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import api from "../api/apiClient";

const toList = (response) => response.data?.data ?? response.data ?? [];

function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const toast = useRef(null);
  const navigate = useNavigate();

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get("/deliveries");
      setDeliveries(toList(response));
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudieron cargar las entregas." });
    } finally {
      setLoading(false);
    }
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
    if (!selectedDelivery) {
      return;
    }

    try {
      await api.put(`/deliveries/${selectedDelivery.id}/cancel`, { cancelReason });
      toast.current?.show({ severity: "success", summary: "Entrega cancelada" });
      setDialogVisible(false);
      setSelectedDelivery(null);
      loadDeliveries();
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo cancelar la entrega." });
    }
  };

  const confirmCancel = (delivery) => {
    confirmDialog({
      message: `¿Deseas cancelar la entrega #${delivery.id}?`,
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Continuar",
      rejectLabel: "Volver",
      accept: () => openCancel(delivery),
    });
  };

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="mb-3 flex justify-content-between align-items-center gap-2">
        <h1 className="m-0 text-2xl">Entregas</h1>
        <Button label="Nueva entrega" icon="pi pi-plus" onClick={() => navigate("/nueva-entrega")} />
      </div>

      <DataTable value={deliveries} loading={loading} paginator rows={10} size="small" responsiveLayout="scroll" dataKey="id">
        <Column field="id" header="ID" />
        <Column header="Producto" body={(row) => row.product?.name ?? row.productId ?? "-"} />
        <Column field="quantity" header="Cantidad" />
        <Column header="Entregado por" body={(row) => row.deliveredBy?.name ?? row.deliveredById ?? "-"} />
        <Column header="Recibido por" body={(row) => row.receivedBy?.name ?? row.receivedById ?? "-"} />
        <Column field="status" header="Estado" />
        <Column
          header="Fecha"
          body={(row) => (row.createdAt ? new Date(row.createdAt).toLocaleString("es-CO") : "-")}
        />
        <Column
          header="Acciones"
          body={(row) => (
            <Button
              label="Cancelar"
              icon="pi pi-ban"
              text
              severity="danger"
              disabled={String(row.status).toUpperCase().includes("CANCEL")}
              onClick={() => confirmCancel(row)}
            />
          )}
        />
      </DataTable>

      <Dialog
        visible={dialogVisible}
        header={`Cancelar entrega #${selectedDelivery?.id ?? ""}`}
        onHide={() => setDialogVisible(false)}
        style={{ width: "min(95vw, 32rem)" }}
      >
        <div className="flex flex-column gap-3">
          <span className="p-float-label mt-2">
            <InputText
              id="cancelReason"
              className="w-full"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
            />
            <label htmlFor="cancelReason">Motivo de cancelación</label>
          </span>

          <div className="flex justify-content-end gap-2">
            <Button label="Cerrar" text onClick={() => setDialogVisible(false)} />
            <Button label="Confirmar" severity="danger" onClick={submitCancel} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default Deliveries;
