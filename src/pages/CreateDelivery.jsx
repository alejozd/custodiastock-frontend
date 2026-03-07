import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import "../styles/CreateDelivery.css";

const toList = (response) => response.data?.data ?? response.data ?? [];

function CreateDelivery() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [form, setForm] = useState({
    productId: null,
    quantity: null,
    deliveredById: null,
    receivedById: null,
    deliveryDate: new Date(),
  });

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const toast = useRef(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Guardamos lo que ya esté dibujado (por si redimensionan a mitad)
        const ctx = canvas.getContext("2d");
        const tempImage = canvas.toDataURL();

        // Ajustamos el tamaño interno al tamaño real del CSS
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Restauramos el dibujo y el estilo del pincel
        const img = new Image();
        img.src = tempImage;
        img.onload = () => ctx.drawImage(img, 0, 0);

        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#1f2937";
      }
    };

    // Ejecutamos al inicio
    resizeCanvas();

    // Escuchamos si cambian el tamaño de la ventana (útil si rotan el celular)
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, usersRes] = await Promise.all([
          api.get("/products"),
          api.get("/users"),
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

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (event.touches?.[0]) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const point = getPoint(event);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1f2937";

    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!drawingRef.current) {
      return;
    }

    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    const point = getPoint(event);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1f2937";
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.productId ||
      !form.quantity ||
      !form.deliveredById ||
      !form.receivedById ||
      !form.deliveryDate
    ) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos incompletos",
        detail: "Completa todos los campos obligatorios.",
      });
      return;
    }

    if (!hasSignature) {
      toast.current?.show({
        severity: "warn",
        summary: "Firma requerida",
        detail: "Debes agregar una firma.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const signatureImage = canvasRef.current.toDataURL("image/png");

      await api.post("/deliveries", {
        productId: form.productId,
        quantity: form.quantity,
        deliveredById: form.deliveredById,
        receivedById: form.receivedById,
        signatureImage,
        deliveryDate: form.deliveryDate.toISOString(),
      });

      toast.current?.show({
        severity: "success",
        summary: "Entrega creada",
        detail: "Registro guardado correctamente.",
      });
      setForm({
        productId: null,
        quantity: null,
        deliveredById: currentUser?.id ?? null,
        receivedById: null,
        deliveryDate: new Date(),
      });
      clearSignature();
    } catch (error) {
      const message =
        error.response?.data?.message || "No fue posible crear la entrega.";
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
            <div className="col-12 md:col-8 field">
              <label htmlFor="producto" className="font-semibold text-800">
                Producto a Entregar
              </label>
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <Dropdown
                  id="producto"
                  value={form.productId}
                  options={products}
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Selecciona un producto del catálogo"
                  onChange={(e) => setForm({ ...form, productId: e.value })}
                  filter // Añadimos filtro para facilitar la búsqueda
                  className="w-full"
                />
              </IconField>
            </div>

            <div className="col-12 md:col-4 field">
              <label htmlFor="cantidad" className="font-semibold text-800">
                Cantidad
              </label>
              <InputNumber
                id="cantidad"
                value={form.quantity}
                min={1}
                showButtons // Mejora la experiencia en tablets
                placeholder="0"
                onValueChange={(e) => setForm({ ...form, quantity: e.value })}
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
            <Button
              type="button"
              label="Limpiar Firma"
              icon="pi pi-refresh"
              className="p-button-text p-button-sm p-button-danger"
              onClick={clearSignature}
            />
          </div>

          <div className="signature-wrapper border-1 border-300 border-round-xl overflow-hidden surface-50">
            <canvas
              ref={canvasRef}
              className="signature-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          <div className="flex align-items-center gap-2 mt-2">
            <i
              className={`pi ${hasSignature ? "pi-check-circle text-green-500" : "pi-info-circle text-orange-500"}`}
            ></i>
            <small
              className={
                hasSignature ? "text-green-600 font-medium" : "text-orange-600"
              }
            >
              {hasSignature
                ? "Firma capturada correctamente"
                : "El receptor debe firmar en el recuadro superior"}
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
              disabled={!hasSignature}
            />
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CreateDelivery;
