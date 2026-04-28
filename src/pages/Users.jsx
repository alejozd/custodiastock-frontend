import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
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
import { getAvatarColor } from "../utils/avatarColors";
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
  const { currentUser } = useAuth();
  const authenticatedUsername = String(currentUser?.username ?? "").toLowerCase();
  const isAuthenticatedAlejo = authenticatedUsername === "alejo";

  const isProtectedAlejoUser = (row) =>
    String(row?.username ?? "").toLowerCase() === "alejo";

  const canModifyUser = (row) => !isProtectedAlejoUser(row) || isAuthenticatedAlejo;

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
    <div className="flex align-items-center gap-3 w-full">
      <Avatar
        label={row.fullName?.charAt(0).toUpperCase()}
        shape="circle"
        className="user-table-avatar text-white shadow-2"
        style={{
          backgroundColor: getAvatarColor(row.fullName),
          minWidth: '48px',
          minHeight: '48px',
          fontSize: '1.25rem',
          border: '2px solid white'
        }}
      />
      <div className="flex flex-column flex-1 overflow-hidden">
        <div className="flex align-items-center justify-content-between gap-2">
            <span className="font-bold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis" style={{ fontSize: '1.15rem' }}>
                {row.fullName}
            </span>
            <Tag
                value={row.role}
                severity={row.role === "ADMIN" ? "success" : "info"}
                rounded
                className="mobile-only px-2"
                style={{ fontSize: '0.65rem', fontWeight: '700' }}
            />
        </div>
        <small className="text-600 font-medium">@{row.username}</small>

        {/* Información adicional visible solo en móvil dentro de la primera columna (Card Body) */}
        <div className="mobile-only mt-2">
            <div className="flex flex-column gap-2 border-top-1 border-100 pt-2">
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-envelope text-primary text-xs"></i>
                    <span className="text-600 text-sm font-medium">{row.email}</span>
                </div>
                <div className="flex align-items-center justify-content-between mt-1">
                    <span className={`status-label ${row.active ? "active" : "inactive"}`} style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem' }}>
                        {row.active ? "Activo" : "Inactivo"}
                    </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  const roleBodyTemplate = (row) => {
    const severity = row.role === "ADMIN" ? "success" : "info";
    return (
      <div className="flex md:justify-content-start justify-content-end w-full md:w-auto">
        <Tag value={row.role} severity={severity} rounded className="px-3" />
      </div>
    );
  };

  const statusBodyTemplate = (row) => (
    <div className="flex align-items-center gap-2 md:justify-content-start justify-content-end">
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
    if (!canModifyUser(row)) {
      toast.current?.show({
        severity: "warn",
        summary: "Acción no permitida",
        detail: "Este usuario solo puede ser modificado por sí mismo.",
      });
      return;
    }

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
      const backendMessage =
        error?.response?.status === 403
          ? "No tiene permisos para modificar este usuario."
          : null;

      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: backendMessage ?? "Error al guardar, " + error.message,
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

    if (!form.id && !form.password) {
      toast.current?.show({
        severity: "warn",
        summary: "Contraseña requerida",
        detail: "Debe ingresar una contraseña para el nuevo usuario.",
      });
      return false;
    }

    if (form.password !== form.confirmPassword) {
      toast.current?.show({
        severity: "error",
        summary: "Error de validación",
        detail: "Las contraseñas no coinciden.",
      });
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
          icon="pi pi-plus"
          className="p-button-raised p-button-primary"
          onClick={openCreate}
        >
          <span className="hidden md:inline ml-2">Nuevo Usuario</span>
        </Button>
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
          pt={{
            thead: { className: 'mobile-hidden' }
          }}
        >
          <Column
            header="Usuario"
            body={userBodyTemplate}
            style={{ minWidth: "14rem" }}
            pt={{
                columnTitle: { className: 'mobile-hidden' }
            }}
          />
          <Column field="email" header="Email" className="mobile-hidden" />
          <Column header="Rol" body={roleBodyTemplate} className="mobile-hidden" />
          <Column field="active" header="Estado" body={statusBodyTemplate} className="mobile-hidden" />
          <Column
            header="Acciones"
            pt={{
                columnTitle: { className: 'mobile-hidden' }
            }}
            body={(row) => (
              <div className="flex gap-1 md:justify-content-start justify-content-center">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="info"
                  tooltip={
                    canModifyUser(row)
                      ? "Editar"
                      : "Este usuario solo puede ser modificado por sí mismo."
                  }
                  tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
                  onClick={() => openEdit(row)}
                  disabled={!canModifyUser(row)}
                />
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  tooltip="Eliminar"
                  tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
                  onClick={() => deleteUser(row)}
                />
                {!canModifyUser(row) && (
                  <small className="text-600 ml-2" title="Este usuario solo puede ser modificado por sí mismo.">
                    <i className="pi pi-lock mr-1"></i>
                    Protegido
                  </small>
                )}
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
