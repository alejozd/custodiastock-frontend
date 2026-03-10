import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const EntryViewDialog = ({ visible, onHide, entry }) => {
  if (!entry) return null;

  const isCancelled = String(entry.status).toUpperCase().includes("CANCEL");

  // Soporte para múltiples items o producto único (compatibilidad)
  const items =
    entry.items ||
    (entry.product
      ? [
          {
            product: entry.product,
            quantity: entry.quantity,
          },
        ]
      : []);

  // Formateador de fecha reutilizable
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Detalle de Entrada de Inventario"
      style={{ width: "min(95vw, 550px)" }}
      modal
      dismissableMask
      draggable={false}
    >
      <div className="entry-details-container p-1">
        {/* ENCABEZADO PRINCIPAL */}
        <div className="surface-ground border-round-xl p-4 mb-4 border-1 border-100 shadow-sm">
          <div className="flex align-items-center justify-content-between mb-3">
            <div className="flex align-items-center gap-3">
              <div
                className={`flex align-items-center justify-content-center border-round-circle ${isCancelled ? "bg-red-100" : "bg-green-100"}`}
                style={{ width: "48px", height: "48px" }}
              >
                <i
                  className={`pi ${isCancelled ? "pi-ban text-red-600" : "pi-download text-green-600"} text-xl`}
                ></i>
              </div>
              <div>
                <h3 className="m-0 text-900 line-height-2">
                  {isCancelled ? "Entrada Anulada" : "Entrada Activa"}
                </h3>
                <Tag
                  value={isCancelled ? "ANULADO" : "ACTIVO"}
                  severity={isCancelled ? "danger" : "success"}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="text-right">
              <span className="block text-600 text-xs font-semibold uppercase mb-1">
                Documento
              </span>
              <span className="text-xl font-bold text-primary">
                #{entry.documentNumber || "N/A"}
              </span>
            </div>
          </div>

          <Divider className="my-3" />

          {/* GRILLA DE INFORMACIÓN RÁPIDA */}
          <div className="grid grid-nogutter">
            <div className="col-12 flex align-items-center justify-content-between mb-2">
              <span className="text-700 font-medium">
                <i className="pi pi-calendar mr-2 text-400"></i>Fecha y Hora:
              </span>
              <span className="text-900 font-semibold">
                {formatDate(entry.entryDate || entry.createdAt)}
              </span>
            </div>
            <div className="col-12 flex align-items-center justify-content-between">
              <span className="text-700 font-medium">
                <i className="pi pi-user mr-2 text-400"></i>Registrado por:
              </span>
              <span className="text-900 font-semibold">
                {entry.createdBy?.fullName ||
                  entry.createdBy?.username ||
                  "Sistema"}
              </span>
            </div>
          </div>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <div className="mb-4">
          <div className="flex align-items-center gap-2 mb-2 px-1">
            <i className="pi pi-box text-primary"></i>
            <span className="font-bold text-800">Productos Ingresados</span>
          </div>
          <DataTable
            value={items}
            size="small"
            className="p-datatable-sm border-1 border-100 border-round-lg overflow-hidden shadow-sm"
            responsiveLayout="stack"
          >
            <Column
              header="Descripción del Producto"
              body={(rowData) => (
                <div className="flex flex-column py-1">
                  <span className="font-bold text-800">
                    {rowData.product?.name}
                  </span>
                  <small className="text-500 font-medium">
                    {rowData.product?.reference}
                  </small>
                </div>
              )}
            />
            <Column
              field="quantity"
              header="Cant."
              headerClassName="text-center"
              bodyClassName="text-center font-bold text-primary"
              style={{ width: "6rem" }}
            />
          </DataTable>
        </div>

        {/* SECCIÓN DE ANULACIÓN (SÓLO SI APLICA) */}
        {isCancelled && (
          <div className="bg-red-50 border-left-3 border-red-500 p-3 mb-4 border-round-right-lg">
            <div className="flex align-items-center gap-2 mb-2 text-red-700 font-bold">
              <i className="pi pi-exclamation-triangle"></i>
              <span>Detalles de Anulación</span>
            </div>
            <div className="text-sm text-red-600 mb-2">
              <span className="font-semibold">Motivo:</span>{" "}
              {entry.cancelReason || entry.reason || "Sin motivo especificado"}
            </div>
            <div className="flex justify-content-between text-xs text-red-500 italic border-top-1 border-red-100 pt-2">
              <span>Por: {entry.canceledBy?.fullName || "N/A"}</span>
              <span>{formatDate(entry.canceledAt || entry.cancelledAt)}</span>
            </div>
          </div>
        )}

        {/* PIE DE DIÁLOGO */}
        <div className="flex flex-column align-items-center gap-3 mt-2">
          <small className="text-400">ID Interno de Registro: {entry.id}</small>
          <Button
            label="Cerrar Detalle"
            icon="pi pi-check"
            severity="secondary"
            onClick={onHide}
            className="w-full p-button-lg border-round-xl"
            text
          />
        </div>
      </div>
    </Dialog>
  );
};

export default EntryViewDialog;
