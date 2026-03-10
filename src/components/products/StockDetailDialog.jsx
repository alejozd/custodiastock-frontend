import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import entryService from "../../services/entryService";
import api from "../../api/apiClient";

const toList = (response) => response.data?.data ?? response.data ?? [];

function StockDetailDialog({ visible, onHide, product, startDate, endDate }) {
  const [entries, setEntries] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMovements = async () => {
    if (!product || !visible) return;

    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const [entriesRes, deliveriesRes] = await Promise.all([
        entryService.getEntries(params),
        api.get("/deliveries", { params }),
      ]);

      const allEntries = Array.isArray(entriesRes) ? entriesRes : [];
      const allDeliveries = toList(deliveriesRes);

      // Client-side filtering by productId
      const filteredEntries = allEntries.filter(
        (e) => e.productId === product.id || e.product?.id === product.id
      );

      const filteredDeliveries = allDeliveries.filter((d) => {
        // Some deliveries might have multiple items, others might have a single product
        if (d.productId === product.id || d.product?.id === product.id) return true;
        if (d.items && Array.isArray(d.items)) {
          return d.items.some((item) => item.productId === product.id || item.product?.id === product.id);
        }
        return false;
      });

      setEntries(filteredEntries);
      setDeliveries(filteredDeliveries);
    } catch (error) {
      console.error("Error loading movements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, product]);

  const footer = (
    <div className="flex justify-content-end">
      <Button label="Cerrar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
    </div>
  );

  return (
    <Dialog
      header={`Movimientos: ${product?.name || ""}`}
      visible={visible}
      onHide={onHide}
      footer={footer}
      style={{ width: "80vw" }}
      maximizable
      modal
    >
      <div className="flex flex-column gap-3">
        <div className="surface-100 p-3 border-round-lg flex flex-column md:flex-row justify-content-between gap-2">
            <div>
                <span className="text-500 text-sm block">Referencia</span>
                <span className="font-bold">{product?.reference || "N/A"}</span>
            </div>
            <div>
                <span className="text-500 text-sm block">Rango de Consulta</span>
                <span className="font-bold">
                    {startDate ? new Date(startDate).toLocaleDateString() : "Inicio"} - {endDate ? new Date(endDate).toLocaleDateString() : "Fin"}
                </span>
            </div>
        </div>

        <TabView>
          <TabPanel header="Entradas" leftIcon="pi pi-download mr-2">
            <DataTable
              value={entries}
              loading={loading}
              paginator
              rows={5}
              className="p-datatable-sm"
              emptyMessage="No se encontraron entradas en este periodo."
            >
              <Column field="documentNumber" header="Documento" sortable />
              <Column field="quantity" header="Cantidad" align="center" sortable />
              <Column
                field="entryDate"
                header="Fecha"
                body={(r) => new Date(r.entryDate || r.createdAt).toLocaleString()}
                sortable
              />
              <Column field="createdBy.fullName" header="Registrado por" />
            </DataTable>
          </TabPanel>
          <TabPanel header="Entregas" leftIcon="pi pi-truck mr-2">
            <DataTable
              value={deliveries}
              loading={loading}
              paginator
              rows={5}
              className="p-datatable-sm"
              emptyMessage="No se encontraron entregas en este periodo."
            >
              <Column field="documentNumber" header="Documento" sortable />
              <Column
                header="Cantidad"
                body={(row) => {
                    if (row.productId === product?.id) return row.quantity;
                    const item = row.items?.find(i => (i.productId === product?.id || i.product?.id === product?.id));
                    return item ? item.quantity : row.quantity;
                }}
                align="center"
              />
              <Column
                field="deliveryDate"
                header="Fecha"
                body={(r) => new Date(r.deliveryDate || r.createdAt).toLocaleString()}
                sortable
              />
              <Column field="receivedBy.fullName" header="Entregado a" />
            </DataTable>
          </TabPanel>
        </TabView>
      </div>
    </Dialog>
  );
}

export default StockDetailDialog;
