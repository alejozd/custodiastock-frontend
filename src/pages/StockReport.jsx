import { useEffect, useRef, useState } from "react";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Toast } from "primereact/toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import productService from "../services/productService";
import StockDetailDialog from "../components/products/StockDetailDialog";

function StockReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeRange, setActiveRange] = useState(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [onlyWithMovement, setOnlyWithMovement] = useState(false);

  const toast = useRef(null);
  const dt = useRef(null);

  const loadReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const data = await productService.getStockReport(params);
      setReportData(data);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar el reporte de stock, " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start);
    setEndDate(end);
    setActiveRange(days);
    setTimeout(() => loadReport(), 10);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setGlobalFilterValue("");
    setActiveRange(null);
    setOnlyWithMovement(false);
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    setTimeout(() => loadReport(), 10);
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const filteredData = onlyWithMovement
    ? reportData.filter((item) => item.totalEntries > 0 || item.totalDeliveries > 0)
    : reportData;

  const exportExcel = () => {
    const dataToExport = filteredData.map(item => ({
        "Producto": item.name,
        "Referencia": item.reference,
        "Entradas": item.totalEntries,
        "Entregas": item.totalDeliveries,
        "Stock": item.stock
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    saveAs(data, `Reporte_Stock_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const productTemplate = (row) => (
    <div className="flex flex-column">
      <span className="text-900 font-medium">{row.name}</span>
      <small className="text-500">{row.reference}</small>
    </div>
  );

  const stockTemplate = (row) => {
    const stock = row.stock;
    let color = "var(--cs-text)";
    if (stock > 0) color = "var(--cs-success)";
    else if (stock < 0) color = "var(--cs-danger)";

    return (
      <span className="font-bold" style={{ color }}>
        {stock}
      </span>
    );
  };

  const actionTemplate = (row) => (
    <div className="flex justify-content-center">
      <Button
        icon="pi pi-list"
        text
        rounded
        severity="info"
        tooltip="Ver movimientos"
        onClick={() => {
          setSelectedProduct(row);
          setDetailVisible(true);
        }}
      />
    </div>
  );

  return (
    <div className="p-4 animate-fade-in surface-50 min-h-screen">
      <Toast ref={toast} />

      <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="m-0 page-title">Reporte de Stock</h1>
          <p className="text-500 text-sm">
            Consulta de entradas, entregas y existencias por producto
          </p>
        </div>
        <Button
          label="Exportar"
          icon="pi pi-file-excel"
          severity="secondary"
          className="p-button-sm shadow-1"
          onClick={exportExcel}
          disabled={filteredData.length === 0}
        />
      </div>

      <div className="surface-card p-3 border-round-lg shadow-1 mb-3">
        <div className="flex flex-column gap-3">
          <div className="flex flex-column md:flex-row gap-2">
            <div className="flex-1">
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText
                  placeholder="Buscar por nombre o referencia..."
                  className="p-inputtext-sm w-full"
                  value={globalFilterValue}
                  onChange={onGlobalFilterChange}
                />
              </IconField>
            </div>
            <div className="flex gap-2 align-items-center">
              <Button
                icon={`pi ${onlyWithMovement ? 'pi-check-circle' : 'pi-circle'}`}
                label="Solo con movimiento"
                className={`p-button-sm ${onlyWithMovement ? 'p-button-info' : 'p-button-outlined p-button-secondary'}`}
                onClick={() => setOnlyWithMovement(!onlyWithMovement)}
                tooltip="Mostrar solo productos con entradas o entregas"
              />
              <Button
                icon="pi pi-filter"
                label="Filtrar"
                className="p-button-sm"
                onClick={loadReport}
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
              <span className="text-xs font-bold text-500 uppercase">Rápido:</span>
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
              <span className="text-xs font-bold text-500 uppercase">Rango:</span>
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
          ref={dt}
          value={filteredData}
          loading={loading}
          paginator
          rows={10}
          className="p-datatable-sm"
          filters={filters}
          globalFilterFields={["name", "reference"]}
          emptyMessage="No se encontraron datos para el reporte."
          responsiveLayout="stack"
          breakpoint="960px"
        >
          <Column header="PRODUCTO" body={productTemplate} sortable field="name" />
          <Column field="totalEntries" header="ENTRADAS" sortable align="center" />
          <Column field="totalDeliveries" header="ENTREGAS" sortable align="center" />
          <Column header="STOCK" body={stockTemplate} sortable field="stock" align="center" />
          <Column header="ACCIONES" body={actionTemplate} align="center" style={{ width: '8rem' }} />
        </DataTable>
      </div>

      <StockDetailDialog
        visible={detailVisible}
        onHide={() => setDetailVisible(false)}
        product={selectedProduct}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}

export default StockReport;
