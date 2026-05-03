import { useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";

function ActivationScreen({ onActivate, activating }) {
  const [nit, setNit] = useState("");

  return (
    <div className="license-page animate-fade-in">
      <Card className="license-card">
        <div className="flex flex-column gap-3">
          <h2 className="m-0">Activación requerida</h2>
          <p className="m-0 text-600">Debe ingresar NIT para activar la licencia.</p>
          <div className="flex flex-column gap-2">
            <label htmlFor="nitActivate" className="font-semibold">NIT</label>
            <InputText
              id="nitActivate"
              value={nit}
              onChange={(e) => setNit(e.target.value)}
              placeholder="Ej: 900123456"
            />
          </div>
          <Button
            icon="pi pi-key"
            label={activating ? "Activando licencia..." : "Activar licencia"}
            onClick={() => onActivate(nit)}
            loading={activating}
          />
        </div>
      </Card>
    </div>
  );
}

export default ActivationScreen;
