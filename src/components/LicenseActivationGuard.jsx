import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import licenseService from "../services/licenseService";
import { shouldShowActivationScreen } from "../utils/licenseGuards";

function LicenseActivationGuard() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [mustActivate, setMustActivate] = useState(false);

  useEffect(() => {
    const checkLicense = async () => {
      try {
        setLoading(true);
        const license = await licenseService.getLicenseStatus();
        setMustActivate(shouldShowActivationScreen(license));
      } catch {
        setMustActivate(false);
      } finally {
        setLoading(false);
      }
    };

    checkLicense();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex flex-column align-items-center gap-3 p-4">
        <ProgressSpinner strokeWidth="4" />
        <Message severity="info" text="Validando licencia..." />
      </div>
    );
  }

  if (mustActivate && location.pathname !== "/licencia") {
    return <Navigate to="/licencia" replace state={{ activationRequired: true }} />;
  }

  return <Outlet />;
}

export default LicenseActivationGuard;
