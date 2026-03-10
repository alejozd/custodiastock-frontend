import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Image } from "primereact/image";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";

const DeliveryViewDialog = ({ visible, onHide, delivery }) => {
  if (!delivery) return null;

  const isCancelled = String(delivery.status).toUpperCase().includes("CANCEL");

  // Soporte para múltiples items o producto único (compatibilidad)
  const items = delivery.items || (delivery.product ? [{
    product: delivery.product,
    quantity: delivery.quantity
  }] : []);

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Comprobante de Entrega Digital"
      style={{ width: "min(95vw, 600px)" }}
      modal
      dismissableMask
    >
      <div className="p-2">
        <div className="surface-card border-1 border-200 border-round p-4 shadow-1">
          {/* Encabezado del Recibo */}
          <div className="text-center mb-4">
            <i className={`pi ${isCancelled ? 'pi-ban text-red-500' : 'pi-check-circle text-green-500'} text-4xl mb-2`}></i>
            <h3 className="m-0 text-900">{isCancelled ? "Entrega Anulada" : "Entrega Exitosa"}</h3>
          </div>

          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="flex flex-column gap-1 mb-2">
                <span className="text-600 text-sm">N° Documento:</span>
                <span className="font-bold text-primary">
                  {delivery.documentNumber || "N/A"}
                </span>
              </div>
              <div className="flex flex-column gap-1 mb-2">
                <span className="text-600 text-sm">Estado:</span>
                <div className="flex justify-content-start">
                    <Tag
                    value={isCancelled ? "ANULADO" : "ACTIVO"}
                    severity={isCancelled ? "danger" : "success"}
                    />
                </div>
              </div>
            </div>
            <div className="col-12 md:col-6">
              <div className="flex flex-column gap-1 mb-2">
                <span className="text-600 text-sm">Fecha y Hora:</span>
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-calendar text-500"></i>
                    <span className="font-semibold text-900">
                    {new Date(delivery.deliveryDate || delivery.createdAt).toLocaleString('es-CO', {
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
          </div>

          <Divider layout="horizontal" align="center">
            <span className="p-tag p-tag-secondary text-xs">PRODUCTOS</span>
          </Divider>

          {/* Información de los Productos */}
          <DataTable value={items} size="small" className="mb-3 shadow-1 border-round overflow-hidden border-1 border-100">
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
            <span className="p-tag p-tag-info text-xs">ACTORES</span>
          </Divider>

          <div className="grid text-sm mb-3">
            <div className="col-6">
              <div className="text-600 mb-1 italic text-xs">Entregado por:</div>
              <div className="font-semibold">
                {delivery.deliveredBy?.fullName || "Admin"}
              </div>
            </div>
            <div className="col-6 text-right">
              <div className="text-600 mb-1 italic text-xs">Recibido por:</div>
              <div className="font-semibold text-primary">
                {delivery.receivedBy?.fullName}
              </div>
            </div>
          </div>

          {!isCancelled && (
            <div className="text-center mt-4">
              <div className="text-600 mb-2 italic text-xs">
                Firma del Receptor:
              </div>
              <div
                className="border-1 border-100 border-round surface-50 flex justify-content-center align-items-center p-2"
                style={{ minHeight: "150px" }}
              >
                {delivery.signatureImage ? (
                  <Image
                    src={delivery.signatureImage}
                    alt="Firma Digital"
                    width="100%"
                    preview
                    className="signature-img-rendered"
                  />
                ) : (
                  <div className="flex flex-column align-items-center text-400">
                    <i className="pi pi-eye-slash text-2xl mb-2"></i>
                    <span className="italic">Sin firma registrada</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="mt-3 p-3 bg-red-50 border-round border-1 border-red-100">
               <div className="text-red-700 font-bold mb-1 text-sm">Información de Cancelación:</div>
               <div className="text-red-600 text-xs italic">
                 Cancelado por: {delivery.canceledBy?.fullName || "Admin"}
               </div>
               <div className="text-red-600 text-sm mt-1">
                 Motivo: {delivery.cancelReason || "Sin motivo especificado"}
               </div>
            </div>
          )}

          <div className="text-center mt-4 pt-3 border-top-1 border-100">
            <small className="text-500 font-italic">
              Fecha de creación: {new Date(delivery.createdAt).toLocaleString()}
            </small>
          </div>
        </div>

        <div className="flex justify-content-center mt-4">
          <Button
            label="Cerrar Comprobante"
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

export default DeliveryViewDialog;
