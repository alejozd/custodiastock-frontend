import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { AutoComplete } from "primereact/autocomplete";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import SignatureDialog from "../components/deliveries/SignatureDialog";
import "../styles/CreateDelivery.css";

const toList = (response) => response.data?.data ?? response.data ?? [];

function CreateDelivery() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [form, setForm] = useState({
    deliveredById: null,
    receivedById: null,
    deliveryDate: new Date(),
    documentNumber: "",
  });

  const toast = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, usersRes, nextNumRes] = await Promise.all([
          api.get("/products"),
          api.get("/users"),
          api.get("/deliveries/next-number"),
        ]);

        const activeProducts = toList(productsRes).filter(
          (item) => item.active !== false,
        );
        const activeUsers = toList(usersRes).filter(
          (item) => item.active !== false,
        );
        const operatorUsers = activeUsers.filter(
          (user) => String(user.role).toUpperCase() === "OPERATOR",
        );

        setProducts(activeProducts);
        setUsers(operatorUsers.filter((user) => user.id !== currentUser?.id));

        setForm((prev) => ({
          ...prev,
          deliveredById: currentUser?.id ?? null,
          documentNumber: nextNumRes.data?.nextNumber || "",
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
  }, [currentUser?.id]);

  const handleSignatureSave = (dataUrl) => {
    setSignatureImage(dataUrl);
    setShowSignatureDialog(false);
  };

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

    if (items.length === 0) {
        toast.current?.show({
          severity: "warn",
          summary: "Lista vacía",
          detail: "Debes agregar al menos un producto.",
        });
        return;
      }

    if (
      !form.deliveredById ||
      !form.receivedById ||
      !form.deliveryDate ||
      !form.documentNumber
    ) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos incompletos",
        detail: "Completa todos los campos obligatorios.",
      });
      return;
    }

    if (!signatureImage) {
      toast.current?.show({
        severity: "warn",
        summary: "Firma requerida",
        detail: "Debes agregar una firma.",
      });
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/deliveries", {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        deliveredById: form.deliveredById,
        receivedById: form.receivedById,
        signatureImage,
        deliveryDate: form.deliveryDate,
        documentNumber: form.documentNumber,
      });

      toast.current?.show({
        severity: "success",
        summary: "Entrega creada",
        detail: "Registro guardado correctamente.",
      });
      // Recargar el siguiente número sugerido para la próxima entrega
      const nextNumRes = await api.get("/deliveries/next-number");

      setForm({
        deliveredById: currentUser?.id ?? null,
        receivedById: null,
        deliveryDate: new Date(),
        documentNumber: nextNumRes.data?.nextNumber || "",
      });
      setItems([]);
      setSelectedProduct(null);
      setItemQuantity(1);
      setSignatureImage(null);
    } catch (error) {
      if (error.response?.status === 409) {
        const suggested =
          error.response.data?.details?.suggestedNumber ||
          error.response.data?.suggestedNumber;
        toast.current?.show({
          severity: "warn",
          summary: "Número Duplicado",
          detail: `El número ${form.documentNumber} ya existe. ¿Deseas usar el sugerido: ${suggested}?`,
          sticky: true,
          content: (props) => (
            <div className="flex flex-column" style={{ flex: "1" }}>
              <div className="flex align-items-center gap-2">
                <i className="pi pi-exclamation-triangle text-2xl"></i>
                <div className="flex flex-column gap-1">
                  <span className="font-bold">{props.message.summary}</span>
                  <div className="text-sm">{props.message.detail}</div>
                </div>
              </div>
              <div className="flex justify-content-end gap-2 mt-3">
                <Button
                  type="button"
                  label="Usar Sugerido"
                  size="small"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, documentNumber: suggested }));
                    toast.current?.clear();
                  }}
                />
                <Button
                  type="button"
                  label="Cerrar"
                  size="small"
                  severity="secondary"
                  outlined
                  onClick={() => toast.current?.clear()}
                />
              </div>
            </div>
          ),
        });
      } else {
        const message =
          error.response?.data?.message || "No fue posible crear la entrega.";
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="delivery-container animate-fade-in">
      <Toast ref={toast} />

      <div className="mb-4 flex align-items-center gap-3">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          severity="secondary"
          onClick={() => navigate("/entregas")}
        />
        <div>
          <h1 className="m-0 page-title">Nueva Entrega</h1>
          <p className="text-600 m-0">
            Registra la salida de productos y captura la firma del receptor.
          </p>
        </div>
      </div>

      <Card className="shadow-2 border-round-xl">
        <form onSubmit={handleSubmit} className="p-fluid">
          {/* SECCIÓN 1: Detalles del Producto */}
          <div className="flex align-items-center gap-2 mb-3 text-primary">
            <i className="pi pi-box font-bold"></i>
            <span className="font-bold uppercase text-sm">
              Agregar Productos
            </span>
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
                inputClassName="w-full"
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

          {/* SECCIÓN 2: Actores y Fecha */}
          <div className="flex align-items-center gap-2 mb-3 text-primary">
            <i className="pi pi-file-edit font-bold"></i>
            <span className="font-bold uppercase text-sm">
              Información del Documento
            </span>
          </div>

          <div className="grid">
            <div className="col-12 md:col-4 field">
              <label htmlFor="documentNumber" className="font-semibold text-800">
                N° Documento
              </label>
              <InputText
                id="documentNumber"
                value={form.documentNumber}
                placeholder="Ej: ENT-001"
                onChange={(e) =>
                  setForm({ ...form, documentNumber: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-4 field">
              <label htmlFor="fechaEntrega" className="font-semibold text-800">
                Fecha de Registro
              </label>
              <Calendar
                id="fechaEntrega"
                value={form.deliveryDate}
                onChange={(e) => setForm({ ...form, deliveryDate: e.value })}
                dateFormat="dd/mm/yy"
                showIcon
                showTime
                hourFormat="12"
                className="custom-calendar"
                inputClassName="w-full"
              />
            </div>

            <div className="col-12 md:col-4 field">
              <label className="font-semibold text-800">
                Entregado por (Tú)
              </label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-user-check"></i>
                </span>
                <InputText
                  value={currentUser?.fullName || currentUser?.username}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="col-12 md:col-12 field">
              <label htmlFor="recibidoPor" className="font-semibold text-800">
                Recibido por (Operador)
              </label>
              <Dropdown
                id="recibidoPor"
                value={form.receivedById}
                options={users}
                optionLabel="fullName"
                optionValue="id"
                placeholder="¿Quién recibe?"
                onChange={(e) => setForm({ ...form, receivedById: e.value })}
                filter
              />
            </div>
          </div>

          <Divider />

          {/* SECCIÓN 3: Firma Digital */}
          <div className="flex align-items-center justify-content-between mb-3">
            <div className="flex align-items-center gap-2 text-primary">
              <i className="pi pi-pencil font-bold"></i>
              <span className="font-bold uppercase text-sm">
                Firma de Conformidad
              </span>
            </div>
            {signatureImage && (
              <Button
                type="button"
                label="Borrar y Volver a Firmar"
                icon="pi pi-refresh"
                className="p-button-text p-button-sm p-button-danger"
                onClick={() => setSignatureImage(null)}
              />
            )}
          </div>

          <div className="signature-wrapper border-round-xl overflow-hidden surface-50 flex align-items-center justify-content-center">
            {signatureImage ? (
              <img
                src={signatureImage}
                alt="Firma"
                className="signature-preview"
              />
            ) : (
              <div
                className="signature-placeholder"
                onClick={() => setShowSignatureDialog(true)}
              >
                <i className="pi pi-pencil text-4xl mb-2 text-400"></i>
                <span className="text-600 font-medium">
                  Click aquí para capturar firma
                </span>
                <small className="text-400 mt-1">
                  Se abrirá un panel dedicado
                </small>
              </div>
            )}
          </div>

          <div className="flex align-items-center gap-2 mt-2">
            <i
              className={`pi ${signatureImage ? "pi-check-circle text-green-500" : "pi-info-circle text-orange-500"}`}
            ></i>
            <small
              className={
                signatureImage
                  ? "text-green-600 font-medium"
                  : "text-orange-600"
              }
            >
              {signatureImage
                ? "Firma capturada correctamente"
                : "Se requiere la firma del receptor para continuar"}
            </small>
          </div>

          <div className="mt-5 flex justify-content-end">
            <Button
              type="submit"
              label="Finalizar y Guardar Entrega"
              icon="pi pi-save"
              size="large"
              className="w-full md:w-auto p-3"
              loading={submitting}
              disabled={!signatureImage || items.length === 0}
            />
          </div>
        </form>
      </Card>

      <SignatureDialog
        visible={showSignatureDialog}
        onHide={() => setShowSignatureDialog(false)}
        onSave={handleSignatureSave}
      />
    </div>
  );
}

export default CreateDelivery;
