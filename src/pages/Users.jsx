import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { confirmDialog } from "primereact/confirmdialog";
import userService from "../services/userService";
import UserDialog from "../components/users/UserDialog";
import "../styles/Common.css";

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
          responsiveLayout="stack"
          breakpoint="960px"
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

      <UserDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        form={form}
        setForm={setForm}
        onSave={saveUser}
        saving={saving}
      />
    </div>
  );
}

export default Users;
