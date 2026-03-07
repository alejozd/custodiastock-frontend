import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';

const DeliveryCancelDialog = ({ visible, onHide, delivery, cancelReason, setCancelReason, onCancel, loading }) => {
  return (
    <Dialog
      visible={visible}
      header={
        <div className="flex align-items-center gap-2 text-red-600">
          <i className="pi pi-exclamation-triangle text-xl"></i>
          <span>¿Anular Entrega #{delivery?.id}?</span>
        </div>
      }
      onHide={onHide}
      style={{ width: "min(95vw, 30rem)" }}
      modal
      footer={
        <div className="flex justify-content-end gap-2 p-3">
          <Button
            label="No, volver"
            icon="pi pi-times"
            text
            severity="secondary"
            onClick={onHide}
          />
          <Button
            label="Sí, Cancelar Entrega"
            icon="pi pi-check"
            severity="danger"
            loading={loading}
            onClick={onCancel}
          />
        </div>
      }
    >
      <div className="flex flex-column gap-3 pt-2">
        <p className="m-0 text-700">
          Estás a punto de anular esta entrega. Por favor, explica brevemente
          el motivo para el registro:
        </p>
        <InputTextarea
          id="cancelReason"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          rows={3}
          autoResize
          className="w-full"
          placeholder="Ej: Error en los datos del receptor..."
          autoFocus
        />
      </div>
    </Dialog>
  );
};

export default DeliveryCancelDialog;
