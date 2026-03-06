import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { FileUpload } from "primereact/fileupload";
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
  const toast = useRef(null);

  const handleUpload = async ({ files }) => {
    const file = files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const importResult = await productService.importProductsFromFile(file);
      setResult(importResult);

      toast.current?.show({
        severity: "success",
        summary: "Importación completada",
        detail: `Se importaron ${importResult.importedCount ?? 0} productos.`,
      });

      onImported?.();
    } catch (error) {
      const message = error.response?.data?.message || "No fue posible importar el archivo.";
      toast.current?.show({ severity: "error", summary: "Error de importación", detail: message, life: 4000 });
    } finally {
      setUploading(false);
    }
  };

  const invalidRows = result?.invalidRows ?? [];

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
          accept=".xlsx,.xls,.csv"
          multiple={false}
          maxFileSize={5_000_000}
          mode="advanced"
          chooseLabel="Seleccionar archivo"
          uploadLabel="Subir"
          cancelLabel="Limpiar"
          disabled={uploading}
          emptyTemplate={<p className="m-0">Arrastra un archivo aquí o usa el botón de selección.</p>}
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
