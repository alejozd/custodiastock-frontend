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
  const items = entry.items || (entry.product ? [{
    product: entry.product,
    quantity: entry.quantity
  }] : []);

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Detalle de Entrada de Inventario"
      style={{ width: "min(95vw, 600px)" }}
      modal
      dismissableMask
    >
      <div className="p-2">
        <div className="surface-card border-1 border-200 border-round p-4 shadow-1">
          <div className="text-center mb-4">
            <i className={`pi ${isCancelled ? 'pi-ban text-red-500' : 'pi-download text-green-500'} text-4xl mb-2`}></i>
            <h3 className="m-0 text-900">{isCancelled ? "Entrada Anulada" : "Entrada Activa"}</h3>
          </div>

          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="flex justify-content-between mb-2">
                <span className="text-600">N° Documento:</span>
                <span className="font-bold text-primary">
                  {entry.documentNumber || "N/A"}
                </span>
              </div>
              <div className="flex justify-content-between mb-2">
                <span className="text-600">Estado:</span>
                <Tag
                  value={isCancelled ? "ANULADO" : "ACTIVO"}
                  severity={isCancelled ? "danger" : "success"}
                />
              </div>
            </div>
            <div className="col-12 md:col-6">
              <div className="flex justify-content-between mb-2">
                <span className="text-600">Fecha:</span>
                <span className="font-bold text-900">
                  {new Date(entry.entryDate || entry.createdAt).toLocaleString('es-CO', {
                    hour12: true,
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          <Divider layout="horizontal" align="center">
            <span className="p-tag p-tag-secondary text-xs">PRODUCTOS</span>
          </Divider>

          <DataTable value={items} size="small" className="mb-3">
            <Column
              header="Producto"
              body={(rowData) => (
                <div className="flex flex-column">
                  <span className="font-medium">{rowData.product?.name}</span>
                  <small className="text-500">{rowData.product?.reference}</small>
                </div>
              )}
            />
            <Column field="quantity" header="Cant." style={{ width: '4rem' }} />
          </DataTable>

          <Divider layout="horizontal" align="center">
            <span className="p-tag p-tag-info text-xs">REGISTRO</span>
          </Divider>

          <div className="mb-3">
            <div className="text-600 mb-1 italic text-xs">Registrado por:</div>
            <div className="font-semibold text-primary">
              {entry.createdBy?.fullName || entry.createdBy?.username || "Sistema"}
            </div>
          </div>

          {isCancelled && (
            <>
              <Divider layout="horizontal" align="center">
                <span className="p-tag p-tag-danger text-xs">ANULACIÓN</span>
              </Divider>
              <div className="flex justify-content-between mb-2">
                <span className="text-600">Fecha Anulación:</span>
                <span className="font-bold text-900">
                  {(entry.canceledAt || entry.cancelledAt) ? new Date(entry.canceledAt || entry.cancelledAt).toLocaleString('es-CO', {
                    hour12: true,
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : "N/A"}
                </span>
              </div>
              <div className="flex justify-content-between mb-2">
                <span className="text-600">Anulado por:</span>
                <span className="font-bold text-900">
                  {entry.canceledBy?.fullName || entry.cancelledBy?.fullName || "N/A"}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-600 mb-1 italic text-xs">Motivo:</div>
                <div className="p-2 bg-red-50 border-round text-red-700 text-sm">
                  {entry.cancelReason || entry.reason || "Sin motivo especificado"}
                </div>
              </div>
            </>
          )}

          <div className="text-center mt-4 pt-3 border-top-1 border-100">
            <small className="text-500 font-italic">
              ID de registro: {entry.id}
            </small>
          </div>
        </div>

        <div className="flex justify-content-center mt-4">
          <Button
            label="Cerrar"
            severity="secondary"
            outlined
            onClick={onHide}
            className="w-full"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default EntryViewDialog;
