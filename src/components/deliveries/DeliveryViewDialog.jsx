import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Image } from 'primereact/image';

const DeliveryViewDialog = ({ visible, onHide, delivery }) => {
  if (!delivery) return null;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Comprobante de Entrega Digital"
      style={{ width: "min(95vw, 450px)" }}
      modal
      dismissableMask
    >
      <div className="p-2">
        <div className="surface-card border-1 border-200 border-round p-4 shadow-1">
          {/* Encabezado del Recibo */}
          <div className="text-center mb-4">
            <i className="pi pi-check-circle text-green-500 text-4xl mb-2"></i>
            <h3 className="m-0 text-900">Entrega Exitosa</h3>
            <small className="text-500 font-mono">
              ID: #{delivery.id}
            </small>
          </div>

          <Divider />

          {/* Información del Producto */}
          <div className="flex justify-content-between mb-2">
            <span className="text-600">Producto:</span>
            <span className="font-bold text-900">
              {delivery.product?.name}
            </span>
          </div>
          <div className="flex justify-content-between mb-3">
            <span className="text-600">Cantidad:</span>
            <span className="font-bold text-900">
              {delivery.quantity} unds.
            </span>
          </div>

          <Divider layout="horizontal" align="center">
            <span className="p-tag p-tag-info text-xs">ACTORES</span>
          </Divider>

          <div className="grid text-sm mb-3">
            <div className="col-6">
              <div className="text-600 mb-1 italic text-xs">
                Entregado por:
              </div>
              <div className="font-semibold">
                {delivery.deliveredBy?.fullName || "Admin"}
              </div>
            </div>
            <div className="col-6 text-right">
              <div className="text-600 mb-1 italic text-xs">
                Recibido por:
              </div>
              <div className="font-semibold text-primary">
                {delivery.receivedBy?.fullName}
              </div>
            </div>
          </div>

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

          <div className="text-center mt-4 pt-3 border-top-1 border-100">
            <small className="text-500 font-italic">
              Fecha: {new Date(delivery.createdAt).toLocaleString()}
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
