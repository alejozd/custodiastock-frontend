import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { FileUpload } from "primereact/fileupload";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import productService from "../../services/productService";

const sampleFormat = [
  {
    reference: "REF001",
    name: "Teclado",
    description: "Teclado mecánico",
    active: "true",
  },
];

function ProductImportDialog({ visible, onHide, onImported }) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileStatus, setFileStatus] = useState("idle");
  const toast = useRef(null);

  const handleSelect = (event) => {
    const file = event.files?.[0] ?? null;
    setSelectedFile(file);
    setFileStatus(file ? "pending" : "idle");
    setResult(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setFileStatus("idle");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setUploading(true);
      const importResult = await productService.importProductsFromFile(selectedFile);
      setResult(importResult);
      setFileStatus("completed");

      toast.current?.show({
        severity: "success",
        summary: "Importación completada",
        detail: `Se importaron ${importResult.importedCount ?? 0} productos.`,
      });

      onImported?.();
    } catch (error) {
      const message = error.response?.data?.message || "No fue posible importar el archivo.";
      toast.current?.show({ severity: "error", summary: "Error de importación", detail: message, life: 4000 });
      setFileStatus("pending");
    } finally {
      setUploading(false);
    }
  };

  const invalidRows = result?.invalidRows ?? [];
  const hasFile = Boolean(selectedFile);

  const uploadOptions = {
    label: "Subir",
    icon: "pi pi-upload",
    disabled: !hasFile || uploading || fileStatus === "completed",
  };

  const cancelOptions = {
    label: "Limpiar",
    icon: "pi pi-times",
    severity: "secondary",
    disabled: !hasFile || uploading || fileStatus === "completed",
  };

  const chooseOptions = {
    label: "Seleccionar archivo",
    icon: "pi pi-file",
  };

  const itemTemplate = (file) => {
    const statusLabel = fileStatus === "completed" ? "Completed" : "Pending";
    const statusSeverity = fileStatus === "completed" ? "success" : "warning";

    return (
      <div className="flex flex-wrap align-items-center justify-content-between gap-2 w-full">
        <div className="flex flex-column gap-1">
          <span className="font-semibold">{file.name}</span>
          <small className="text-600">{(file.size / 1024).toFixed(2)} KB</small>
        </div>
        <Tag value={statusLabel} severity={statusSeverity} />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      header="Importar productos desde Excel"
      onHide={onHide}
      style={{ width: "min(96vw, 54rem)" }}
      dismissableMask
    >
      <Toast ref={toast} />

      <div className="flex flex-column gap-3">
        <p className="m-0 text-700">
          Selecciona un archivo Excel o CSV para importar productos de forma masiva.
        </p>

        <div>
          <h4 className="mt-0 mb-2">Formato esperado</h4>
          <DataTable value={sampleFormat} size="small" responsiveLayout="scroll">
            <Column field="reference" header="reference" />
            <Column field="name" header="name" />
            <Column field="description" header="description" />
            <Column field="active" header="active" />
          </DataTable>
          <ul className="mt-2 mb-0 pl-3 text-700">
            <li>reference es obligatorio</li>
            <li>name es obligatorio</li>
            <li>description es opcional</li>
            <li>active es opcional (true/false)</li>
          </ul>
        </div>

        <FileUpload
          name="file"
          customUpload
          uploadHandler={handleUpload}
          onSelect={handleSelect}
          onClear={handleClear}
          accept=".xlsx,.xls,.csv"
          multiple={false}
          maxFileSize={5_000_000}
          mode="advanced"
          className="product-import-upload"
          chooseOptions={chooseOptions}
          uploadOptions={uploadOptions}
          cancelOptions={cancelOptions}
          disabled={uploading}
          itemTemplate={itemTemplate}
          emptyTemplate={<p className="m-0">Arrastra tu archivo aquí para importarlo.</p>}
        />

        {uploading && (
          <div className="flex align-items-center gap-2 text-primary font-medium">
            <i className="pi pi-spin pi-spinner" />
            <span>Subiendo y procesando archivo...</span>
          </div>
        )}

        {result && (
          <div className="surface-50 border-1 border-200 border-round p-3">
            <h4 className="mt-0 mb-3">Importación completada</h4>
            <div className="grid">
              <div className="col-12 sm:col-6 md:col-3"><strong>Total filas:</strong> {result.totalRows ?? 0}</div>
              <div className="col-12 sm:col-6 md:col-3"><strong>Filas válidas:</strong> {result.validRows ?? 0}</div>
              <div className="col-12 sm:col-6 md:col-3"><strong>Importadas:</strong> {result.importedCount ?? 0}</div>
              <div className="col-12 sm:col-6 md:col-3"><strong>Omitidas:</strong> {result.skippedCount ?? 0}</div>
            </div>

            {invalidRows.length > 0 && (
              <>
                <h5 className="mb-2">Filas inválidas</h5>
                <DataTable value={invalidRows} size="small" responsiveLayout="scroll">
                  <Column field="row" header="Fila" />
                  <Column
                    header="Razón del error"
                    body={(rowData) => rowData.reason || rowData.error || rowData.message || "Error de validación"}
                  />
                </DataTable>
              </>
            )}
          </div>
        )}

        <div className="flex justify-content-end">
          <Button label="Cerrar" severity="secondary" onClick={onHide} />
        </div>
      </div>
    </Dialog>
  );
}

export default ProductImportDialog;
