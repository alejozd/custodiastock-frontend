import { BrowserRouter } from "react-router-dom";
import { ConfirmDialog } from "primereact/confirmdialog";
import AppRouter from "./router/router";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConfirmDialog />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
