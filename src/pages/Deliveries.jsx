import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import api from "../api/apiClient";

const emptyDelivery = {
  id: null,
  productId: "",
  quantity: "",
  destination: "",
  scheduledDate: "",
};

function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState(emptyDelivery);
  const toast = useRef(null);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get("/deliveries");
      setDeliveries(response.data?.data ?? response.data ?? []);
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to load deliveries" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const createDelivery = async () => {
    try {
      await api.post("/deliveries", deliveryForm);
      toast.current?.show({ severity: "success", summary: "Delivery created" });
      setDialogVisible(false);
      setDeliveryForm(emptyDelivery);
      loadDeliveries();
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Unable to create delivery" });
    }
  };

  const cancelDelivery = (delivery) => {
    const deliveryId = delivery.id;

    confirmDialog({
      message: `Cancel delivery #${deliveryId}?`,
      header: "Confirm cancellation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await api.patch(`/deliveries/${deliveryId}/cancel`);
          toast.current?.show({ severity: "success", summary: "Delivery cancelled" });
          loadDeliveries();
        } catch {
          toast.current?.show({ severity: "error", summary: "Error", detail: "Unable to cancel delivery" });
        }
      },
    });
  };

  const actionTemplate = (rowData) => (
    <Button
      icon="pi pi-ban"
      label="Cancel"
      severity="danger"
      text
      onClick={() => cancelDelivery(rowData)}
      disabled={String(rowData.status).toLowerCase() === "cancelled"}
    />
  );

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-3">
        <h1 className="text-900 m-0 text-2xl">Deliveries Management</h1>
        <Button label="Create Delivery" icon="pi pi-plus" onClick={() => setDialogVisible(true)} />
      </div>

      <DataTable value={deliveries} loading={loading} paginator rows={10} responsiveLayout="scroll" dataKey="id">
        <Column field="id" header="ID" />
        <Column field="productId" header="Product" />
        <Column field="quantity" header="Quantity" />
        <Column field="destination" header="Destination" />
        <Column field="scheduledDate" header="Scheduled" />
        <Column field="status" header="Status" />
        <Column header="Actions" body={actionTemplate} style={{ width: "9rem" }} />
      </DataTable>

      <Dialog
        visible={dialogVisible}
        header="Create Delivery"
        onHide={() => setDialogVisible(false)}
        style={{ width: "36rem" }}
      >
        <div className="flex flex-column gap-3 pt-2">
          <span className="p-float-label">
            <InputText
              id="delivery-product"
              className="w-full"
              value={deliveryForm.productId}
              onChange={(event) =>
                setDeliveryForm((prev) => ({ ...prev, productId: event.target.value }))
              }
            />
            <label htmlFor="delivery-product">Product ID</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="delivery-quantity"
              className="w-full"
              value={deliveryForm.quantity}
              onChange={(event) => setDeliveryForm((prev) => ({ ...prev, quantity: event.target.value }))}
            />
            <label htmlFor="delivery-quantity">Quantity</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="delivery-destination"
              className="w-full"
              value={deliveryForm.destination}
              onChange={(event) =>
                setDeliveryForm((prev) => ({ ...prev, destination: event.target.value }))
              }
            />
            <label htmlFor="delivery-destination">Destination</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="delivery-scheduled"
              className="w-full"
              value={deliveryForm.scheduledDate}
              onChange={(event) =>
                setDeliveryForm((prev) => ({ ...prev, scheduledDate: event.target.value }))
              }
            />
            <label htmlFor="delivery-scheduled">Scheduled Date (YYYY-MM-DD)</label>
          </span>

          <div className="flex justify-content-end gap-2 mt-2">
            <Button label="Cancel" text onClick={() => setDialogVisible(false)} />
            <Button label="Create" onClick={createDelivery} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default Deliveries;
