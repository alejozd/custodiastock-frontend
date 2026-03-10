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

  const formatLocalDate = (date, isEnd = false) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const time = isEnd ? "23:59:59" : "00:00:00";
    return `${year}-${month}-${day}T${time}`;
  };

  const loadMovements = async () => {
    if (!product || !visible) return;

    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = formatLocalDate(startDate);
      if (endDate) params.endDate = formatLocalDate(endDate, true);

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
      <span className={`font-bold ${isEntry ? 'text-green-600' : 'text-red-600'}`}>
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

  const dialogHeader = (
    <div className="flex align-items-center gap-3 p-2">
      <div className="bg-blue-100 p-2 border-round-circle flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
        <i className="pi pi-history text-blue-700 text-2xl"></i>
      </div>
      <span className="page-title text-3xl">
        Kárdex de Movimientos: <span className="text-900">{product?.name || ""}</span>
      </span>
    </div>
  );

  return (
    <Dialog
      header={dialogHeader}
      visible={visible}
      onHide={onHide}
      style={{ width: "90vw", maxWidth: '1000px' }}
      maximizable
      modal
      className="modern-dialog"
      footer={<Button label="Cerrar" icon="pi pi-times" text onClick={onHide} />}
    >
      <div className="flex flex-column gap-4 py-3 animate-fade-in">
        {/* ENCABEZADO RESUMEN KPI ESTILO COMPACTO Y COLOREADO */}
        <div className="grid">
          <div className="col-12 md:col-4">
            <div className="kpi-container shadow-1 kpi-blue h-full" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
              <div className="kpi-icon-circle bg-white shadow-1">
                <i className="pi pi-tag text-blue-600 text-xl font-bold"></i>
              </div>
              <div className="flex flex-column">
                <span className="kpi-label text-blue-700">Referencia</span>
                <div className="kpi-value text-blue-900" style={{ fontSize: '1.1rem' }}>{product?.reference || "N/A"}</div>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-4">
            <div className="kpi-container shadow-1 kpi-green h-full" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div className="kpi-icon-circle bg-white shadow-1">
                <i className="pi pi-arrow-down-left text-green-600 text-xl font-bold"></i>
              </div>
              <div className="flex flex-column">
                <span className="kpi-label text-green-700">Total Entradas</span>
                <div className="kpi-value text-green-700">+{totals.entries}</div>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-4">
            <div className="kpi-container shadow-1 kpi-orange h-full" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
              <div className="kpi-icon-circle bg-white shadow-1">
                <i className="pi pi-arrow-up-right text-orange-600 text-xl font-bold"></i>
              </div>
              <div className="flex flex-column">
                <span className="kpi-label text-orange-700">Total Entregas</span>
                <div className="kpi-value text-red-600">-{totals.deliveries}</div>
              </div>
            </div>
          </div>
        </div>

        {/* INFO RANGO */}
        <div className="flex align-items-center justify-content-center gap-2 px-3 py-2 surface-50 border-round-lg border-1 border-100">
          <i className="pi pi-calendar text-500"></i>
          <span className="text-500 text-xs font-bold uppercase" style={{ letterSpacing: '1px' }}>
            Rango de consulta:
            <b className="text-800 ml-2">
              {startDate ? new Date(startDate).toLocaleDateString() : "Inicio"}
              <i className="pi pi-arrow-right mx-3 text-xs text-400"></i>
              {endDate ? new Date(endDate).toLocaleDateString() : "Fin"}
            </b>
          </span>
        </div>

        {/* TABLA UNIFICADA */}
        <div className="surface-card border-round-xl shadow-2 overflow-hidden border-1 border-100">
          <DataTable
            value={movements}
            loading={loading}
            paginator
            rows={8}
            className="p-datatable-sm p-datatable-modern"
            emptyMessage="No se encontraron movimientos registrados."
            responsiveLayout="stack"
            breakpoint="768px"
            rowHover
          >
            <Column
                header="TIPO"
                body={typeTemplate}
                style={{ width: '140px' }}
            />
            <Column field="documentNumber" header="DOCUMENTO" sortable className="font-bold text-700" />
            <Column header="CANTIDAD" body={quantityTemplate} align="center" sortable field="quantity" style={{ width: '100px' }} />
            <Column
              field="date"
              header="FECHA Y HORA"
              body={(r) => {
                const d = new Date(r.date);
                return (
                    <div className="text-xs">
                    <span className="block font-bold text-700">{d.toLocaleDateString()}</span>
                    <span className="text-500">{d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                );
              }}
              sortable
            />
            <Column field="details" header="DETALLE / OBSERVACIÓN" className="text-sm text-600" />
            <Column header="USUARIO" body={userTemplate} style={{ width: '150px' }} />
          </DataTable>
        </div>
      </div>
    </Dialog>
  );
}

export default StockDetailDialog;
