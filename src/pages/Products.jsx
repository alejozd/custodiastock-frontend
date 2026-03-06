import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import api from "../api/apiClient";

const emptyProduct = { id: null, name: "", sku: "", price: "", stock: "" };

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [productForm, setProductForm] = useState(emptyProduct);
  const toast = useRef(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");
      setProducts(response.data?.data ?? response.data ?? []);
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to load products" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreate = () => {
    setEditing(false);
    setProductForm(emptyProduct);
    setDialogVisible(true);
  };

  const openEdit = (product) => {
    setEditing(true);
    setProductForm({
      id: product.id,
      name: product.name ?? "",
      sku: product.sku ?? "",
      price: product.price ?? "",
      stock: product.stock ?? "",
    });
    setDialogVisible(true);
  };

  const saveProduct = async () => {
    try {
      if (editing) {
        await api.put(`/products/${productForm.id}`, productForm);
      } else {
        await api.post("/products", productForm);
      }
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Product ${editing ? "updated" : "created"} successfully`,
      });
      setDialogVisible(false);
      setProductForm(emptyProduct);
      loadProducts();
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Unable to save product" });
    }
  };

  const deactivateProduct = (product) => {
    confirmDialog({
      message: `Deactivate product ${product.name}?`,
      header: "Confirm deactivation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await api.patch(`/products/${product.id}/deactivate`);
          toast.current?.show({ severity: "success", summary: "Product deactivated" });
          loadProducts();
        } catch {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Unable to deactivate product",
          });
        }
      },
    });
  };

  const actionTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => openEdit(rowData)} />
      <Button icon="pi pi-times" rounded text severity="danger" onClick={() => deactivateProduct(rowData)} />
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-3">
        <h1 className="text-900 m-0 text-2xl">Products Management</h1>
        <Button label="New Product" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={products} loading={loading} paginator rows={10} responsiveLayout="scroll" dataKey="id">
        <Column field="name" header="Name" />
        <Column field="sku" header="SKU" />
        <Column field="price" header="Price" />
        <Column field="stock" header="Stock" />
        <Column field="status" header="Status" />
        <Column header="Actions" body={actionTemplate} style={{ width: "8rem" }} />
      </DataTable>

      <Dialog
        visible={dialogVisible}
        header={editing ? "Edit product" : "Create product"}
        onHide={() => setDialogVisible(false)}
        style={{ width: "34rem" }}
      >
        <div className="flex flex-column gap-3 pt-2">
          <span className="p-float-label">
            <InputText
              id="product-name"
              className="w-full"
              value={productForm.name}
              onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <label htmlFor="product-name">Name</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="product-sku"
              className="w-full"
              value={productForm.sku}
              onChange={(event) => setProductForm((prev) => ({ ...prev, sku: event.target.value }))}
            />
            <label htmlFor="product-sku">SKU</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="product-price"
              className="w-full"
              value={productForm.price}
              onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
            />
            <label htmlFor="product-price">Price</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="product-stock"
              className="w-full"
              value={productForm.stock}
              onChange={(event) => setProductForm((prev) => ({ ...prev, stock: event.target.value }))}
            />
            <label htmlFor="product-stock">Stock</label>
          </span>

          <div className="flex justify-content-end gap-2 mt-2">
            <Button label="Cancel" text onClick={() => setDialogVisible(false)} />
            <Button label="Save" onClick={saveProduct} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default Products;
