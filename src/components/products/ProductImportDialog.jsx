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
      const importResult =
        await productService.importProductsFromFile(selectedFile);
      setResult(importResult);
      setFileStatus("completed");

      toast.current?.show({
        severity: "success",
        summary: "Importación completada",
        detail: `Se importaron ${importResult.importedCount ?? 0} productos.`,
      });

      onImported?.();
    } catch (error) {
      const message =
        error.response?.data?.message || "No fue posible importar el archivo.";
      toast.current?.show({
        severity: "error",
        summary: "Error de importación",
        detail: message,
        life: 4000,
      });
      setFileStatus("pending");
    } finally {
      setUploading(false);
    }
  };

  const invalidRows = result?.invalidRows ?? [];

  const itemTemplate = (file) => {
    return (
      <div className="flex align-items-center p-3 border-round border-1 border-200 surface-50">
        <i className="pi pi-file-excel text-green-600 text-3xl mr-3" />
        <div className="flex flex-column flex-grow-1">
          <span className="font-bold text-900">{file.name}</span>
          <small className="text-600">{(file.size / 1024).toFixed(2)} KB</small>
        </div>
        <Tag
          value={fileStatus === "completed" ? "Listo" : "Pendiente"}
          severity={fileStatus === "completed" ? "success" : "warning"}
        />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-file-import text-primary text-xl"></i>
          <span className="font-bold">Importar Productos</span>
        </div>
      }
      onHide={onHide}
      style={{ width: "min(96vw, 50rem)" }}
      modal
      className="import-dialog"
    >
      <Toast ref={toast} />

      <div className="flex flex-column gap-4 mt-2">
        {/* Sección de Instrucciones */}
        <div className="surface-card p-3 border-round border-1 border-200">
          <div className="flex align-items-center gap-2 mb-3 text-primary">
            <i className="pi pi-info-circle font-bold"></i>
            <span className="font-bold uppercase text-sm">
              Instrucciones y Formato
            </span>
          </div>

          <DataTable
            value={sampleFormat}
            size="small"
            className="p-datatable-sm mb-3 border-1 border-100 border-round overflow-hidden"
          >
            <Column
              field="reference"
              header="reference"
              headerClassName="bg-gray-100 text-700 font-bold"
            />
            <Column
              field="name"
              header="name"
              headerClassName="bg-gray-100 text-700 font-bold"
            />
            <Column
              field="description"
              header="description"
              headerClassName="bg-gray-100 text-700 font-bold"
            />
            <Column
              field="active"
              header="active"
              headerClassName="bg-gray-100 text-700 font-bold"
            />
          </DataTable>

          <div className="grid text-sm text-600">
            <div className="col-12 md:col-6 flex align-items-center gap-2">
              <i className="pi pi-check-circle text-green-500"></i>
              <span>
                <strong>reference:</strong> Identificador único (obligatorio)
              </span>
            </div>
            <div className="col-12 md:col-6 flex align-items-center gap-2">
              <i className="pi pi-check-circle text-green-500"></i>
              <span>
                <strong>name:</strong> Nombre comercial (obligatorio)
              </span>
            </div>
          </div>
        </div>

        {/* Sección de Carga */}
        <FileUpload
          name="file"
          customUpload
          uploadHandler={handleUpload}
          onSelect={handleSelect}
          onClear={handleClear}
          accept=".xlsx,.xls,.csv"
          maxFileSize={5000000}
          mode="advanced"
          className="custom-fileupload"
          chooseOptions={{
            label: "Buscar Archivo",
            icon: "pi pi-search",
            className: "p-button-outlined",
          }}
          uploadOptions={{
            label: "Iniciar Importación",
            icon: "pi pi-cloud-upload",
          }}
          cancelOptions={{
            label: "Quitar",
            icon: "pi pi-trash",
            className: "p-button-danger p-button-text",
          }}
          disabled={uploading}
          itemTemplate={itemTemplate}
          emptyTemplate={
            <div className="flex flex-column align-items-center justify-content-center py-5 border-2 border-dashed border-300 border-round surface-50 text-400">
              <i className="pi pi-upload text-4xl mb-3" />
              <p className="m-0 font-medium text-lg">
                Arrastra tu archivo Excel aquí
              </p>
              <small>Formatos soportados: .xlsx, .xls, .csv</small>
            </div>
          }
        />

        {/* Resultados */}
        {result && (
          <div
            className={`p-4 border-round border-1 ${invalidRows.length > 0 ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}
          >
            <div className="flex align-items-center justify-content-between mb-3">
              <h4 className="m-0 flex align-items-center gap-2">
                <i
                  className={`pi ${invalidRows.length > 0 ? "pi-exclamation-circle text-orange-600" : "pi-check-circle text-green-600"}`}
                />
                Resumen de Importación
              </h4>
              <Tag
                severity={invalidRows.length > 0 ? "warning" : "success"}
                value={fileStatus.toUpperCase()}
              />
            </div>

            <div className="grid text-center">
              <div className="col-3">
                <div className="text-2xl font-bold text-900">
                  {result.totalRows}
                </div>
                <div className="text-xs uppercase text-600">Filas</div>
              </div>
              <div className="col-3">
                <div className="text-2xl font-bold text-green-600">
                  {result.importedCount}
                </div>
                <div className="text-xs uppercase text-600">Éxito</div>
              </div>
              <div className="col-3">
                <div className="text-2xl font-bold text-orange-600">
                  {result.skippedCount}
                </div>
                <div className="text-xs uppercase text-600">Omitidas</div>
              </div>
              <div className="col-3">
                <div className="text-2xl font-bold text-red-600">
                  {invalidRows.length}
                </div>
                <div className="text-xs uppercase text-600">Errores</div>
              </div>
            </div>

            {invalidRows.length > 0 && (
              <div className="mt-3">
                <DataTable
                  value={invalidRows}
                  size="small"
                  scrollable
                  scrollHeight="150px"
                  className="p-datatable-gridlines text-xs"
                >
                  <Column field="row" header="Fila" style={{ width: "50px" }} />
                  <Column
                    header="Error"
                    body={(r) => r.reason || "Error de formato"}
                    className="text-red-600"
                  />
                </DataTable>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-content-end gap-2 border-top-1 border-100 pt-3">
          <Button
            label="Cerrar ventana"
            text
            severity="secondary"
            onClick={onHide}
          />
        </div>
      </div>
    </Dialog>
  );
}

export default ProductImportDialog;
