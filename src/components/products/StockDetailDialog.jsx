import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import productService from "../../services/productService";
import { getAvatarColor } from "../../utils/avatarColors";

function StockDetailDialog({ visible, onHide, product, startDate, endDate }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMovements = async () => {
    if (!product || !visible) return;

    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const data = await productService.getProductMovements(product.id, params);

      // Asegurarse de ordenar por fecha descendente
      const sortedMovements = (Array.isArray(data) ? data : []).sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );

      setMovements(sortedMovements);
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

  const typeTemplate = (row) => {
    const isEntry = row.type === "ENTRY";
    return (
      <Tag
        value={isEntry ? "ENTRADA" : "ENTREGA"}
        severity={isEntry ? "success" : "info"}
        icon={isEntry ? "pi pi-download" : "pi pi-truck"}
        className="text-xs px-2"
        style={{ borderRadius: '20px' }}
      />
    );
  };

  const quantityTemplate = (row) => {
    const isEntry = row.type === "ENTRY";
    return (
      <span className={`font-bold ${isEntry ? 'text-green-600' : 'text-blue-600'}`}>
        {isEntry ? '+' : '-'}{row.quantity}
      </span>
    );
  };

  const userTemplate = (row) => {
    const userName = row.user || "Sistema";
    const colors = getAvatarColor(userName);
    return (
      <div className="flex align-items-center gap-2">
        <Avatar
          label={userName.charAt(0).toUpperCase()}
          shape="circle"
          size="small"
          style={{ backgroundColor: colors.bg, color: colors.text, fontSize: '0.7rem' }}
        />
        <span className="text-sm">{userName}</span>
      </div>
    );
  };

  const totals = movements.reduce((acc, curr) => {
    if (curr.type === "ENTRY") acc.entries += curr.quantity;
    else acc.deliveries += curr.quantity;
    return acc;
  }, { entries: 0, deliveries: 0 });

  return (
    <Dialog
      header={`Kárdex de Movimientos: ${product?.name || ""}`}
      visible={visible}
      onHide={onHide}
      style={{ width: "90vw", maxWidth: '1000px' }}
      maximizable
      modal
      className="modern-dialog"
      footer={<Button label="Cerrar" icon="pi pi-times" text onClick={onHide} />}
    >
      <div className="flex flex-column gap-4 py-2">
        {/* ENCABEZADO RESUMEN */}
        <div className="grid">
          <div className="col-12 md:col-4">
            <div className="surface-card p-3 border-round-xl border-1 border-200 shadow-1 flex align-items-center gap-3">
              <div className="bg-blue-50 text-blue-600 p-3 border-round-lg">
                <i className="pi pi-tag text-xl"></i>
              </div>
              <div className="flex flex-column">
                <span className="text-500 text-xs font-bold uppercase">Referencia</span>
                <span className="text-xl font-bold text-900">{product?.reference || "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-4">
            <div className="surface-card p-3 border-round-xl border-1 border-200 shadow-1 flex align-items-center gap-3">
              <div className="bg-green-50 text-green-600 p-3 border-round-lg">
                <i className="pi pi-arrow-down-left text-xl"></i>
              </div>
              <div className="flex flex-column">
                <span className="text-500 text-xs font-bold uppercase">Total Entradas</span>
                <span className="text-xl font-bold text-green-600">+{totals.entries}</span>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-4">
            <div className="surface-card p-3 border-round-xl border-1 border-200 shadow-1 flex align-items-center gap-3">
              <div className="bg-orange-50 text-orange-600 p-3 border-round-lg">
                <i className="pi pi-arrow-up-right text-xl"></i>
              </div>
              <div className="flex flex-column">
                <span className="text-500 text-xs font-bold uppercase">Total Entregas</span>
                <span className="text-xl font-bold text-orange-600">-{totals.deliveries}</span>
              </div>
            </div>
          </div>
        </div>

        {/* INFO RANGO */}
        <div className="flex align-items-center gap-2 px-1">
          <i className="pi pi-calendar text-500"></i>
          <span className="text-500 text-sm font-medium">
            Período consultado:
            <b className="text-700 ml-1">
              {startDate ? new Date(startDate).toLocaleDateString() : "Desde el inicio"}
              <i className="pi pi-arrow-right mx-2 text-xs"></i>
              {endDate ? new Date(endDate).toLocaleDateString() : "Hasta hoy"}
            </b>
          </span>
        </div>

        {/* TABLA UNIFICADA */}
        <div className="surface-card border-round-xl shadow-2 overflow-hidden border-1 border-50">
          <DataTable
            value={movements}
            loading={loading}
            paginator
            rows={10}
            className="p-datatable-sm"
            emptyMessage="No se encontraron movimientos registrados."
            responsiveLayout="stack"
            breakpoint="768px"
            rowHover
            stripedRows
          >
            <Column header="TIPO" body={typeTemplate} style={{ width: '120px' }} />
            <Column field="documentNumber" header="DOCUMENTO" sortable className="font-bold text-700" />
            <Column header="CANTIDAD" body={quantityTemplate} align="center" sortable field="quantity" />
            <Column
              field="date"
              header="FECHA Y HORA"
              body={(r) => (
                <div className="text-xs">
                  <span className="block font-bold text-700">{new Date(r.date).toLocaleDateString()}</span>
                  <span className="text-500">{new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              sortable
            />
            <Column field="details" header="DETALLE / OBSERVACIÓN" className="text-sm text-600" />
            <Column header="USUARIO" body={userTemplate} />
          </DataTable>
        </div>
      </div>
    </Dialog>
  );
}

export default StockDetailDialog;
