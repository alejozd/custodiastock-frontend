import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import userService from "../services/userService";

const emptyForm = {
  id: null,
  username: "",
  fullName: "",
  email: "",
  role: "OPERATOR",
  active: true,
  password: "",
};

const roleOptions = [
  { label: "ADMIN", value: "ADMIN" },
  { label: "OPERATOR", value: "OPERATOR" },
];

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const toast = useRef(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const list = await userService.getUsers();
      setUsers(list);
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
    setForm(emptyForm);
    setDialogVisible(true);
  };

  const openEdit = async (row) => {
    try {
      setLoading(true);
      const item = await userService.getUserById(row.id);
      setForm({
        id: item.id,
        username: item.username ?? "",
        fullName: item.fullName ?? "",
        email: item.email ?? "",
        role: item.role ?? "OPERATOR",
        active: Boolean(item.active),
        password: "",
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
      const payload = {
        username: form.username,
        fullName: form.fullName,
        email: form.email,
        role: form.role,
        active: form.active,
      };

      if (form.password) {
        payload.password = form.password;
      }

      if (form.id) {
        await userService.updateUser(form.id, payload);
      } else {
        await userService.createUser(payload);
      }

      toast.current?.show({ severity: "success", summary: "Éxito", detail: "Usuario guardado correctamente." });
      setDialogVisible(false);
      setForm(emptyForm);
      loadUsers();
    } catch (error) {
      const message = error.response?.data?.message || "No se pudo guardar el usuario.";
      toast.current?.show({ severity: "error", summary: "Error", detail: message });
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = (row) => {
    confirmDialog({
      message: `¿Eliminar usuario ${row.username}?`,
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await userService.deleteUser(row.id);
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
      await userService.updateUser(row.id, {
        username: row.username,
        fullName: row.fullName,
        email: row.email,
        role: row.role,
        active: !row.active,
      });
      loadUsers();
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "No se pudo cambiar el estado." });
    }
  };

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-3">
        <h1 className="m-0 text-2xl">Usuarios</h1>
        <Button label="Nuevo" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={users} loading={loading} paginator rows={10} responsiveLayout="scroll" dataKey="id" size="small">
        <Column field="username" header="Username" />
        <Column field="fullName" header="Nombre completo" />
        <Column field="email" header="Email" />
        <Column field="role" header="Rol" />
        <Column
          header="Activo"
          body={(row) => <InputSwitch checked={Boolean(row.active)} onChange={() => toggleActive(row)} />}
        />
        <Column
          header="Creado en"
          body={(row) => (row.createdAt ? new Date(row.createdAt).toLocaleString("es-CO") : "-")}
        />
        <Column
          header="Acciones"
          body={(row) => (
            <div className="flex gap-2">
              <Button icon="pi pi-pencil" text rounded severity="info" onClick={() => openEdit(row)} />
              <Button icon="pi pi-trash" text rounded severity="danger" onClick={() => deleteUser(row)} />
            </div>
          )}
        />
      </DataTable>

      <Dialog
        visible={dialogVisible}
        header={form.id ? "Editar usuario" : "Crear usuario"}
        onHide={() => setDialogVisible(false)}
        style={{ width: "min(95vw, 36rem)" }}
      >
        <div className="flex flex-column gap-3 mt-2">
          <span className="p-float-label">
            <InputText id="username" value={form.username} className="w-full" onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} />
            <label htmlFor="username">Username</label>
          </span>

          <span className="p-float-label">
            <InputText id="fullName" value={form.fullName} className="w-full" onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
            <label htmlFor="fullName">Nombre completo</label>
          </span>

          <span className="p-float-label">
            <InputText id="email" value={form.email} className="w-full" onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            <label htmlFor="email">Email</label>
          </span>

          <span className="p-float-label">
            <Dropdown id="role" value={form.role} options={roleOptions} className="w-full" onChange={(e) => setForm((p) => ({ ...p, role: e.value }))} />
            <label htmlFor="role">Rol</label>
          </span>

          <span className="p-float-label">
            <Password id="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="w-full" inputClassName="w-full" feedback={false} toggleMask />
            <label htmlFor="password">Contraseña (opcional)</label>
          </span>

          <div className="flex align-items-center justify-content-between border-1 border-200 border-round p-3">
            <span>Activo</span>
            <InputSwitch checked={Boolean(form.active)} onChange={(e) => setForm((p) => ({ ...p, active: e.value }))} />
          </div>

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
