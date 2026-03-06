import { BrowserRouter } from "react-router-dom";
import { ConfirmDialog } from "primereact/confirmdialog";
import AppRouter from "./router/router";

function App() {
  return (
    <BrowserRouter>
      <ConfirmDialog />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
