import { useRef, useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

function SignatureDialog({ visible, onHide, onSave }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Save current drawing
        const ctx = canvas.getContext("2d");
        const tempImage = canvas.toDataURL();

        // Adjust internal dimensions to CSS size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Restore drawing
        const img = new Image();
        img.src = tempImage;
        img.onload = () => ctx.drawImage(img, 0, 0);

        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#1f2937";
      }
    };

    if (visible) {
      const timer = setTimeout(resizeCanvas, 100);
      window.addEventListener("resize", resizeCanvas);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", resizeCanvas);
      };
    }
  }, [visible]);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
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
    if (!drawingRef.current) return;

    if (event.cancelable) {
        event.preventDefault();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const point = getPoint(event);

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = () => {
    if (canvasRef.current && hasSignature) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      onSave(dataUrl);
    }
  };

  const footer = (
    <div className="flex justify-content-between w-full">
      <Button
        label="Limpiar"
        icon="pi pi-refresh"
        className="p-button-text p-button-danger"
        onClick={clearSignature}
      />
      <div className="flex gap-2">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          className="p-button-text"
          onClick={onHide}
        />
        <Button
          label="Confirmar Firma"
          icon="pi pi-check"
          onClick={handleSave}
          disabled={!hasSignature}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      header="Capturar Firma del Receptor"
      visible={visible}
      style={{ width: '95vw', maxWidth: '600px' }}
      onHide={onHide}
      onShow={() => setHasSignature(false)}
      footer={footer}
      draggable={false}
      resizable={false}
      blockScroll
    >
      <div
        className="signature-wrapper border-1 border-300 border-round-xl overflow-hidden surface-50"
        style={{ height: '300px' }}
      >
        <canvas
          ref={canvasRef}
          className="signature-canvas"
          style={{ width: '100%', height: '100%', cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <p className="text-sm text-600 mt-2 text-center">
        Use su dedo o mouse para firmar dentro del recuadro.
      </p>
    </Dialog>
  );
}

export default SignatureDialog;
