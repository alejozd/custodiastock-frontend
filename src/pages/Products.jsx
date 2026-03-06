import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import ProductImportDialog from "../components/products/ProductImportDialog";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";

const emptyProduct = { id: null, name: "", reference: "", description: "", active: true };

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const toast = useRef(null);
  const { currentUser } = useAuth();
  const isAdmin = (currentUser?.role ?? "").toUpperCase() === "ADMIN";

  const loadProducts = async () => {
    try {
      setLoading(true);
      const list = await productService.getProducts();
      setProducts(list);
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudieron cargar los productos." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreate = () => {
    setForm(emptyProduct);
    setDialogVisible(true);
  };

  const openEdit = async (row) => {
    try {
      setLoading(true);
      const item = await productService.getProductById(row.id);
      setForm({
        id: item.id,
        name: item.name ?? "",
        reference: item.reference ?? "",
        description: item.description ?? "",
        active: Boolean(item.active),
      });
      setDialogVisible(true);
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo cargar el producto." });
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async () => {
    try {
      setSaving(true);
      if (form.id) {
        await productService.updateProduct(form.id, {
          name: form.name,
          reference: form.reference,
          description: form.description,
          active: form.active,
        });
      } else {
        await productService.createProduct({
          name: form.name,
          reference: form.reference,
          description: form.description,
          active: form.active,
        });
      }

      toast.current?.show({ severity: "success", summary: "Éxito", detail: "Producto guardado correctamente." });
      setDialogVisible(false);
      setForm(emptyProduct);
      loadProducts();
    } catch (error) {
      const message = error.response?.data?.message || "No fue posible guardar el producto.";
      toast.current?.show({ severity: "error", summary: "Error", detail: message });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (row) => {
    confirmDialog({
      message: `¿Deseas eliminar el producto ${row.name}?`,
      header: "Confirmar eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await productService.deleteProduct(row.id);
          toast.current?.show({ severity: "success", summary: "Producto eliminado" });
          loadProducts();
        } catch {
          toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo eliminar el producto." });
        }
      },
    });
  };

  const toggleActive = async (row) => {
    try {
      await productService.updateProduct(row.id, {
        name: row.name,
        reference: row.reference,
        description: row.description,
        active: !row.active,
      });
      toast.current?.show({ severity: "success", summary: "Estado actualizado" });
      loadProducts();
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo cambiar el estado." });
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <h1 className="m-0 text-2xl">Productos</h1>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <Button
              label="Importar productos"
              icon="pi pi-upload"
              severity="secondary"
              onClick={() => setImportDialogVisible(true)}
            />
            <Button label="Nuevo producto" icon="pi pi-plus" onClick={openCreate} />
          </div>
        )}
      </div>

      <DataTable value={products} loading={loading} paginator rows={10} size="small" responsiveLayout="scroll" dataKey="id">
        <Column field="name" header="Nombre" />
        <Column field="reference" header="Referencia" />
        <Column field="description" header="Descripción" />
        <Column
          header="Activo"
          body={(row) =>
            isAdmin ? (
              <InputSwitch checked={Boolean(row.active)} onChange={() => toggleActive(row)} aria-label="Estado activo" />
            ) : (
              <span>{row.active ? "Sí" : "No"}</span>
            )
          }
        />
        <Column
          header="Fecha creación"
          body={(row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString("es-CO") : "-")}
        />
        {isAdmin && (
          <Column
            header="Acciones"
            body={(row) => (
              <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => openEdit(row)} />
                <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => confirmDelete(row)} />
              </div>
            )}
          />
        )}
      </DataTable>

      <Dialog
        visible={dialogVisible}
        header={form.id ? "Editar producto" : "Crear producto"}
        onHide={() => setDialogVisible(false)}
        style={{ width: "min(95vw, 36rem)" }}
      >
        <div className="flex flex-column gap-3 pt-2">
          <div>
            <label htmlFor="product-name" className="block mb-2 font-medium">Nombre</label>
            <InputText
              id="product-name"
              className="w-full"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="product-reference" className="block mb-2 font-medium">Referencia</label>
            <InputText
              id="product-reference"
              className="w-full"
              value={form.reference}
              onChange={(event) => setForm((prev) => ({ ...prev, reference: event.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="product-description" className="block mb-2 font-medium">Descripción</label>
            <InputText
              id="product-description"
              className="w-full"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>

          <div className="flex align-items-center justify-content-between border-1 border-200 border-round p-3">
            <span>Activo</span>
            <InputSwitch
              checked={Boolean(form.active)}
              onChange={(event) => setForm((prev) => ({ ...prev, active: event.value }))}
            />
          </div>

          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" text onClick={() => setDialogVisible(false)} />
            <Button label="Guardar" onClick={saveProduct} loading={saving} />
          </div>
        </div>
      </Dialog>

      <ProductImportDialog
        visible={importDialogVisible}
        onHide={() => setImportDialogVisible(false)}
        onImported={loadProducts}
      />
    </div>
  );
}

export default Products;
