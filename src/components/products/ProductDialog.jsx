import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';

const ProductDialog = ({ visible, onHide, product, setProduct, onSave, saving }) => {
  return (
    <Dialog
      visible={visible}
      header={
        <div className="flex align-items-center gap-2">
          <i
            className={`pi ${product.id ? "pi-box" : "pi-plus-circle"} text-primary text-xl`}
          ></i>
          <span className="font-bold">
            {product.id ? "Editar Producto" : "Nuevo Producto"}
          </span>
        </div>
      }
      onHide={onHide}
      className="product-dialog"
      style={{ width: "35rem" }}
      modal
      footer={
        <div className="flex justify-content-end gap-2 p-3 border-top-1 border-100">
          <Button
            label="Cancelar"
            text
            severity="secondary"
            onClick={onHide}
            className="px-4"
          />
          <Button
            label="Guardar Producto"
            icon="pi pi-check"
            onClick={onSave}
            loading={saving}
            className="px-4"
          />
        </div>
      }
    >
      <div className="grid p-fluid mt-2">
        <div className="col-12 md:col-6 field">
          <label htmlFor="name" className="font-bold">Nombre del Producto</label>
          <IconField iconPosition="left">
            <InputIcon className="pi pi-tag" />
            <InputText
              id="name"
              value={product.name}
              placeholder='Ej: Monitor Gamer 24"'
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
            />
          </IconField>
        </div>

        <div className="col-12 md:col-6 field">
          <label htmlFor="ref" className="font-bold">Referencia / SKU</label>
          <IconField iconPosition="left">
            <InputIcon className="pi pi-barcode" />
            <InputText
              id="ref"
              value={product.reference}
              placeholder="REF-001"
              onChange={(e) =>
                setProduct({ ...product, reference: e.target.value })
              }
            />
          </IconField>
        </div>

        <div className="col-12 field">
          <label htmlFor="desc" className="font-bold">Descripción Corta</label>
          <IconField iconPosition="left">
            <InputIcon className="pi pi-align-left" />
            <InputText
              id="desc"
              value={product.description}
              placeholder="Breve detalle del producto..."
              onChange={(e) =>
                setProduct({ ...product, description: e.target.value })
              }
            />
          </IconField>
        </div>

        <div className="status-container">
          <div className="flex flex-column">
            <span className="font-bold text-900">Producto Disponible</span>
            <small className="text-600">Habilitar para ventas y stock</small>
          </div>
          <InputSwitch
            checked={Boolean(product.active)}
            onChange={(e) => setProduct({ ...product, active: e.value })}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ProductDialog;
