import { useEffect, useRef, useState } from "react";
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
import SignatureDialog from "../components/deliveries/SignatureDialog";
import "../styles/CreateDelivery.css";

const toList = (response) => response.data?.data ?? response.data ?? [];

function CreateDelivery() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [form, setForm] = useState({
    productId: null,
    quantity: null,
    deliveredById: null,
    receivedById: null,
    deliveryDate: new Date(),
    documentNumber: "",
  });

  const toast = useRef(null);
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
      toast.current?.show({
        severity: "info",
        summary: "Búsqueda",
        detail: "Escribe al menos un carácter para buscar.",
        life: 3000,
      });
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.productId ||
      !form.quantity ||
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
      const offset = form.deliveryDate.getTimezoneOffset();
      const adjustedDate = new Date(
        form.deliveryDate.getTime() - offset * 60 * 1000,
      );

      await api.post("/deliveries", {
        productId: form.productId,
        quantity: form.quantity,
        deliveredById: form.deliveredById,
        receivedById: form.receivedById,
        signatureImage,
        // Enviamos la fecha ajustada
        deliveryDate: adjustedDate.toISOString(),
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
        productId: null,
        quantity: null,
        deliveredById: currentUser?.id ?? null,
        receivedById: null,
        deliveryDate: new Date(),
        documentNumber: nextNumRes.data?.nextNumber || "",
      });
      setSelectedProduct(null);
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

      <div className="mb-4">
        <h1 className="m-0 page-title">Nueva Entrega de Equipo</h1>
        <p className="text-600 m-0">
          Registra la salida de productos y captura la firma del receptor.
        </p>
      </div>

      <Card className="shadow-2 border-round-xl">
        <form onSubmit={handleSubmit} className="p-fluid">
          {/* SECCIÓN 1: Detalles del Producto */}
          <div className="flex align-items-center gap-2 mb-3 text-primary">
            <i className="pi pi-box font-bold"></i>
            <span className="font-bold uppercase text-sm">
              Detalles del Pedido
            </span>
          </div>

          <div className="grid">
            <div className="col-12 md:col-7 field">
              <label htmlFor="producto" className="font-semibold text-800">
                Producto a Entregar
              </label>
              <AutoComplete
                id="producto"
                value={selectedProduct}
                suggestions={filteredProducts}
                completeMethod={searchProduct}
                field="name"
                placeholder="Busca por nombre o referencia"
                itemTemplate={productItemTemplate}
                onChange={(e) => {
                  setSelectedProduct(e.value);
                  if (typeof e.value === "object" && e.value !== null) {
                    setForm({ ...form, productId: e.value.id });
                  } else {
                    setForm({ ...form, productId: null });
                  }
                }}
                className="w-full"
                inputClassName="w-full"
              />
            </div>

            <div className="col-12 md:col-2 field">
              <label htmlFor="cantidad" className="font-semibold text-800">
                Cantidad
              </label>
              <InputNumber
                id="cantidad"
                value={form.quantity}
                min={1}
                showButtons
                placeholder="0"
                onValueChange={(e) => setForm({ ...form, quantity: e.value })}
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-3 field">
              <label
                htmlFor="documentNumber"
                className="font-semibold text-800"
              >
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
          </div>

          <Divider />

          {/* SECCIÓN 2: Actores y Fecha */}
          <div className="flex align-items-center gap-2 mb-3 text-primary">
            <i className="pi pi-users font-bold"></i>
            <span className="font-bold uppercase text-sm">
              Responsables y Fecha
            </span>
          </div>

          <div className="grid">
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
                className="custom-calendar"
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

            <div className="col-12 md:col-4 field">
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
              disabled={!signatureImage}
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
