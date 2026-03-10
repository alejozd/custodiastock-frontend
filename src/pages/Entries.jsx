import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FilterMatchMode } from "primereact/api";
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
import { useAuth } from "../context/AuthContext";
import { getAvatarColor } from "../utils/avatarColors";
import "../styles/Entries.css";

function Entries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeRange, setActiveRange] = useState(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [selectedView, setSelectedView] = useState(null);

  const toast = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      // Se formatean las fechas a ISO strings si existen
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const data = await entryService.getEntries(params);
      setEntries(data);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar las entradas, " + error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start);
    setEndDate(end);
    setActiveRange(days);
    setTimeout(() => loadEntries(), 10);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setGlobalFilterValue("");
    setActiveRange(null);
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    // Use setTimeout to ensure state updates are applied before reload
    setTimeout(() => loadEntries(), 10);
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const getStatusInfo = (status) => {
    const s = String(status).toUpperCase();
    if (s.includes("CANCEL")) return { label: "ANULADO", severity: "danger" };
    return { label: "ACTIVO", severity: "success" };
  };

  const documentTemplate = (row) => (
    <div className="flex flex-column w-full">
      <span className="font-bold text-green-700" style={{ fontSize: '1.1rem' }}>
        {row.documentNumber || `ENT-${String(row.id).padStart(6, "0")}`}
      </span>
      <small className="text-600 font-medium md:hidden">Comprobante de Entrada</small>
    </div>
  );

  const productTemplate = (row) => (
    <div className="flex flex-column md:text-left text-right w-full md:w-auto">
      <span className="text-900 font-medium">{row.product?.name}</span>
      <small className="text-500">{row.product?.reference}</small>
    </div>
  );

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

  const submitCancel = async () => {
    if (!selectedEntry || !currentUser) return;

    if (!cancelReason.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Atención",
        detail: "Debes ingresar un motivo para la anulación.",
        life: 5000,
      });
      return;
    }

    try {
      setLoading(true);
      await entryService.cancelEntry(selectedEntry.id, {
        adminUserId: currentUser.id,
        reason: cancelReason,
      });

      toast.current?.show({
        severity: "success",
        summary: "Entrada anulada",
        detail: `La entrada #${selectedEntry.id} ha sido anulada con éxito.`,
        life: 5000,
      });

      setDialogVisible(false);
      setSelectedEntry(null);
      setCancelReason("");
      loadEntries();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message || "No se pudo anular la entrada.",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
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
          label="Nueva Entrada"
          icon="pi pi-plus"
          severity="success"
          className="p-button-sm shadow-1"
          onClick={() => navigate("/nueva-entrada")}
        />
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
          <Column header="PRODUCTO" body={productTemplate} />
          <Column
            field="quantity"
            header="CANTIDAD"
            sortable
            body={(row) => (
                <div className="md:text-center text-right w-full md:w-auto font-bold md:font-normal">
                    {row.quantity}
                </div>
            )}
          />
          <Column header="REGISTRADO POR" body={userTemplate} />
          <Column
            header="ESTADO"
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
