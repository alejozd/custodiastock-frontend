import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";
import ProductImportDialog from "../components/products/ProductImportDialog";
import ProductDialog from "../components/products/ProductDialog";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";
import "../styles/Common.css";

const emptyProduct = {
  id: null,
  name: "",
  reference: "",
  description: "",
  active: true,
};

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
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar los productos.",
      });
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
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar el producto.",
      });
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

      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Producto guardado correctamente.",
      });
      setDialogVisible(false);
      setForm(emptyProduct);
      loadProducts();
    } catch (error) {
      const message =
        error.response?.data?.message || "No fue posible guardar el producto.";
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: message,
      });
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
          toast.current?.show({
            severity: "success",
            summary: "Producto eliminado",
          });
          loadProducts();
        } catch {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "No se pudo eliminar el producto.",
          });
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
      toast.current?.show({
        severity: "success",
        summary: "Estado actualizado",
      });
      loadProducts();
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cambiar el estado.",
      });
    }
  };

  return (
    <div className="products-container animate-fade-in">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="m-0 page-title">Gestión de Productos</h1>
          <p className="text-600 m-0">
            Administra el catálogo de referencias y descripciones.
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              label="Importar"
              icon="pi pi-upload"
              severity="secondary"
              outlined
              onClick={() => setImportDialogVisible(true)}
            />
            <Button
              label="Nuevo Producto"
              icon="pi pi-plus"
              onClick={openCreate}
              className="p-button-raised"
            />
          </div>
        )}
      </div>

      <div className="table-card">
        <DataTable
          value={products}
          loading={loading}
          paginator
          rows={10}
          className="p-datatable-modern"
          dataKey="id"
          emptyMessage="No hay productos registrados."
          responsiveLayout="stack"
          breakpoint="960px"
        >
          <Column
            field="name"
            header="Producto"
            body={(row) => (
              <div className="flex flex-column">
                <span className="font-bold text-900">{row.name}</span>
                <small className="text-500">{row.reference}</small>
              </div>
            )}
            style={{ minWidth: "15rem" }}
          />
          <Column
            field="description"
            header="Descripción"
            className="text-600"
          />
          <Column
            header="Estado"
            body={(row) => (
              <div className="flex align-items-center gap-2">
                <InputSwitch
                  checked={Boolean(row.active)}
                  onChange={() => toggleActive(row)}
                  disabled={!isAdmin}
                  className="p-inputswitch-sm"
                />
                <span
                  className={`status-label ${row.active ? "active" : "inactive"}`}
                >
                  {row.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            )}
          />
          {isAdmin && (
            <Column
              header="Acciones"
              body={(row) => (
                <div className="flex gap-1">
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    severity="info"
                    onClick={() => openEdit(row)}
                  />
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    onClick={() => confirmDelete(row)}
                  />
                </div>
              )}
            />
          )}
        </DataTable>
      </div>

      <ProductDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        product={form}
        setProduct={setForm}
        onSave={saveProduct}
        saving={saving}
      />

      <ProductImportDialog
        visible={importDialogVisible}
        onHide={() => setImportDialogVisible(false)}
        onImported={loadProducts}
      />
    </div>
  );
}

export default Products;
