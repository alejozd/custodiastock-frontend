import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import { AutoComplete } from "primereact/autocomplete";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import entryService from "../services/entryService";
import productService from "../services/productService";
import { useAuth } from "../context/AuthContext";

function CreateEntry() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    entryDate: new Date(),
    documentNumber: "",
    sourceDocument: "",
  });

  const toast = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsList, nextNumData] = await Promise.all([
          productService.getProducts(),
          entryService.getNextNumber(),
        ]);

        const activeProducts = productsList.filter(
          (item) => item.active !== false,
        );

        setProducts(activeProducts);
        setForm((prev) => ({
          ...prev,
          documentNumber: nextNumData?.nextNumber || "",
        }));
      } catch {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron cargar los datos base.",
        });
      }
    };

    loadData();
  }, []);

  const searchProduct = (event) => {
    const query = event.query.trim().toLowerCase();
    if (!query) {
      setFilteredProducts([]);
      return;
    }
    const filtered = products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.reference?.toLowerCase().includes(query)
      );
    });
    setFilteredProducts(filtered);
  };

  const productItemTemplate = (item) => {
    return (
      <div className="flex flex-column">
        <span className="font-bold">{item.name}</span>
        <small className="text-500">{item.reference}</small>
      </div>
    );
  };

  const addItem = () => {
    if (!selectedProduct || typeof selectedProduct !== 'object' || !itemQuantity || itemQuantity <= 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Datos incompletos",
        detail: "Selecciona un producto de la lista y una cantidad válida.",
      });
      return;
    }

    const exists = items.find((i) => i.productId === selectedProduct.id);
    if (exists) {
        toast.current?.show({
            severity: "warn",
            summary: "Producto ya agregado",
            detail: "Este producto ya está en la lista. Si deseas cambiar la cantidad, elimínalo y agrégalo de nuevo.",
          });
          return;
    }

    const newItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      reference: selectedProduct.reference,
      quantity: itemQuantity,
    };

    setItems([...items, newItem]);
    setSelectedProduct(null);
    setItemQuantity(1);
  };

  const removeItem = (productId) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    if (items.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Lista vacía",
        detail: "Debes agregar al menos un producto.",
      });
      return;
    }

    if (!form.entryDate || !form.documentNumber) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos incompletos",
        detail: "Completa la información del documento.",
      });
      return;
    }

    try {
      setSubmitting(true);

      await entryService.createEntry({
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        userId: currentUser?.id,
        entryDate: form.entryDate,
        documentNumber: form.documentNumber,
        sourceDocument: form.sourceDocument,
      });

      toast.current?.show({
        severity: "success",
        summary: "Entrada registrada",
        detail: "Registro guardado correctamente.",
      });

      // Recargar el siguiente número sugerido para la próxima entrada
      const nextNumData = await entryService.getNextNumber();

      setForm({
        entryDate: new Date(),
        documentNumber: nextNumData?.nextNumber || "",
        sourceDocument: "",
      });
      setItems([]);
      setSelectedProduct(null);
      setItemQuantity(1);
    } catch (error) {
       const message = error.response?.data?.message || "No fue posible registrar la entrada.";
       toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: message,
       });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 animate-fade-in surface-50 min-h-screen">
      <Toast ref={toast} />

      <div className="mb-4 flex align-items-center gap-3">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          severity="secondary"
          onClick={() => navigate("/entradas")}
        />
        <div>
          <h1 className="m-0 page-title">Nueva Entrada de Inventario</h1>
          <p className="text-600 m-0">
            Registra el ingreso de mercancía especificando productos, cantidades y documento.
          </p>
        </div>
      </div>

      <div className="flex justify-content-center">
        <Card className="shadow-4 border-round-xl w-full" style={{ maxWidth: '900px' }}>
          <form onSubmit={handleSubmit} className="p-fluid">
            <div className="flex align-items-center gap-2 mb-3 text-primary">
              <i className="pi pi-box font-bold"></i>
              <span className="font-bold uppercase text-sm">Agregar Productos</span>
            </div>

            <div className="grid align-items-end">
              <div className="col-12 md:col-6 field">
                <label htmlFor="producto" className="font-semibold text-800">
                  Producto
                </label>
                <AutoComplete
                  id="producto"
                  value={selectedProduct}
                  suggestions={filteredProducts}
                  completeMethod={searchProduct}
                  field="name"
                  placeholder="Busca por nombre o referencia"
                  itemTemplate={productItemTemplate}
                  onChange={(e) => setSelectedProduct(e.value)}
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-3 field">
                <label htmlFor="cantidad" className="font-semibold text-800">
                  Cantidad
                </label>
                <InputNumber
                  id="cantidad"
                  value={itemQuantity}
                  min={1}
                  showButtons
                  placeholder="0"
                  onValueChange={(e) => setItemQuantity(e.value)}
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-3 field">
                <Button
                  type="button"
                  label="Agregar"
                  icon="pi pi-plus"
                  onClick={addItem}
                  className="w-full"
                  severity="info"
                  outlined
                />
              </div>
            </div>

            {items.length > 0 && (
              <div className="mt-3 mb-4">
                <DataTable value={items} size="small" className="shadow-1 border-round overflow-hidden">
                  <Column field="productName" header="Producto" />
                  <Column field="reference" header="Referencia" />
                  <Column field="quantity" header="Cant." style={{ width: '5rem' }} />
                  <Column
                    body={(rowData) => (
                      <Button
                        icon="pi pi-trash"
                        severity="danger"
                        text
                        rounded
                        onClick={() => removeItem(rowData.productId)}
                      />
                    )}
                    style={{ width: '3rem' }}
                  />
                </DataTable>
              </div>
            )}

            <Divider />

            <div className="flex align-items-center gap-2 mb-3 text-primary">
              <i className="pi pi-file-edit font-bold"></i>
              <span className="font-bold uppercase text-sm">Información del Documento</span>
            </div>

            <div className="grid">
              <div className="col-12 md:col-4 field">
                <label htmlFor="documentNumber" className="font-semibold text-800">
                  N° Documento
                </label>
                <InputText
                  id="documentNumber"
                  value={form.documentNumber}
                  placeholder="Ej: ENTR-000001"
                  onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-4 field">
                <label htmlFor="sourceDocument" className="font-semibold text-800">
                  Documento Origen
                </label>
                <InputText
                  id="sourceDocument"
                  value={form.sourceDocument}
                  placeholder="Ej: FAC-12345"
                  onChange={(e) => setForm({ ...form, sourceDocument: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-4 field">
                <label htmlFor="entryDate" className="font-semibold text-800">
                  Fecha de Entrada
                </label>
                <Calendar
                  id="entryDate"
                  value={form.entryDate}
                  onChange={(e) => setForm({ ...form, entryDate: e.value })}
                  dateFormat="dd/mm/yy"
                  showIcon
                  showTime
                  hourFormat="12"
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-content-end gap-2">
               <Button
                type="button"
                label="Cancelar"
                icon="pi pi-times"
                outlined
                severity="secondary"
                onClick={() => navigate("/entradas")}
                className="w-full md:w-auto"
              />
              <Button
                type="submit"
                label="Registrar Entrada"
                icon="pi pi-save"
                className="w-full md:w-auto p-3"
                severity="success"
                loading={submitting}
                disabled={items.length === 0 || submitting}
              />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default CreateEntry;
