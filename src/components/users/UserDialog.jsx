import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';

const roleOptions = [
  { label: "ADMIN", value: "ADMIN" },
  { label: "OPERATOR", value: "OPERATOR" },
];

const UserDialog = ({ visible, onHide, form, setForm, onSave, saving }) => {
  return (
    <Dialog
      visible={visible}
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
      onHide={onHide}
      className="user-dialog"
      style={{ width: "45rem" }}
      breakpoints={{ "960px": "75vw", "641px": "95vw" }}
      modal
      footer={
        <div className="flex justify-content-end gap-2 p-3 border-top-1 border-100">
          <Button
            label="Cancelar"
            text
            severity="secondary"
            onClick={onHide}
            className="px-4"
          />
          <Button
            label="Guardar Usuario"
            icon="pi pi-check"
            onClick={onSave}
            loading={saving}
            className="px-4"
          />
        </div>
      }
    >
      <div className="grid mt-2 p-fluid">
        {/* Username */}
        <div className="col-12 md:col-6 field">
          <label className="font-bold">Username</label>
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
        <div className="col-12 md:col-6 field">
          <label className="font-bold">Rol de Acceso</label>
          <Dropdown
            value={form.role}
            options={roleOptions}
            onChange={(e) => setForm({ ...form, role: e.value })}
          />
        </div>

        {/* Nombre Completo - Ocupa todo el ancho */}
        <div className="col-12 field">
          <label className="font-bold">Nombre Completo</label>
          <span className="p-input-icon-left">
            <i className="pi pi-user" />
            <InputText
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </span>
        </div>

        {/* Email - Ocupa todo el ancho */}
        <div className="col-12 field">
          <label className="font-bold">Email</label>
          <span className="p-input-icon-left">
            <i className="pi pi-envelope" />
            <InputText
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </span>
        </div>

        {/* Separador */}
        <div className="col-12 flex align-items-center gap-2 my-2">
          <small className="font-bold text-600 uppercase">Seguridad</small>
          <div className="flex-grow-1 border-bottom-1 border-100"></div>
        </div>

        {/* Contraseñas */}
        <div className="col-12 md:col-6 field">
          <label className="font-bold">Contraseña</label>
          <Password
            value={form.password}
            toggleMask
            feedback={false}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full"
            inputClassName="w-full"
          />
        </div>

        <div className="col-12 md:col-6 field">
          <label className="font-bold">Confirmar</label>
          <Password
            value={form.confirmPassword}
            toggleMask
            feedback={false}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            className="w-full"
            inputClassName="w-full"
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
  );
};

export default UserDialog;
