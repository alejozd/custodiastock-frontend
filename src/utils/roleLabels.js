export const getRoleLabel = (role) => {
  const normalizedRole = String(role ?? "").toUpperCase();

  if (normalizedRole === "ADMIN") {
    return "ADMINISTRADOR";
  }

  if (normalizedRole === "OPERATOR") {
    return "OPERADOR";
  }

  return normalizedRole || "SIN ROL";
};
