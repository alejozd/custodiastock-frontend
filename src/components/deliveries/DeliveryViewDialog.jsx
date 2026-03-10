import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";

const DeliveryViewDialog = ({ visible, onHide, delivery }) => {
  if (!delivery) return null;

  const isCancelled = String(delivery.status).toUpperCase().includes("CANCEL");

  // Soporte para múltiples items o producto único (compatibilidad)
  const items =
    delivery.items ||
    (delivery.product
      ? [
          {
            product: delivery.product,
            quantity: delivery.quantity,
          },
        ]
      : []);

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

  // Función para obtener la inicial
  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "A");

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Comprobante de Entrega Digital"
      style={{ width: "min(95vw, 550px)" }}
      modal
      dismissableMask
      draggable={false}
    >
      <div className="delivery-details-container p-1">
        {/* ENCABEZADO TIPO TICKET */}
        <div className="surface-card border-1 border-200 border-round-xl p-4 mb-4 shadow-sm relative overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full w-1 ${isCancelled ? "bg-red-500" : "bg-green-500"}`}
          ></div>

          <div className="flex justify-content-between align-items-start mb-4">
            <div>
              <h3 className="m-0 text-900 font-bold line-height-2">
                {isCancelled ? "Entrega Anulada" : "Entrega Exitosa"}
              </h3>
              <Tag
                value={isCancelled ? "ANULADO" : "ACTIVO"}
                severity={isCancelled ? "danger" : "success"}
                className="mt-1"
              />
            </div>
            <div className="text-right">
              <span className="block text-500 text-xs font-bold uppercase">
                N° Entrega
              </span>
              <span className="text-xl font-bold text-primary">
                #{delivery.documentNumber || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex justify-content-between align-items-center bg-bluegray-50 p-3 border-round-lg">
            <span className="text-600 font-medium">
              Fecha y Hora de emisión:
            </span>
            <span className="text-900 font-bold">
              {formatDate(delivery.deliveryDate || delivery.createdAt)}
            </span>
          </div>
        </div>

        {/* TABLA DE PRODUCTOS MEJORADA */}
        <div className="mb-4">
          <div className="flex align-items-center gap-2 mb-2 px-1">
            <i className="pi pi-box text-primary"></i>
            <span className="font-bold text-800 uppercase text-sm">
              Detalle de Productos
            </span>
          </div>
          <DataTable
            value={items}
            size="small"
            className="p-datatable-sm border-1 border-100 border-round-lg overflow-hidden shadow-sm"
          >
            <Column
              header="Ref."
              body={(rowData) => (
                <span className="font-mono text-xs text-500 uppercase">
                  {rowData.product?.reference || "---"}
                </span>
              )}
              style={{ width: "20%" }}
            />
            <Column
              header="Descripción"
              body={(rowData) => (
                <span className="font-bold text-800">
                  {rowData.product?.name}
                </span>
              )}
            />
            <Column
              field="quantity"
              header="Cant."
              headerClassName="text-center"
              bodyClassName="text-center font-bold text-primary"
              style={{ width: "15%" }}
            />
          </DataTable>
        </div>

        {/* SECCIÓN DE ACTORES CON AVATAR */}
        <div className="surface-100 border-round-xl p-4">
          <div className="grid mb-4">
            <div className="col-6">
              <span className="block text-600 text-xs font-bold uppercase mb-2">
                Entregado por:
              </span>
              <div className="flex align-items-center gap-2">
                <Avatar
                  label={getInitial(delivery.deliveredBy?.fullName)}
                  shape="circle"
                  className=" font-bold"
                  style={{
                    backgroundColor: "#e0f2fe",
                    color: "#0369a1",
                  }}
                />
                <span className="text-900 font-semibold text-sm">
                  {delivery.deliveredBy?.fullName || "Admin"}
                </span>
              </div>
            </div>
            <div className="col-6 border-left-1 border-200 pl-3">
              <span className="block text-600 text-xs font-bold uppercase mb-2 text-right">
                Recibido por:
              </span>
              <div className="flex align-items-center justify-content-end gap-2 text-right">
                <span className="text-primary font-bold text-sm">
                  {delivery.receivedBy?.fullName}
                </span>
                <Avatar
                  label={getInitial(delivery.receivedBy?.fullName)}
                  shape="circle"
                  className="font-bold"
                  style={{
                    backgroundColor: "#f0fdf4",
                    color: "#15803d",
                  }}
                />
              </div>
            </div>
          </div>

          {!isCancelled && (
            <div className="mt-3">
              <div className="flex align-items-center justify-content-between mb-2">
                <span className="text-600 text-xs font-bold uppercase">
                  Firma del Receptor
                </span>
                <i className="pi pi-verified text-green-500"></i>
              </div>
              <div
                className="bg-white border-1 border-200 border-round-lg flex justify-content-center align-items-center p-3 shadow-inner"
                style={{ minHeight: "140px" }}
              >
                {delivery.signatureImage ? (
                  <Image
                    src={delivery.signatureImage}
                    alt="Firma Digital"
                    width="220px"
                    preview
                  />
                ) : (
                  <div className="text-center text-400">
                    <i className="pi pi-pencil text-2xl mb-2 opacity-50"></i>
                    <p className="m-0 italic text-xs">
                      Sin firma física capturada
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* INFO DE ANULACIÓN */}
        {isCancelled && (
          <div className="mt-4 p-3 border-round-lg bg-red-50 border-1 border-red-100">
            <div className="flex align-items-center gap-2 text-red-700 font-bold mb-2">
              <i className="pi pi-exclamation-circle"></i>
              <span className="text-sm">Registro de Anulación</span>
            </div>
            <div className="text-sm text-red-600 line-height-3">
              <p className="m-0">
                <strong>Motivo:</strong>{" "}
                {delivery.cancelReason || "No especificado"}
              </p>
              <p className="m-0 text-xs mt-1">
                <strong>Anulado por:</strong>{" "}
                {delivery.canceledBy?.fullName || "Admin"}
              </p>
            </div>
          </div>
        )}

        {/* PIE DE DIÁLOGO */}
        <div className="text-center mt-4">
          <small
            className="block text-400 mb-3 uppercase font-semibold"
            style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
          >
            Operación Segura: CS-{delivery.id}
          </small>
          <Button
            label="Cerrar Comprobante"
            severity="secondary"
            outlined
            onClick={onHide}
            className="w-full border-round-xl"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default DeliveryViewDialog;
