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
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { confirmDialog } from "primereact/confirmdialog";
import userService from "../services/userService";
import "../styles/Users.css";

const emptyForm = {
  id: null,
  username: "",
  fullName: "",
  email: "",
  role: "OPERATOR",
  active: true,
  password: "",
  confirmPassword: "",
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
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar los usuarios.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Plantilla para la columna de Usuario (Avatar + Nombre)
  const userBodyTemplate = (row) => (
    <div className="flex align-items-center gap-3">
      <Avatar
        label={row.fullName?.charAt(0).toUpperCase()}
        shape="circle"
        className="user-table-avatar"
      />
      <div className="flex flex-column">
        <span className="font-bold text-900">{row.username}</span>
        <small className="text-600">{row.fullName}</small>
      </div>
    </div>
  );

  // Plantilla para el Rol (Badges)
  const roleBodyTemplate = (row) => {
    const severity = row.role === "ADMIN" ? "success" : "info";
    return (
      <Tag value={row.role} severity={severity} rounded className="px-3" />
    );
  };

  const statusBodyTemplate = (row) => (
    <div className="flex align-items-center gap-2">
      <InputSwitch
        checked={Boolean(row.active)}
        onChange={() => toggleActive(row)}
        className="p-inputswitch-sm"
      />
      <span className={`status-label ${row.active ? "active" : "inactive"}`}>
        {row.active ? "Activo" : "Inactivo"}
      </span>
    </div>
  );

  // ... (Tus funciones openCreate, openEdit, validateForm, saveUser, deleteUser, toggleActive se mantienen igual) ...

  const openCreate = () => {
    setForm(emptyForm);
    setDialogVisible(true);
  };

  const openEdit = async (row) => {
    try {
      setLoading(true);
      const item = await userService.getUserById(row.id);
      setForm({
        ...item,
        active: Boolean(item.active),
        password: "",
        confirmPassword: "",
      });
      setDialogVisible(true);
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar el usuario.",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const payload = { ...form };
      delete payload.confirmPassword;
      if (!payload.password) delete payload.password;

      if (form.id) await userService.updateUser(form.id, payload);
      else await userService.createUser(payload);

      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Usuario guardado.",
      });
      setDialogVisible(false);
      loadUsers();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Error al guardar, " + error.message,
      });
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
      accept: async () => {
        try {
          await userService.deleteUser(row.id);
          toast.current?.show({ severity: "success", summary: "Eliminado" });
          loadUsers();
        } catch {
          toast.current?.show({ severity: "error", summary: "Error" });
        }
      },
    });
  };

  const toggleActive = async (row) => {
    try {
      await userService.updateUser(row.id, { ...row, active: !row.active });
      loadUsers();
    } catch {
      toast.current?.show({ severity: "error", summary: "Error" });
    }
  };

  const validateForm = () => {
    if (!form.username.trim() || !form.fullName.trim() || !form.email.trim()) {
      toast.current?.show({ severity: "warn", summary: "Campos vacíos" });
      return false;
    }
    return true;
  };

  return (
    <div className="users-container animate-fade-in">
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="m-0 page-title">Gestión de Usuarios</h1>
          <p className="text-600 m-0">
            Administra los accesos y roles del personal.
          </p>
        </div>
        <Button
          label="Nuevo Usuario"
          icon="pi pi-plus"
          className="p-button-raised p-button-primary"
          onClick={openCreate}
        />
      </div>

      <div className="table-card">
        <DataTable
          value={users}
          loading={loading}
          paginator
          rows={10}
          className="p-datatable-modern"
          dataKey="id"
          emptyMessage="No se encontraron usuarios."
        >
          <Column
            header="Usuario"
            body={userBodyTemplate}
            style={{ minWidth: "14rem" }}
          />
          <Column field="email" header="Email" />
          <Column header="Rol" body={roleBodyTemplate} />
          <Column header="Estado" body={statusBodyTemplate} />
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
                  onClick={() => deleteUser(row)}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        visible={dialogVisible}
        header={
          <div className="flex align-items-center gap-2">
            <i
              className={`pi ${form.id ? "pi-user-edit" : "pi-user-plus"} text-primary text-xl`}
            ></i>
            <span className="font-bold">
              {form.id ? "Modificar Perfil" : "Registrar Nuevo Usuario"}
            </span>
          </div>
        }
        onHide={() => setDialogVisible(false)}
        className="user-dialog"
        style={{ width: "45rem" }}
        breakpoints={{ "960px": "75vw", "641px": "95vw" }}
        modal
        footer={
          <div className="flex justify-content-end gap-2 p-3">
            <Button
              label="Cancelar"
              text
              severity="secondary"
              onClick={() => setDialogVisible(false)}
            />
            <Button
              label="Guardar Usuario"
              icon="pi pi-check"
              onClick={saveUser}
              loading={saving}
            />
          </div>
        }
      >
        <div className="form-grid mt-2 p-fluid">
          {/* Username */}
          <div className="field">
            <label>Username</label>
            <span className="p-input-icon-left">
              <i className="pi pi-at" />
              <InputText
                value={form.username}
                placeholder="usuario.ejemplo"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </span>
          </div>

          {/* Rol */}
          <div className="field">
            <label>Rol de Acceso</label>
            <Dropdown
              value={form.role}
              options={roleOptions}
              onChange={(e) => setForm({ ...form, role: e.value })}
            />
          </div>

          {/* Nombre Completo - Ocupa todo el ancho */}
          <div className="field col-full">
            <label>Nombre Completo</label>
            <span className="p-input-icon-left">
              <i className="pi pi-user" />
              <InputText
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </span>
          </div>

          {/* Email - Ocupa todo el ancho */}
          <div className="field col-full">
            <label>Email</label>
            <span className="p-input-icon-left">
              <i className="pi pi-envelope" />
              <InputText
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </span>
          </div>

          {/* Separador */}
          <div className="col-full flex align-items-center gap-2 my-2">
            <small className="font-bold text-600 uppercase">Seguridad</small>
            <div className="flex-grow-1 border-bottom-1 border-100"></div>
          </div>

          {/* Contraseñas */}
          <div className="field">
            <label>Contraseña</label>
            <Password
              value={form.password}
              toggleMask
              feedback={false}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Confirmar</label>
            <Password
              value={form.confirmPassword}
              toggleMask
              feedback={false}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
          </div>

          {/* Switch de Estado */}
          <div className="status-container">
            <div className="flex flex-column">
              <span className="font-bold text-900">Usuario Activo</span>
              <small className="text-600">Habilitar acceso al sistema</small>
            </div>
            <InputSwitch
              checked={Boolean(form.active)}
              onChange={(e) => setForm({ ...form, active: e.value })}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default Users;
