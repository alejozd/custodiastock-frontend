# CustodiaStock - Sistema de Control de Inventario

CustodiaStock es una solución moderna y eficiente para la gestión y control de inventarios, diseñada para facilitar el seguimiento de productos, entradas, entregas y reportes de stock en tiempo real.

## 🚀 Características Principales

- **Dashboard Informativo:** Visualización rápida de métricas clave como total de productos, usuarios activos, y resumen de movimientos.
- **Gestión de Productos:** Catálogo completo con referencias únicas y estados.
- **Control de Usuarios:** Sistema de roles (ADMIN y OPERATOR) con control de acceso.
- **Entradas de Inventario:** Registro detallado de nuevos suministros.
- **Entregas (Salidas):** Gestión de entregas con captura de firmas y generación de comprobantes.
- **Reporte de Stock:** Seguimiento en tiempo real de existencias con filtros avanzados y exportación a Excel.
- **Historial Detallado:** Trazabilidad completa de todos los movimientos por producto y usuario.
- **Diseño Responsivo:** Interfaz optimizada para dispositivos móviles y escritorio.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19, Vite
- **UI Components:** PrimeReact, PrimeIcons, PrimeFlex
- **Estado y Navegación:** React Router 7, Context API
- **Estilos:** CSS3 con metodología modular y PrimeFlex
- **Pruebas:** Playwright (E2E Testing)
- **Exportación:** ExcelJS

## 📦 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd CustodiaStock
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## 🧪 Pruebas (Testing)

El proyecto utiliza Playwright para pruebas de extremo a extremo (E2E).

1. **Instalar navegadores de Playwright:**
   ```bash
   npx playwright install
   ```

2. **Ejecutar todas las pruebas:**
   ```bash
   npx playwright test
   ```

3. **Ver resultados de las pruebas:**
   ```bash
   npx playwright show-report
   ```

## 📂 Estructura del Proyecto

- `src/api`: Configuración del cliente API (Axios).
- `src/components`: Componentes reutilizables organizados por módulos.
- `src/context`: Proveedores de contexto (Autenticación).
- `src/layouts`: Estructuras de página principales.
- `src/pages`: Vistas principales de la aplicación.
- `src/styles`: Archivos de estilos CSS.
- `tests/`: Suite de pruebas E2E con Playwright.

---
Desarrollado por **ZambranoSoft** - 2026
