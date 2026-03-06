import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import api from "../api/apiClient";

const toList = (response) => response.data?.data ?? response.data ?? [];

function CreateDelivery() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    productId: null,
    quantity: null,
    deliveredById: null,
    receivedById: null,
    receivedByName: "",
  });

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const toast = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, usersRes] = await Promise.all([api.get("/products"), api.get("/users")]);
        setProducts(toList(productsRes).filter((item) => item.active !== false));
        setUsers(toList(usersRes).filter((item) => item.active !== false));
      } catch {
        toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudieron cargar los datos base." });
      }
    };

    loadData();
  }, []);

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
    const ctx = canvasRef.current.getContext("2d");
    const point = getPoint(event);

    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!drawingRef.current) {
      return;
    }

    event.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const point = getPoint(event);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1f2937";
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const isSignatureEmpty = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] !== 0) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.productId || !form.quantity || !form.deliveredById || (!form.receivedById && !form.receivedByName)) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos incompletos",
        detail: "Completa todos los campos obligatorios.",
      });
      return;
    }

    if (isSignatureEmpty()) {
      toast.current?.show({ severity: "warn", summary: "Firma requerida", detail: "Debes agregar una firma." });
      return;
    }

    try {
      setSubmitting(true);
      const signatureImage = canvasRef.current.toDataURL("image/png");

      await api.post("/deliveries", {
        productId: form.productId,
        quantity: form.quantity,
        deliveredById: form.deliveredById,
        receivedById: form.receivedById || undefined,
        receivedByName: form.receivedByName || undefined,
        signatureImage,
      });

      toast.current?.show({ severity: "success", summary: "Entrega creada", detail: "Registro guardado correctamente." });
      setForm({ productId: null, quantity: null, deliveredById: null, receivedById: null, receivedByName: "" });
      clearSignature();
    } catch (error) {
      const message = error.response?.data?.message || "No fue posible crear la entrega.";
      toast.current?.show({ severity: "error", summary: "Error", detail: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <h1 className="m-0 text-2xl mb-3">Nueva entrega</h1>

      <Card>
        <form className="grid" onSubmit={handleSubmit}>
          <div className="col-12 md:col-6">
            <label htmlFor="producto" className="block mb-2">Producto</label>
            <Dropdown
              id="producto"
              value={form.productId}
              options={products}
              optionLabel="name"
              optionValue="id"
              className="w-full"
              onChange={(event) => setForm((prev) => ({ ...prev, productId: event.value }))}
              placeholder="Selecciona un producto"
            />
          </div>

          <div className="col-12 md:col-6">
            <label htmlFor="cantidad" className="block mb-2">Cantidad</label>
            <InputNumber
              id="cantidad"
              value={form.quantity}
              className="w-full"
              min={1}
              onValueChange={(event) => setForm((prev) => ({ ...prev, quantity: event.value }))}
            />
          </div>

          <div className="col-12 md:col-6">
            <label htmlFor="entregadoPor" className="block mb-2">Entregado por</label>
            <Dropdown
              id="entregadoPor"
              value={form.deliveredById}
              options={users}
              optionLabel="name"
              optionValue="id"
              className="w-full"
              onChange={(event) => setForm((prev) => ({ ...prev, deliveredById: event.value }))}
              placeholder="Selecciona un usuario"
            />
          </div>

          <div className="col-12 md:col-6">
            <label htmlFor="recibidoPor" className="block mb-2">Recibido por (usuario)</label>
            <Dropdown
              id="recibidoPor"
              value={form.receivedById}
              options={users}
              optionLabel="name"
              optionValue="id"
              className="w-full"
              onChange={(event) => setForm((prev) => ({ ...prev, receivedById: event.value }))}
              placeholder="Opcional"
            />
          </div>

          <div className="col-12">
            <label htmlFor="recibidoPorTexto" className="block mb-2">Recibido por (texto)</label>
            <InputText
              id="recibidoPorTexto"
              value={form.receivedByName}
              className="w-full"
              onChange={(event) => setForm((prev) => ({ ...prev, receivedByName: event.target.value }))}
              placeholder="Usa este campo si no seleccionas usuario"
            />
          </div>

          <div className="col-12">
            <div className="flex justify-content-between align-items-center mb-2">
              <label className="m-0">Firma</label>
              <Button label="Limpiar" type="button" text onClick={clearSignature} />
            </div>
            <canvas
              ref={canvasRef}
              width={700}
              height={220}
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

          <div className="col-12 flex justify-content-end">
            <Button type="submit" label="Guardar entrega" icon="pi pi-check" loading={submitting} />
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CreateDelivery;
