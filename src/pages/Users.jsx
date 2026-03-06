import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import api from "../api/apiClient";

const emptyUser = { id: null, name: "", email: "", role: "OPERATOR", active: true };
const roles = [
  { label: "ADMIN", value: "ADMIN" },
  { label: "OPERATOR", value: "OPERATOR" },
];
const toList = (response) => response.data?.data ?? response.data ?? [];

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [form, setForm] = useState(emptyUser);
  const toast = useRef(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(toList(response));
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudieron cargar los usuarios." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreate = () => {
    setForm(emptyUser);
    setDialogVisible(true);
  };

  const openEdit = async (row) => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${row.id}`);
      const user = response.data?.data ?? response.data;
      setForm({
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        role: user.role ?? "OPERATOR",
        active: Boolean(user.active),
      });
      setDialogVisible(true);
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo cargar el usuario." });
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async () => {
    try {
      setSaving(true);
      if (form.id) {
        await api.put(`/users/${form.id}`, {
          name: form.name,
          email: form.email,
          role: form.role,
          active: form.active,
        });
      } else {
        await api.post("/users", {
          name: form.name,
          email: form.email,
          role: form.role,
        });
      }

      toast.current?.show({ severity: "success", summary: "Éxito", detail: "Usuario guardado correctamente." });
      setDialogVisible(false);
      setForm(emptyUser);
      loadUsers();
    } catch (error) {
      const message = error.response?.data?.message || "No fue posible guardar el usuario.";
      toast.current?.show({ severity: "error", summary: "Error", detail: message });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (row) => {
    confirmDialog({
      message: `¿Deseas eliminar al usuario ${row.name}?`,
      header: "Confirmar eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await api.delete(`/users/${row.id}`);
          toast.current?.show({ severity: "success", summary: "Usuario eliminado" });
          loadUsers();
        } catch {
          toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo eliminar el usuario." });
        }
      },
    });
  };

  const toggleActive = async (row) => {
    try {
      await api.put(`/users/${row.id}`, {
        name: row.name,
        email: row.email,
        role: row.role,
        active: !row.active,
      });
      toast.current?.show({ severity: "success", summary: "Estado actualizado" });
      loadUsers();
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo cambiar el estado." });
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <h1 className="m-0 text-2xl">Usuarios</h1>
        <Button label="Nuevo usuario" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={users} loading={loading} paginator rows={10} size="small" responsiveLayout="scroll" dataKey="id">
        <Column field="name" header="Nombre" />
        <Column field="email" header="Correo" />
        <Column field="role" header="Rol" />
        <Column
          header="Activo"
          body={(row) => (
            <InputSwitch checked={Boolean(row.active)} onChange={() => toggleActive(row)} aria-label="Estado activo" />
          )}
        />
        <Column
          header="Fecha creación"
          body={(row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString("es-CO") : "-")}
        />
        <Column
          header="Acciones"
          body={(row) => (
            <div className="flex gap-2">
              <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => openEdit(row)} />
              <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => confirmDelete(row)} />
            </div>
          )}
        />
      </DataTable>

      <Dialog
        visible={dialogVisible}
        header={form.id ? "Editar usuario" : "Crear usuario"}
        onHide={() => setDialogVisible(false)}
        style={{ width: "min(95vw, 34rem)" }}
      >
        <div className="flex flex-column gap-3 pt-2">
          <span className="p-float-label">
            <InputText
              id="name"
              value={form.name}
              className="w-full"
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <label htmlFor="name">Nombre</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="email"
              value={form.email}
              className="w-full"
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <label htmlFor="email">Correo</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              id="role"
              value={form.role}
              options={roles}
              className="w-full"
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.value }))}
            />
            <label htmlFor="role">Rol</label>
          </span>

          {form.id && (
            <div className="flex align-items-center justify-content-between border-1 border-200 border-round p-3">
              <span>Estado del usuario</span>
              <Tag severity={form.active ? "success" : "danger"} value={form.active ? "Activo" : "Inactivo"} />
            </div>
          )}

          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" text onClick={() => setDialogVisible(false)} />
            <Button label="Guardar" onClick={saveUser} loading={saving} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default Users;
