import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";

import EntryViewDialog from "../components/entries/EntryViewDialog";
import EntryCancelDialog from "../components/entries/EntryCancelDialog";
import entryService from "../services/entryService";
import { useAuditableListPage } from "../hooks/useAuditableListPage";
import { getAvatarColor } from "../utils/avatarColors";
import "../styles/Entries.css";

function Entries() {
  const navigate = useNavigate();

  const {
    toast,
    items: entries,
    loading,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    activeRange,
    filters,
    globalFilterValue,
    setQuickRange,
    clearFilters,
    onGlobalFilterChange,
    load: loadEntries,
    dialogVisible,
    setDialogVisible,
    cancelReason,
    setCancelReason,
    selectedItem: selectedEntry,
    setSelectedItem: setSelectedEntry,
    viewDialogVisible,
    setViewDialogVisible,
    selectedView,
    setSelectedView,
    submitCancel,
  } = useAuditableListPage({
    fetchList: entryService.getEntries,
    cancelItem: entryService.cancelEntry,
    getLoadErrorMessage: (error) =>
      "No se pudieron cargar las entradas, " + error.message,
    cancelReasonRequiredMessage:
      "Debes ingresar un motivo para la anulación.",
    cancelSuccessSummary: "Entrada anulada",
    getCancelSuccessDetail: (entry) =>
      `La entrada #${entry.id} ha sido anulada con éxito.`,
    cancelErrorFallback: "No se pudo anular la entrada.",
  });

  const getStatusInfo = (status) => {
    const s = String(status).toUpperCase();
    if (s.includes("CANCEL")) return { label: "ANULADO", severity: "danger" };
    return { label: "ACTIVO", severity: "success" };
  };

  const documentTemplate = (row) => {
    const itemsCount = row.items?.length || (row.product ? 1 : 0);
    const firstProduct = row.items?.[0]?.product?.name || row.product?.name || "N/A";

    return (
      <div className="flex flex-column w-full">
        <div className="flex justify-content-between align-items-center">
          <span className="font-bold text-green-700" style={{ fontSize: '1.1rem' }}>
            {row.documentNumber || `ENT-${String(row.id).padStart(6, "0")}`}
          </span>
          <Tag
              value={getStatusInfo(row.status).label}
              severity={getStatusInfo(row.status).severity}
              className="mobile-only"
              style={{ fontSize: '0.65rem' }}
          />
        </div>
        <div className="mobile-only mt-2">
          <div className="flex flex-column gap-1">
            <span className="text-900 font-bold">
              {itemsCount > 1 ? `${firstProduct} y ${itemsCount - 1} más...` : firstProduct}
            </span>
            <div className="flex justify-content-between align-items-center">
              <small className="text-600">Total ítems: <b>{itemsCount}</b></small>
              <small className="text-500">
                  {new Date(row.entryDate || row.createdAt).toLocaleDateString()}
              </small>
            </div>
          </div>
        </div>
        <small className="text-600 font-medium hidden md:block">Comprobante de Entrada</small>
      </div>
    );
  };

  const productsSummaryTemplate = (row) => {
    const itemsCount = row.items?.length || (row.product ? 1 : 0);
    const firstProduct = row.items?.[0]?.product?.name || row.product?.name || "N/A";

    return (
      <div className="flex flex-column md:text-left text-right w-full md:w-auto">
        <span className="text-900 font-medium">
          {itemsCount > 1
            ? `${firstProduct} y ${itemsCount - 1} más...`
            : firstProduct}
        </span>
        <small className="text-500">{itemsCount} ítem(s) en total</small>
      </div>
    );
  };

  const userTemplate = (row) => {
    const userName =
      row.createdBy?.fullName || row.createdBy?.username || "Sistema";
    const avatarColor = getAvatarColor
      ? getAvatarColor(userName)
      : { bg: "#e0f2fe", text: "#0369a1" };

    return (
      <div className="flex align-items-center gap-2 md:justify-content-start justify-content-end w-full md:w-auto">
        <Avatar
          label={userName.charAt(0)}
          shape="circle"
          style={{
            backgroundColor: avatarColor.bg,
            color: avatarColor.text,
            width: "24px",
            height: "24px",
            fontSize: "0.75rem",
          }}
        />
        <span className="text-sm font-medium">{userName}</span>
      </div>
    );
  };

  const actionTemplate = (row) => (
    <div className="flex gap-1 md:justify-content-end justify-content-center w-full md:w-auto">
      <Button
        icon="pi pi-eye"
        text
        rounded
        severity="info"
        tooltip="Ver detalle"
        tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
        onClick={() => {
          setSelectedView(row);
          setViewDialogVisible(true);
        }}
      />
      <Button
        icon="pi pi-ban"
        text
        rounded
        severity="danger"
        tooltip="Anular"
        tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
        disabled={String(row.status).toUpperCase().includes("CANCEL")}
        onClick={() => {
          setSelectedEntry(row);
          setDialogVisible(true);
        }}
      />
    </div>
  );

  return (
    <div className="p-4 animate-fade-in surface-50 min-h-screen">
      <Toast ref={toast} />

      <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="m-0 page-title">Historial de Entradas</h1>
          <p className="text-500 text-sm">
            Registro de ingresos de mercancía al inventario
          </p>
        </div>
        <Button
          icon="pi pi-plus"
          severity="success"
          className="p-button-sm shadow-1"
          onClick={() => navigate("/nueva-entrada")}
        >
          <span className="hidden md:inline ml-2">Nueva Entrada</span>
        </Button>
      </div>

      <div className="surface-card p-3 border-round-lg shadow-1 mb-3">
        <div className="flex flex-column gap-3">
          <div className="flex flex-column md:flex-row gap-2">
            <div className="flex-1">
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText
                  placeholder="Buscar documento, producto o usuario..."
                  className="p-inputtext-sm w-full"
                  value={globalFilterValue}
                  onChange={onGlobalFilterChange}
                />
              </IconField>
            </div>
            <div className="flex gap-2">
              <Button
                icon="pi pi-filter"
                label="Filtrar"
                className="p-button-sm"
                onClick={loadEntries}
                loading={loading}
              />
              <Button
                icon="pi pi-filter-slash"
                outlined
                severity="secondary"
                className="p-button-sm"
                onClick={clearFilters}
              />
            </div>
          </div>

          <div className="flex flex-column lg:flex-row justify-content-between align-items-start lg:align-items-center gap-3 pt-2 border-top-1 border-100">
            <div className="flex align-items-center gap-2">
              <span className="text-xs font-bold text-500 uppercase">
                Rápido:
              </span>
              {[15, 30, 90].map((days) => (
                <Button
                  key={days}
                  label={`${days}d`}
                  text
                  className={`p-button-sm btn-filter-${days} ${activeRange === days ? "active-filter" : ""}`}
                  onClick={() => setQuickRange(days)}
                />
              ))}
            </div>

            <div className="flex flex-wrap align-items-center gap-2 w-full lg:w-auto">
              <span className="text-xs font-bold text-500 uppercase">
                Rango:
              </span>
              <Calendar
                value={startDate}
                onChange={(e) => setStartDate(e.value)}
                placeholder="Desde"
                showIcon
                dateFormat="dd/mm/yy"
                className="p-inputtext-sm"
                inputClassName="w-8rem"
              />
              <Calendar
                value={endDate}
                onChange={(e) => setEndDate(e.value)}
                placeholder="Hasta"
                showIcon
                dateFormat="dd/mm/yy"
                className="p-inputtext-sm"
                inputClassName="w-8rem"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card border-round-lg shadow-2">
        <DataTable
          value={entries}
          loading={loading}
          paginator
          rows={10}
          className="p-datatable-sm"
          filters={filters}
          globalFilterFields={[
            "documentNumber",
            "sourceDocument",
            "items.product.name",
            "items.product.reference",
            "product.name",
            "product.reference",
            "createdBy.fullName",
            "createdBy.username",
          ]}
          emptyMessage="No se encontraron registros de entradas."
          responsiveLayout="stack"
          breakpoint="960px"
        >
          <Column
            field="documentNumber"
            header="DOCUMENTO"
            body={documentTemplate}
            sortable
          />
          <Column
            field="sourceDocument"
            header="DOC. ORIGEN"
            className="mobile-hidden"
            sortable
          />
          <Column header="PRODUCTOS" body={productsSummaryTemplate} className="mobile-hidden" />
          <Column header="REGISTRADO POR" body={userTemplate} className="mobile-hidden" />
          <Column
            header="ESTADO"
            className="mobile-hidden"
            body={(r) => (
              <div className="flex md:justify-content-start justify-content-end w-full md:w-auto">
                <Tag
                    value={getStatusInfo(r.status).label}
                    severity={getStatusInfo(r.status).severity}
                />
              </div>
            )}
            sortable
            field="status"
          />
          <Column
            field="entryDate"
            header="FECHA"
            className="mobile-hidden"
            body={(r) => {
              const date = new Date(r.entryDate || r.createdAt);
              return (
                <div className="text-xs font-medium md:text-left text-right w-full md:w-auto">
                  {date.toLocaleString("es-CO", {
                    hour12: true,
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              );
            }}
            sortable
          />
          <Column header="ACCIONES" body={actionTemplate} align="right" />
        </DataTable>
      </div>

      <EntryViewDialog
        visible={viewDialogVisible}
        onHide={() => setViewDialogVisible(false)}
        entry={selectedView}
      />
      <EntryCancelDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        entry={selectedEntry}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        onCancel={submitCancel}
        loading={loading}
      />
    </div>
  );
}

export default Entries;
