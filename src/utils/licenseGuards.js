export const shouldShowActivationScreen = (license) => {
  const nit = license?.nit;
  const nitMissing = nit === null || nit === undefined || String(nit).trim() === "";
  return license?.status === "PENDING_ACTIVATION" || nitMissing;
};
