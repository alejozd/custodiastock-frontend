import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import api from "../api/apiClient";
import "../styles/Common.css";

const emptyForm = {
  id: null,
  name: "",
  prefix: "",
  nextNumber: 1,
};

function Sequences() {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const toast = useRef(null);

  const loadSequences = async () => {
    try {
      setLoading(true);
      const response = await api.get("/sequences");
      setSequences(response.data?.data ?? response.data ?? []);
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar las secuencias.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSequences();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setDialogVisible(true);
  };

  const openEdit = (row) => {
    setForm({ ...row });
    setDialogVisible(true);
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.prefix.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Atención",
        detail: "El nombre y el prefijo son obligatorios.",
      });
      return false;
    }
    return true;
  };

  const saveSequence = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      if (form.id) {
        await api.put(`/sequences/${form.id}`, form);
      } else {
        await api.post("/sequences", form);
      }

      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Secuencia guardada correctamente.",
      });
      setDialogVisible(false);
      loadSequences();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "No se pudo guardar la secuencia.",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteSequence = (row) => {
    confirmDialog({
      message: `¿Estás seguro de eliminar la secuencia "${row.name}"?`,
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await api.delete(`/sequences/${row.id}`);
          toast.current?.show({
            severity: "success",
            summary: "Eliminado",
            detail: "Secuencia eliminada correctamente.",
          });
          loadSequences();
        } catch {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "No se pudo eliminar la secuencia.",
          });
        }
      },
    });
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        text
        onClick={() => setDialogVisible(false)}
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={saveSequence}
        loading={saving}
      />
    </div>
  );

  return (
    <div className="sequences-container animate-fade-in">
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="m-0 page-title">Administración de Secuencias</h1>
          <p className="text-600 m-0">Gestiona los prefijos y consecutivos del sistema.</p>
        </div>
        <Button
          label="Nueva Secuencia"
          icon="pi pi-plus"
          onClick={openCreate}
        />
      </div>

      <div className="table-card">
        <DataTable
          value={sequences}
          loading={loading}
          paginator
          rows={10}
          className="p-datatable-modern"
          dataKey="id"
          responsiveLayout="stack"
          breakpoint="960px"
        >
          <Column field="name" header="Nombre / Identificador" className="font-bold" />
          <Column field="prefix" header="Prefijo" />
          <Column field="nextNumber" header="Próximo Número" />
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
                  onClick={() => deleteSequence(row)}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={form.id ? "Editar Secuencia" : "Nueva Secuencia"}
        visible={dialogVisible}
        style={{ width: "min(90vw, 400px)" }}
        footer={dialogFooter}
        onHide={() => setDialogVisible(false)}
        modal
      >
        <div className="flex flex-column gap-3 mt-2">
          <div className="flex flex-column gap-2">
            <label htmlFor="name" className="font-semibold">Nombre Identificador</label>
            <InputText
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })}
              placeholder="EJ: ENTREGA"
            />
            <small className="text-500">Usa mayúsculas para identificar la secuencia.</small>
          </div>
          <div className="flex flex-column gap-2">
            <label htmlFor="prefix" className="font-semibold">Prefijo</label>
            <InputText
              id="prefix"
              value={form.prefix}
              onChange={(e) => setForm({ ...form, prefix: e.target.value })}
              placeholder="EJ: ENT-"
            />
          </div>
          <div className="flex flex-column gap-2">
            <label htmlFor="nextNumber" className="font-semibold">Próximo Número</label>
            <InputNumber
              id="nextNumber"
              value={form.nextNumber}
              onValueChange={(e) => setForm({ ...form, nextNumber: e.value })}
              min={1}
              showButtons
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default Sequences;
