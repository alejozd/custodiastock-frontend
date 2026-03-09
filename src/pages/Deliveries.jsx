import { useEffect, useRef, useState } from "react";
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

import DeliveryViewDialog from "../components/deliveries/DeliveryViewDialog";
import DeliveryCancelDialog from "../components/deliveries/DeliveryCancelDialog";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import "../styles/Deliveries.css";

const toList = (response) => response.data?.data ?? response.data ?? [];

function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
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
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [selectedView, setSelectedView] = useState(null);

  const toast = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const response = await api.get("/deliveries", { params });
      setDeliveries(toList(response));
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar las entregas, " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start);
    setEndDate(end);
    setActiveRange(days);
    setTimeout(() => loadDeliveries(), 10);
  };

  const clearFilters = () => {
    // 1. Resetear estados visuales y de fecha
    setStartDate(null);
    setEndDate(null);
    setGlobalFilterValue("");
    setActiveRange(null);

    // 2. Resetear el filtro interno de la DataTable
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    // 3. Forzar la carga de datos sin parámetros (esto traerá todo)
    setLoading(true);
    api
      .get("/deliveries")
      .then((response) => {
        setDeliveries(toList(response));
      })
      .catch((error) => {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudo restablecer el listado, " + error.message,
        });
      })
      .finally(() => setLoading(false));
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
    if (s.includes("PENDING"))
      return { label: "PENDIENTE", severity: "warning" };
    return { label: "ACTIVO", severity: "success" };
  };

  // --- Templates de la Tabla ---
  const documentTemplate = (row) => (
    <span className="font-bold text-blue-700">
      {row.documentNumber || `ENT-${String(row.id).padStart(6, "0")}`}
    </span>
  );

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

  const productsSummaryTemplate = (row) => {
    // Si la entrega tiene un array de items, mostramos el conteo, sino el producto único
    const itemsCount = row.items?.length || 1;
    const firstProduct =
      row.items?.[0]?.product?.name || row.product?.name || "Producto";

    return (
      <div className="flex flex-column">
        <span className="text-900 font-medium">
          {itemsCount > 1
            ? `${firstProduct} y ${itemsCount - 1} más...`
            : firstProduct}
        </span>
        <small className="text-500">{itemsCount} item(s) en total</small>
      </div>
    );
  };

  const responsibleTemplate = (row) => (
    <div className="flex flex-column gap-2">
      <div className="flex align-items-center gap-2">
        <Avatar
          label={(row.deliveredBy?.fullName || "A").charAt(0)}
          shape="circle"
          style={{
            backgroundColor: "#e0f2fe",
            color: "#0369a1",
            width: "22px",
            height: "22px",
            fontSize: "0.7rem",
          }}
        />
        <span className="text-xs">
          <b>De:</b> {row.deliveredBy?.fullName || "Sistema"}
        </span>
      </div>
      <div className="flex align-items-center gap-2">
        <Avatar
          label={(row.receivedBy?.fullName || "U").charAt(0)}
          shape="circle"
          style={{
            backgroundColor: "#f0fdf4",
            color: "#15803d",
            width: "22px",
            height: "22px",
            fontSize: "0.7rem",
          }}
        />
        <span className="text-xs">
          <b>Para:</b> {row.receivedBy?.fullName || "Usuario"}
        </span>
      </div>
    </div>
  );

  const actionTemplate = (row) => (
    <div className="flex gap-1 justify-content-end">
      <Button
        icon="pi pi-eye"
        text
        rounded
        severity="info"
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
        disabled={String(row.status).toUpperCase().includes("CANCEL")}
        onClick={() => {
          setSelectedDelivery(row);
          setDialogVisible(true);
        }}
      />
    </div>
  );

  return (
    <div className="deliveries-bg p-4 animate-fade-in surface-50">
      <Toast ref={toast} />

      <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-900 m-0">
            Historial de Entregas
          </h1>
          <p className="text-500 text-sm">
            Registro detallado de movimientos y firmas
          </p>
        </div>
        <Button
          label="Nueva Entrega"
          icon="pi pi-plus"
          className="p-button-sm shadow-1"
          onClick={() => navigate("/nueva-entrega")}
        />
      </div>

      {/* SECCIÓN DE KPIs MICRO */}
      <div className="grid mb-2">
        <div className="col-12 md:col-4">
          <div className="kpi-container shadow-1 kpi-blue">
            <div className="kpi-icon-circle">
              <i className="pi pi-box text-blue-500 text-lg"></i>
            </div>
            <div>
              <span className="kpi-label">Total Entregas</span>
              <div className="kpi-value">{deliveries.length}</div>
            </div>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="kpi-container shadow-1 kpi-green">
            <div className="kpi-icon-circle">
              <i className="pi pi-check-circle text-green-500 text-lg"></i>
            </div>
            <div>
              <span className="kpi-label">Activos</span>
              <div className="kpi-value">
                {
                  deliveries.filter((d) => !String(d.status).includes("CANCEL"))
                    .length
                }
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="kpi-container shadow-1 kpi-orange">
            <div className="kpi-icon-circle">
              <i className="pi pi-calendar text-orange-500 text-lg"></i>
            </div>
            <div>
              <span className="kpi-label">Hoy</span>
              <div className="kpi-value">
                {
                  deliveries.filter(
                    (d) =>
                      new Date(d.deliveryDate || d.createdAt).toDateString() ===
                      new Date().toDateString(),
                  ).length
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS REDISEÑADA */}
      <div className="surface-card p-3 border-round-lg shadow-1 mb-3">
        <div className="flex flex-column gap-3">
          {/* PRIMERA FILA: BUSCADOR Y BOTONES DE ACCIÓN */}
          <div className="flex flex-column md:flex-row gap-2">
            <div className="flex-1">
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText
                  placeholder="Buscar documento, producto o responsable..."
                  className="p-inputtext-sm w-full bg-light border-100"
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
                onClick={loadDeliveries}
                loading={loading}
              />
              <Button
                icon="pi pi-filter-slash"
                outlined
                severity="secondary"
                className="p-button-sm flex-shrink-0"
                onClick={clearFilters}
                tooltip="Limpiar todo"
              />
            </div>
          </div>

          {/* SEGUNDA FILA: FILTROS RÁPIDOS Y CALENDARIOS */}
          <div className="flex flex-column lg:flex-row justify-content-between align-items-start lg:align-items-center gap-3 pt-2 border-top-1 border-100">
            {/* Filtros rápidos (Lado izquierdo) */}
            <div className="flex align-items-center gap-2">
              <span className="text-xs font-bold text-500 mr-2 uppercase">
                Histórico:
              </span>
              <Button
                label="15d"
                className={`p-button-text p-button-sm btn-filter-15 ${activeRange === 15 ? "active-filter" : ""}`}
                onClick={() => setQuickRange(15)}
              />
              <Button
                label="30d"
                className={`p-button-text p-button-sm btn-filter-30 ${activeRange === 30 ? "active-filter" : ""}`}
                onClick={() => setQuickRange(30)}
              />
              <Button
                label="90d"
                className={`p-button-text p-button-sm btn-filter-90 ${activeRange === 90 ? "active-filter" : ""}`}
                onClick={() => setQuickRange(90)}
              />
            </div>

            {/* Rango de fechas (Lado derecho) */}
            <div className="flex flex-wrap align-items-center gap-2 w-full lg:w-auto">
              <span className="text-xs font-bold text-500 uppercase mr-1">
                Rango Personalizado:
              </span>
              <div className="calendar-filter">
                <Calendar
                  value={startDate}
                  onChange={(e) => setStartDate(e.value)}
                  placeholder="Desde"
                  showIcon
                  dateFormat="dd/mm/yy"
                  className="p-inputtext-sm"
                  inputClassName="w-8rem" // Ancho fijo para que no salte
                />
              </div>
              <div className="calendar-filter">
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
      </div>

      <div className="surface-card border-round-lg shadow-2">
        <DataTable
          value={deliveries}
          loading={loading}
          paginator
          rows={10}
          className="p-datatable-sm"
          filters={filters}
        >
          <Column
            header="DOCUMENTO"
            body={documentTemplate}
            style={{ width: "12rem" }}
            sortable
          />
          <Column header="CONTENIDO" body={productsSummaryTemplate} />
          <Column header="RESPONSABLES" body={responsibleTemplate} />
          <Column
            header="ESTADO"
            body={(r) => (
              <Tag
                value={getStatusInfo(r.status).label}
                severity={getStatusInfo(r.status).severity}
              />
            )}
          />
          <Column
            header="FECHA Y HORA"
            body={(r) => {
              if (!r.deliveryDate) return "-";
              return (
                <div className="text-xs font-medium">
                  {new Date(r.deliveryDate).toLocaleString("es-CO", {
                    timeZone: "America/Bogota", // Esto fuerza a que siempre use la hora de Colombia
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
