import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import api from "../api/apiClient";

const emptyUser = { id: null, name: "", email: "", role: "" };

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userForm, setUserForm] = useState(emptyUser);
  const toast = useRef(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data?.data ?? response.data ?? []);
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreate = () => {
    setEditing(false);
    setUserForm(emptyUser);
    setDialogVisible(true);
  };

  const openEdit = (user) => {
    setEditing(true);
    setUserForm({
      id: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role ?? "",
    });
    setDialogVisible(true);
  };

  const saveUser = async () => {
    try {
      if (editing) {
        await api.put(`/users/${userForm.id}`, userForm);
      } else {
        await api.post("/users", userForm);
      }

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `User ${editing ? "updated" : "created"} successfully`,
      });
      setDialogVisible(false);
      setUserForm(emptyUser);
      loadUsers();
    } catch {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Unable to save user" });
    }
  };

  const deactivateUser = (user) => {
    confirmDialog({
      message: `Deactivate user ${user.name}?`,
      header: "Confirm deactivation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await api.patch(`/users/${user.id}/deactivate`);
          toast.current?.show({ severity: "success", summary: "User deactivated" });
          loadUsers();
        } catch {
          toast.current?.show({ severity: "error", summary: "Error", detail: "Unable to deactivate user" });
        }
      },
    });
  };

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => openEdit(rowData)} />
      <Button icon="pi pi-user-minus" rounded text severity="danger" onClick={() => deactivateUser(rowData)} />
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-3">
        <h1 className="text-900 m-0 text-2xl">Users Management</h1>
        <Button label="New User" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={users} loading={loading} paginator rows={10} responsiveLayout="scroll" dataKey="id">
        <Column field="name" header="Name" />
        <Column field="email" header="Email" />
        <Column field="role" header="Role" />
        <Column field="status" header="Status" />
        <Column header="Actions" body={actionsTemplate} style={{ width: "8rem" }} />
      </DataTable>

      <Dialog
        visible={dialogVisible}
        header={editing ? "Edit user" : "Create user"}
        onHide={() => setDialogVisible(false)}
        style={{ width: "34rem" }}
      >
        <div className="flex flex-column gap-3 pt-2">
          <span className="p-float-label">
            <InputText
              id="user-name"
              value={userForm.name}
              className="w-full"
              onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <label htmlFor="user-name">Name</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="user-email"
              value={userForm.email}
              className="w-full"
              onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <label htmlFor="user-email">Email</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="user-role"
              value={userForm.role}
              className="w-full"
              onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value }))}
            />
            <label htmlFor="user-role">Role</label>
          </span>

          <div className="flex justify-content-end gap-2 mt-2">
            <Button label="Cancel" text onClick={() => setDialogVisible(false)} />
            <Button label="Save" onClick={saveUser} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default Users;
