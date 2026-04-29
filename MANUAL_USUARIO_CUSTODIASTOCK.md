# 📘 Manual de Usuario - CustodiaStock
## Sistema de Gestión de Inventarios y Entregas

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Primeros Pasos](#2-primeros-pasos)
3. [Módulo de Autenticación](#3-módulo-de-autenticación)
4. [Dashboard Principal](#4-dashboard-principal)
5. [Gestión de Productos](#5-gestión-de-productos)
6. [Gestión de Usuarios](#6-gestión-de-usuarios)
7. [Registro de Entradas](#7-registro-de-entradas)
8. [Registro de Entregas](#8-registro-de-entregas)
9. [Reporte de Stock](#9-reporte-de-stock)
10. [Configuración de Secuencias](#10-configuración-de-secuencias)
11. [Preguntas Frecuentes](#11-preguntas-frecuentes)
12. [Soporte Técnico](#12-soporte-técnico)

---

## 1. Introducción

### ¿Qué es CustodiaStock?

CustodiaStock es un sistema web para gestionar inventarios, entradas y entregas de productos. Permite llevar un control detallado de:

- ✅ Productos almacenados
- ✅ Entradas al inventario
- ✅ Entregas a clientes o áreas
- ✅ Usuarios del sistema
- ✅ Reportes de stock en tiempo real

### Roles de Usuario

El sistema cuenta con dos tipos de usuarios:

| Rol | Permisos | Restricciones |
|-----|----------|---------------|
| **ADMIN** | Acceso completo a todas las funciones | Ninguna |
| **OPERATOR** | Crear/editar productos, registrar entradas y entregas | No puede cancelar documentos ni ver reportes de stock |

### Requisitos Técnicos

- Navegador web actualizado (Chrome, Firefox, Edge, Safari)
- Conexión a internet
- Resolución mínima recomendada: 1024x768 píxeles

---

## 2. Primeros Pasos

### 2.1 Accediendo al Sistema

```
┌─────────────────────────────────────────┐
│         CUSTODIASTOCK                   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  👤 Usuario                     │   │
│   │  [__________________________]   │   │
│   │                                 │   │
│   │  🔒 Contraseña                  │   │
│   │  [__________________________]   │   │
│   │                                 │   │
│   │  [🔑 Iniciar Sesión]            │   │
│   └─────────────────────────────────┘   │
│                                         │
│   © 2025 CustodiaStock v1.0             │
└─────────────────────────────────────────┘
```

**Pasos:**

1. Abra su navegador web
2. Ingrese la URL del sistema (proporcionada por su administrador)
3. Verá la pantalla de inicio de sesión mostrada arriba
4. Continúe con las credenciales proporcionadas

### 2.2 Credenciales por Defecto

Si es su primera vez, use las credenciales iniciales:

| Campo | Valor |
|-------|-------|
| **Usuario** | `alejo` |
| **Contraseña** | `Pascal123*` |

⚠️ **IMPORTANTE**: Cambie su contraseña después del primer inicio de sesión por seguridad.

---

## 3. Módulo de Autenticación

### 3.1 Iniciar Sesión

**Paso a paso:**

1. Ingrese su nombre de usuario en el campo "Usuario"
2. Ingrese su contraseña en el campo "Contraseña"
3. Haga clic en el botón **"🔑 Iniciar Sesión"**

**Resultado exitoso:**

```
┌─────────────────────────────────────────┐
│  ✅ Bienvenido, Carlos Rojas            │
│                                         │
│  Redirigiendo al Dashboard...           │
└─────────────────────────────────────────┘
```

**Posibles errores:**

| Mensaje de Error | Causa | Solución |
|------------------|-------|----------|
| ❌ "Username and password are required" | Campos vacíos | Complete ambos campos |
| ❌ "Invalid credentials" | Usuario o contraseña incorrectos | Verifique sus credenciales |
| ❌ "User is inactive" | Su cuenta ha sido desactivada | Contacte al administrador |

### 3.2 Cerrar Sesión

Para cerrar sesión:

1. Haga clic en su nombre en la esquina superior derecha
2. Seleccione **"Cerrar sesión"**
3. Será redirigido a la pantalla de login

⚠️ **Nota**: Por seguridad, la sesión expira automáticamente después de 8 horas.

---

## 4. Dashboard Principal

### 4.1 Vista General

Después de iniciar sesión, verá el Dashboard:

```
┌──────────────────────────────────────────────────────────────┐
│  ☰  CUSTODIASTOCK          👤 Carlos Rojas (ADMIN)      [⚙] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 DASHBOARD                                                │
│                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│  │ 📦 PRODUCTOS│ │ 📥 ENTRADAS │ │ 📤 ENTREGAS │ │ ⚠️ ALERT│ │
│  │    150      │ │     45      │ │     38      │ │   5    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📈 MOVIMIENTOS RECIENTES                               │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 20/05/2025 | ENTR-000001 | Entrada | +10 Lavamanos    │  │
│  │ 21/05/2025 | ENT-000001  | Entrega | -3 Lavamanos     │  │
│  │ 22/05/2025 | ENTR-000002 | Entrada | +20 Griferías    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Tarjetas de Métricas

| Tarjeta | Descripción |
|---------|-------------|
| **📦 PRODUCTOS** | Total de productos registrados en el sistema |
| **📥 ENTRADAS** | Número total de entradas registradas |
| **📤 ENTREGAS** | Número total de entregas realizadas |
| **⚠️ ALERTAS** | Productos con stock bajo (menos de 5 unidades) |

### 4.3 Movimientos Recientes

Muestra las últimas 10 operaciones realizadas en el sistema:

- **Fecha**: Día de la operación
- **Documento**: Número consecutivo (ENTR-xxxxxx o ENT-xxxxxx)
- **Tipo**: Entrada o Entrega
- **Detalle**: Cantidad y producto afectado

---

## 5. Gestión de Productos

### 5.1 Ver Lista de Productos

**Navegación**: Menú lateral → **"Productos"**

```
┌──────────────────────────────────────────────────────────────┐
│  📦 PRODUCTOS                                      [+ Nuevo] │
├──────────────────────────────────────────────────────────────┤
│  🔍 Buscar: [____________________]  [🔎 Buscar]              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ID │ Referencia  │ Nombre           │ Estado │ Acciones│  │
│  ├────┼─────────────┼──────────────────┼────────┼─────────┤  │
│  │ 1  │ LVM-001     │ Lavamanos Delta  │ ✅ Act.│ ✏️ 🗑️   │  │
│  │ 2  │ GRF-002     │ Grifería Chrome  │ ✅ Act.│ ✏️ 🗑️   │  │
│  │ 3  │ ESP-003     │ Espejo 60x80     │ ❌ Ina.│ ✏️ 🗑️   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Mostrando 3 de 150 productos                                │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Crear Nuevo Producto

**Opción A: Botón "+ Nuevo"**

1. Haga clic en **"+ Nuevo"** (esquina superior derecha)
2. Complete el formulario:

```
┌─────────────────────────────────────────┐
│  ➕ NUEVO PRODUCTO                      │
├─────────────────────────────────────────┤
│                                         │
│  Referencia *                           │
│  [__________________________]           │
│                                         │
│  Nombre *                               │
│  [__________________________]           │
│                                         │
│  Descripción                            │
│  [__________________________]           │
│                                         │
│  ☑️ Activo                              │
│                                         │
│  [💾 Guardar]  [❌ Cancelar]             │
└─────────────────────────────────────────┘
```

**Campos requeridos:**

| Campo | Tipo | Ejemplo | Notas |
|-------|------|---------|-------|
| **Referencia** | Texto | `LVM-001` | Debe ser único |
| **Nombre** | Texto | `Lavamanos Delta` | Nombre comercial |
| **Descripción** | Texto | `Lavamanos cerámico blanco` | Opcional |
| **Activo** | Checkbox | ☑️ | Por defecto activado |

3. Haga clic en **"💾 Guardar"**

**Éxito:**
```
✅ Producto creado exitosamente
```

**Errores comunes:**

| Mensaje | Causa | Solución |
|---------|-------|----------|
| ❌ "Missing required product fields" | Faltan campos obligatorios | Complete Referencia y Nombre |
| ❌ "Product reference already in use" | La referencia ya existe | Use una referencia diferente |

---

### 5.3 Editar Producto

1. En la lista de productos, haga clic en **✏️** (editar) junto al producto
2. Modifique los campos necesarios
3. Haga clic en **"💾 Guardar"**

⚠️ **Nota**: Si cambia la referencia, asegúrese de que no esté en uso por otro producto.

---

### 5.4 Eliminar Producto

1. En la lista de productos, haga clic en **🗑️** (eliminar) junto al producto
2. Confirme la acción en el diálogo:

```
┌─────────────────────────────────────────┐
│  ⚠️ CONFIRMAR ELIMINACIÓN               │
├─────────────────────────────────────────┤
│                                         │
│  ¿Está seguro de eliminar este          │
│  producto?                              │
│                                         │
│  Esta acción no se puede deshacer.      │
│                                         │
│  [❌ Cancelar]  [🗑️ Eliminar]           │
└─────────────────────────────────────────┘
```

3. Haga clic en **"🗑️ Eliminar"**

⚠️ **Importante**: La eliminación es lógica (soft delete). El producto se marca como eliminado pero permanece en la base de datos para mantener el historial.

---

### 5.5 Importar Productos desde Excel

**Funcionalidad exclusiva para ADMIN**

**Paso a paso:**

1. Haga clic en **"+ Nuevo"** → Pestaña **"📁 Importar Excel"**

```
┌─────────────────────────────────────────┐
│  📁 IMPORTAR PRODUCTDES DESDE EXCEL     │
├─────────────────────────────────────────┤
│                                         │
│  Formato requerido:                     │
│  ┌──────────────────────────────────┐   │
│  │ reference │ name │ description   │   │
│  │ LVM-001   │ Lava..│ Cerámico...  │   │
│  │ GRF-002   │ Grif..│ Cromado...   │   │
│  └──────────────────────────────────┘   │
│                                         │
│  Seleccionar archivo:                   │
│  [📄 Seleccionar .xlsx]                 │
│                                         │
│  [📤 Importar]  [❌ Cancelar]            │
└─────────────────────────────────────────┘
```

2. Prepare su archivo Excel con las siguientes columnas:

| Columna | Requerida | Ejemplo | Notas |
|---------|-----------|---------|-------|
| **reference** | ✅ Sí | `LVM-001` | Debe ser única |
| **name** | ✅ Sí | `Lavamanos Delta` | Nombre del producto |
| **description** | ❌ No | `Cerámico blanco` | Opcional |
| **active** | ❌ No | `true` | true/false (default: true) |

3. Haga clic en **"📄 Seleccionar .xlsx"** y elija su archivo
4. Haga clic en **"📤 Importar"**

**Resultado de importación:**

```
┌─────────────────────────────────────────┐
│  📊 RESULTADO DE IMPORTACIÓN            │
├─────────────────────────────────────────┤
│                                         │
│  Total de filas:        10              │
│  Filas válidas:         8               │
│  Importados:            6 ✅            │
│  Saltados (duplicados): 2 ⚠️            │
│                                         │
│  Errores:                               │
│  • Fila 4: reference is required        │
│  • Fila 7: name is required             │
│                                         │
│  [✅ Entendido]                         │
└─────────────────────────────────────────┘
```

**Errores comunes:**

| Mensaje | Causa | Solución |
|---------|-------|----------|
| ❌ "file is required (.xlsx)" | No seleccionó archivo | Seleccione un archivo |
| ❌ "Only .xlsx files are allowed" | Archivo incorrecto | Use solo archivos .xlsx |
| ❌ Máximo 5MB | Archivo muy grande | Reduzca el tamaño del archivo |

---

## 6. Gestión de Usuarios

### 6.1 Ver Lista de Usuarios

**Navegación**: Menú lateral → **"Usuarios"** (solo ADMIN)

```
┌──────────────────────────────────────────────────────────────┐
│  👥 USUARIOS                                       [+ Nuevo] │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ID │ Usuario │ Nombre       │ Email           │ Rol    │  │
│  ├────┼─────────┼──────────────┼─────────────────┼────────┤  │
│  │ 1  │ alejo   │ Carlos Rojas │ carlos@emp.com  │ ADMIN  │  │
│  │ 2  │ diego   │ Diego López  │ diego@emp.com   │ OPERAT │  │
│  │ 3  │ lady    │ Lady Real    │ lady@emp.com    │ OPERAT │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Crear Nuevo Usuario

1. Haga clic en **"+ Nuevo"**
2. Complete el formulario:

```
┌─────────────────────────────────────────┐
│  ➕ NUEVO USUARIO                       │
├─────────────────────────────────────────┤
│                                         │
│  Usuario *                              │
│  [__________________________]           │
│                                         │
│  Nombre Completo *                      │
│  [__________________________]           │
│                                         │
│  Email                                  │
│  [__________________________]           │
│                                         │
│  Contraseña *                           │
│  [__________________________]           │
│                                         │
│  Rol *                                  │
│  [▼ ADMINISTRADOR         ]             │
│                                         │
│  ☑️ Activo                              │
│                                         │
│  [💾 Guardar]  [❌ Cancelar]             │
└─────────────────────────────────────────┘
```

**Campos requeridos:**

| Campo | Tipo | Ejemplo | Notas |
|-------|------|---------|-------|
| **Usuario** | Texto | `juan.perez` | Único, sin espacios |
| **Nombre Completo** | Texto | `Juan Pérez` | Nombre real |
| **Email** | Email | `juan@empresa.com` | Opcional, debe ser único |
| **Contraseña** | Password | `Secure123!` | Mínimo 8 caracteres |
| **Rol** | Select | `ADMIN` o `OPERATOR` | Define permisos |
| **Activo** | Checkbox | ☑️ | Determina si puede acceder |

3. Haga clic en **"💾 Guardar"**

**Errores comunes:**

| Mensaje | Causa | Solución |
|---------|-------|----------|
| ❌ "Missing required user fields" | Faltan campos | Complete Usuario, Nombre, Contraseña y Rol |
| ❌ "Username or email already in use" | Ya existe | Use otro usuario o email |
| ❌ "Invalid role" | Rol inválido | Seleccione ADMIN u OPERATOR |

---

### 6.3 Editar Usuario

1. Haga clic en **✏️** junto al usuario
2. Modifique los campos
3. Haga clic en **"💾 Guardar"**

⚠️ **Restricción especial**: El usuario **"alejo"** solo puede ser editado por sí mismo. Si intenta editarlo con otra cuenta, verá:

```
❌ No tiene permisos para modificar este usuario.
```

---

### 6.4 Eliminar Usuario

1. Haga clic en **🗑️** junto al usuario
2. Confirme la eliminación

⚠️ **Precaución**: Al eliminar un usuario, no podrá realizar nuevas operaciones, pero su historial se mantendrá para auditoría.

---

## 7. Registro de Entradas

### 7.1 ¿Qué es una Entrada?

Una **Entrada** registra la llegada de productos al inventario. Cada entrada:

- Tiene un número consecutivo automático (ej: ENTR-000001)
- Puede incluir múltiples productos
- Aumenta el stock disponible
- Requiere fecha y usuario responsable

### 7.2 Ver Historial de Entradas

**Navegación**: Menú lateral → **"Entradas"**

```
┌──────────────────────────────────────────────────────────────┐
│  📥 ENTRADAS                                      [+ Nueva]  │
├──────────────────────────────────────────────────────────────┤
│  Filtros:                                                    │
│  Desde: [📅 01/01/2025]  Hasta: [📅 31/12/2025] [🔎 Filtrar]│
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Doc #    │ Fecha    │ Items │ Estado  │ Acciones      │  │
│  ├──────────┼──────────┼───────┼─────────┼───────────────┤  │
│  │ENTR-000001│20/05/2025│  3   │ ✅ ACTIVA│ 👁️ 🚫        │  │
│  │ENTR-000002│22/05/2025│  1   │ ✅ ACTIVA│ 👁️ 🚫        │  │
│  │ENTR-000003│25/05/2025│  5   │ 🚫 CANCEL│ 👁️          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Estados posibles:**

| Estado | Icono | Descripción |
|--------|-------|-------------|
| **ACTIVA** | ✅ | Entrada válida, stock aplicado |
| **CANCELADA** | 🚫 | Entrada anulada, stock revertido |

---

### 7.3 Crear Nueva Entrada

**Paso a paso:**

1. Haga clic en **"+ Nueva"**

```
┌─────────────────────────────────────────────────────────────┐
│  📥 NUEVA ENTRADA                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Número de Documento:                                       │
│  [ENTR-000004                    ] [🔄 Autocompletar]       │
│                                                             │
│  Documento Fuente (Factura/Remisión):                       │
│  [FAC-12345                      ]                          │
│                                                             │
│  Fecha de Entrada:                                          │
│  [📅 25/05/2025                  ]                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ AGREGAR PRODUCTOS                                   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Producto          │ Cantidad    │ Acción            │    │
│  ├───────────────────┼─────────────┼───────────────────┤    │
│  │ [▼ Lavamanos... ] │ [  10  ] ➕ │ [🗑️]             │    │
│  │ [▼ Grifería...  ] │ [   5  ] ➕ │ [🗑️]             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [➕ Agregar Producto]                                      │
│                                                             │
│  Total Items: 2                                             │
│                                                             │
│  [💾 Guardar Entrada]  [❌ Cancelar]                        │
└─────────────────────────────────────────────────────────────┘
```

2. **Número de Documento**: 
   - Haga clic en **"🔄 Autocompletar"** para obtener el siguiente consecutivo
   - O ingrese un número personalizado (debe ser único)

3. **Documento Fuente** (opcional): 
   - Número de factura o remisión del proveedor

4. **Fecha de Entrada**: 
   - Seleccione la fecha del calendario

5. **Agregar Productos**:
   - Haga clic en **[➕ Agregar Producto]**
   - Seleccione un producto de la lista desplegable
   - Ingrese la cantidad (debe ser mayor a 0)
   - Repita para cada producto

6. Haga clic en **"💾 Guardar Entrada"**

**Validaciones:**

| Validación | Mensaje de Error |
|------------|------------------|
| Sin items | ❌ "Items must be a non-empty array" |
| Cantidad ≤ 0 | ❌ "Each item must have quantity greater than 0" |
| Producto inactivo | ❌ "One or more products do not exist or are inactive" |
| Número duplicado | ❌ "Document number already exists" |

**Éxito:**

```
✅ Entrada creada exitosamente
📄 Documento: ENTR-000004
```

---

### 7.4 Ver Detalle de Entrada

1. En la lista de entradas, haga clic en **👁️** (ver)
2. Verá el detalle completo:

```
┌─────────────────────────────────────────┐
│  📥 DETALLE DE ENTRADA                  │
├─────────────────────────────────────────┤
│                                         │
│  Documento: ENTR-000004                 │
│  Fecha: 25/05/2025                      │
│  Fuente: FAC-12345                      │
│  Estado: ✅ ACTIVA                      │
│  Creado por: Carlos Rojas               │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ PRODUCTOS                       │    │
│  ├──────────┬──────────┬───────────┤    │
│  │ Producto │ Cantidad │ Subtotal  │    │
│  ├──────────┼──────────┼───────────┤    │
│  │ Lavamanos│    10    │    10     │    │
│  │ Grifería │     5    │     5     │    │
│  └──────────┴──────────┴───────────┘    │
│                                         │
│  [❌ Cerrar]                            │
└─────────────────────────────────────────┘
```

---

### 7.5 Cancelar Entrada

**⚠️ Solo usuarios ADMIN pueden cancelar entradas**

1. En la lista de entradas, haga clic en **🚫** (cancelar) junto a la entrada
2. Complete el motivo de cancelación:

```
┌─────────────────────────────────────────┐
│  🚫 CANCELAR ENTRADA                    │
├─────────────────────────────────────────┤
│                                         │
│  Documento: ENTR-000004                 │
│                                         │
│  Motivo de cancelación *                │
│  [_________________________________]    │
│  (Ej: Error en el registro)             │
│                                         │
│  [❌ Cancelar]  [🚫 Confirmar Cancel.]   │
└─────────────────────────────────────────┘
```

3. Ingrese un motivo obligatorio
4. Haga clic en **"🚫 Confirmar Cancel."**

**Resultado:**

```
✅ Entrada cancelada exitosamente
📄 Documento: ENTR-000004
⚠️ El stock ha sido revertido
```

⚠️ **Importante**: Una entrada cancelada no puede volver a activarse. Si necesita corregir, cree una nueva entrada.

---

## 8. Registro de Entregas

### 8.1 ¿Qué es una Entrega?

Una **Entrega** registra la salida de productos del inventario. Cada entrega:

- Tiene un número consecutivo automático (ej: ENT-000001)
- Puede incluir múltiples productos
- Disminuye el stock disponible
- Requiere firma digital del receptor
- Registra quién entrega y quién recibe

### 8.2 Ver Historial de Entregas

**Navegación**: Menú lateral → **"Entregas"**

```
┌──────────────────────────────────────────────────────────────┐
│  📤 ENTREGAS                                      [+ Nueva]  │
├──────────────────────────────────────────────────────────────┤
│  KPIs:                                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Total Hoy   │ │ Total Mes   │ │ Pendientes  │            │
│  │     5       │ │    45       │ │     0       │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                              │
│  Filtros:                                                    │
│  Desde: [📅 01/01/2025]  Hasta: [📅 31/12/2025] [🔎 Filtrar]│
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Doc #    │ Fecha    │ Items │ Estado  │ Acciones      │  │
│  ├──────────┼──────────┼───────┼─────────┼───────────────┤  │
│  │ENT-000001│21/05/2025│  2   │ ✅ ACTIVA│ 👁️ 🖼️ 🚫     │  │
│  │ENT-000002│23/05/2025│  1   │ ✅ ACTIVA│ 👁️ 🖼️ 🚫     │  │
│  │ENT-000003│26/05/2025│  3   │ 🚫 CANCEL│ 👁️ 🖼️        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Columnas:**

| Columna | Descripción |
|---------|-------------|
| **Doc #** | Número de documento |
| **Fecha** | Fecha de entrega |
| **Items** | Cantidad de productos entregados |
| **Estado** | ACTIVA o CANCELADA |
| **Acciones** | Ver, Ver Firma, Cancelar |

---

### 8.3 Crear Nueva Entrega

**Paso a paso:**

1. Haga clic en **"+ Nueva"**

```
┌─────────────────────────────────────────────────────────────┐
│  📤 NUEVA ENTREGA                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Número de Documento:                                       │
│  [ENT-000004                     ] [🔄 Autocompletar]       │
│                                                             │
│  Fecha de Entrega:                                          │
│  [📅 26/05/2025                  ]                          │
│                                                             │
│  Entregado por:                                             │
│  [▼ Carlos Rojas (ADMIN)       ]                            │
│                                                             │
│  Recibido por:                                              │
│  [▼ Juan Pérez (OPERATOR)      ]                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ AGREGAR PRODUCTOS                                   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Producto          │ Cantidad    │ Acción            │    │
│  ├───────────────────┼─────────────┼───────────────────┤    │
│  │ [▼ Lavamanos... ] │ [   3  ] ➕ │ [🗑️]             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [➕ Agregar Producto]                                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ FIRMA DEL RECEPTOR *                                │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │                                             │    │    │
│  │  │     [Dibuje aquí la firma del receptor]     │    │    │
│  │  │                                             │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │  [🗑️ Limpiar]  [↩️ Deshacer]                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [💾 Guardar Entrega]  [❌ Cancelar]                        │
└─────────────────────────────────────────────────────────────┘
```

2. **Número de Documento**: 
   - Use **"🔄 Autocompletar"** para el consecutivo automático

3. **Fecha de Entrega**: 
   - Seleccione la fecha actual o una fecha pasada

4. **Entregado por**: 
   - Seleccione el usuario que realiza la entrega (debe estar activo)

5. **Recibido por**: 
   - Seleccione el usuario que recibe los productos (debe estar activo)

6. **Agregar Productos**:
   - Agregue cada producto con su cantidad
   - ⚠️ **Validación**: La cantidad no puede exceder el stock disponible

7. **Firma del Receptor** (obligatorio):
   - Use el mouse o pantalla táctil para dibujar la firma
   - Puede limpiar y volver a firmar si es necesario

8. Haga clic en **"💾 Guardar Entrega"**

**Validaciones:**

| Validación | Mensaje de Error |
|------------|------------------|
| Sin firma | ❌ "Signature is required" |
| Sin items | ❌ "Items must be a non-empty array" |
| Stock insuficiente | ❌ "Insufficient stock for product X" |
| Usuario inactivo | ❌ "User does not exist or is inactive" |

**Éxito:**

```
✅ Entrega creada exitosamente
📄 Documento: ENT-000004
📝 Firma guardada correctamente
```

---

### 8.4 Ver Firma de Entrega

1. En la lista de entregas, haga clic en **🖼️** (ver firma)
2. Se mostrará la firma en tamaño completo:

```
┌─────────────────────────────────────────┐
│  🖼️ FIRMA DEL RECEPTOR                  │
├─────────────────────────────────────────┤
│                                         │
│  Documento: ENT-000001                  │
│  Fecha: 21/05/2025                      │
│  Recibido por: Juan Pérez               │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │      [Firma digitalizada]       │    │
│  │         Juan Pérez              │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [🖨️ Imprimir]  [❌ Cerrar]             │
└─────────────────────────────────────────┘
```

---

### 8.5 Cancelar Entrega

**⚠️ Solo usuarios ADMIN pueden cancelar entregas**

1. Haga clic en **🚫** junto a la entrega
2. Ingrese el motivo de cancelación
3. Confirme la cancelación

⚠️ **Importante**: Al cancelar una entrega, el stock se revierte automáticamente.

---

## 9. Reporte de Stock

### 9.1 Ver Reporte de Stock

**Navegación**: Menú lateral → **"Reporte de Stock"** (solo ADMIN)

```
┌──────────────────────────────────────────────────────────────┐
│  📊 REPORTE DE STOCK                             [📥 Exportar]│
├──────────────────────────────────────────────────────────────┤
│  Filtros:                                                    │
│  Desde: [📅 01/01/2025]  Hasta: [📅 31/12/2025] [🔎 Aplicar]│
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Ref     │ Producto       │ Entradas │ Salidas │ Stock  │  │
│  ├─────────┼────────────────┼──────────┼─────────┼────────┤  │
│  │ LVM-001 │ Lavamanos Delta│    50    │   35    │   15   │  │
│  │ GRF-002 │ Grifería Chrm. │    30    │   28    │    2 ⚠️│  │
│  │ ESP-003 │ Espejo 60x80   │    20    │   10    │   10   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ⚠️ Stock bajo (< 5 unidades)                                │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Filtrar por Fechas

Puede filtrar el reporte por rango de fechas:

- **Sin filtros**: Muestra todo el histórico
- **Con fecha inicio**: Desde esa fecha hasta hoy
- **Con fecha fin**: Desde el inicio hasta esa fecha
- **Ambas fechas**: Rango específico

**Ejemplos:**

| Filtro | Resultado |
|--------|-----------|
| Sin fechas | Stock histórico completo |
| 01/01/2025 - 31/03/2025 | Stock del primer trimestre |
| 01/06/2025 - hoy | Stock del segundo semestre |

### 9.3 Exportar a Excel

1. Haga clic en **"📥 Exportar"** (esquina superior derecha)
2. El archivo se descargará automáticamente con formato `.xlsx`

**Contenido del Excel:**

| Referencia | Producto | Entradas | Salidas | Stock |
|------------|----------|----------|---------|-------|
| LVM-001 | Lavamanos Delta | 50 | 35 | 15 |
| GRF-002 | Grifería Chrome | 30 | 28 | 2 |

---

### 9.4 Ver Movimientos de un Producto

**Funcionalidad exclusiva para ADMIN**

1. En el reporte de stock, haga clic en cualquier producto
2. Verá el detalle de movimientos:

```
┌─────────────────────────────────────────────────────────────┐
│  📋 MOVIMIENTOS - Lavamanos Delta (LVM-001)                 │
├─────────────────────────────────────────────────────────────┤
│  Stock Actual: 15 unidades                                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Fecha      │ Tipo    │ Doc #      │ Cant. │ Usuario   │ │
│  ├────────────┼─────────┼────────────┼───────┼───────────┤ │
│  │ 20/05/2025 │ 📥 Entry│ ENTR-000001│  +10  │ Carlos    │ │
│  │ 21/05/2025 │ 📤 Deliv│ ENT-000001 │  -3   │ Diego     │ │
│  │ 22/05/2025 │ 📥 Entry│ ENTR-000002│  +8   │ Lady      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [❌ Cerrar]                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Configuración de Secuencias

### 10.1 ¿Qué son las Secuencias?

Las **Secuencias** controlan los números consecutivos de los documentos:

- **ENTRADA**: Prefijo `ENTR-` (ej: ENTR-000001)
- **ENTREGA**: Prefijo `ENT-` (ej: ENT-000001)

### 10.2 Ver Secuencias

**Navegación**: Menú lateral → **"Secuencias"** (solo ADMIN)

```
┌──────────────────────────────────────────────────────────────┐
│  🔢 SECUENCIAS                                     [+ Nueva] │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ID │ Nombre    │ Prefijo │ Siguiente # │ Acciones     │  │
│  ├────┼───────────┼─────────┼─────────────┼──────────────┤  │
│  │ 1  │ ENTREGA   │ ENT-    │    000005   │ ✏️ 🗑️       │  │
│  │ 2  │ ENTRADA   │ ENTR-   │    000004   │ ✏️ 🗑️       │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 10.3 Editar Secuencia

1. Haga clic en **✏️** junto a la secuencia
2. Puede modificar:
   - **Nombre**: Identificador interno
   - **Prefijo**: Letras antes del número
   - **Siguiente número**: Para reiniciar o ajustar

⚠️ **Precaución**: Cambiar el siguiente número puede causar duplicados si retrocede el contador.

---

## 11. Preguntas Frecuentes

### 🔐 Autenticación

**P: ¿Qué hago si olvidé mi contraseña?**
R: Contacte al administrador del sistema para que restablezca su contraseña.

**P: ¿Cuánto tiempo permanece activa mi sesión?**
R: 8 horas. Después de ese tiempo, deberá iniciar sesión nuevamente.

---

### 📦 Productos

**P: ¿Puedo eliminar un producto que ya tiene movimientos?**
R: Sí, pero la eliminación es lógica. El producto no aparecerá en listas pero su historial se mantiene.

**P: ¿Cuál es el tamaño máximo para importar Excel?**
R: 5 MB. Si su archivo es más grande, divídalo en varios archivos.

---

### 📥 Entradas

**P: ¿Puedo modificar una entrada después de guardarla?**
R: No. Si hay un error, debe cancelarla (solo ADMIN) y crear una nueva.

**P: ¿El número de documento lo asigna el sistema?**
R: El sistema sugiere un consecutivo automático, pero puede usar un número personalizado si lo necesita.

---

### 📤 Entregas

**P: ¿Qué pasa si el cliente no puede firmar digitalmente?**
R: Puede firmar usted como testigo o ingresar una nota explicativa en los detalles.

**P: ¿Puedo entregar más productos de los que hay en stock?**
R: No. El sistema valida que haya stock suficiente antes de guardar la entrega.

---

### 📊 Reportes

**P: ¿Por qué no veo la opción "Reporte de Stock"?**
R: Esta funcionalidad está disponible solo para usuarios con rol ADMIN.

**P: ¿Los reportes incluyen documentos cancelados?**
R: No. Los reportes solo consideran documentos con estado ACTIVA.

---

## 12. Soporte Técnico

### Canales de Atención

| Canal | Contacto | Horario |
|-------|----------|---------|
| **Email** | soporte@custodiastock.com | Lunes a Viernes, 8AM - 6PM |
| **Teléfono** | +57 (1) 234-5678 | Lunes a Viernes, 8AM - 6PM |
| **Chat en línea** | Disponible en el sistema | 24/7 |

### Antes de Contactar Soporte

Verifique lo siguiente:

1. ✅ Tiene conexión a internet estable
2. ✅ Está usando un navegador actualizado
3. ✅ Sus credenciales son correctas
4. ✅ Ha intentado cerrar sesión y volver a entrar

### Información Útil para Reportar Errores

Cuando contacte soporte, proporcione:

- Nombre de usuario
| Navegador y versión |
- Paso a paso para reproducir el error |
- Captura de pantalla del mensaje de error |
- Fecha y hora del incidente |

---

## Apéndice A: Atajos de Teclado

| Tecla | Función |
|-------|---------|
| `Ctrl + N` | Nuevo registro (producto, usuario, etc.) |
| `Ctrl + F` | Enfocar campo de búsqueda |
| `Ctrl + S` | Guardar formulario |
| `Esc` | Cerrar modal/diálogo |
| `Enter` | Confirmar acción en formularios |

---

## Apéndice B: Códigos de Error Comunes

| Código | Significado | Qué hacer |
|--------|-------------|-----------|
| 400 | Datos inválidos | Revise los campos del formulario |
| 401 | No autorizado | Inicie sesión nuevamente |
| 403 | Prohibido | No tiene permisos para esta acción |
| 404 | No encontrado | El recurso no existe |
| 409 | Conflicto | Hay un duplicado (referencia, usuario, etc.) |
| 500 | Error del servidor | Contacte a soporte técnico |

---

## Apéndice C: Mejores Prácticas

### Seguridad

1. 🔒 Nunca comparta su contraseña
2. 🔒 Cierre sesión cuando termine de usar el sistema
3. 🔒 Cambie su contraseña periódicamente
4. 🔒 No use contraseñas obvias (123456, fecha de nacimiento, etc.)

### Gestión de Inventarios

1. 📦 Revise el stock semanalmente
2. 📦 Configure alertas para productos críticos
3. 📦 Documente todas las entradas con su fuente (factura, remisión)
4. 📦 Verifique las entregas antes de firmar

### Respaldo de Información

1. 💾 Exporte reportes de stock mensualmente
2. 💾 Mantenga copias de las facturas físicas
3. 💾 Archive documentos cancelados con su motivo

---

**© 2025 CustodiaStock - Todos los derechos reservados**

*Versión del manual: 1.0*  
*Última actualización: Mayo 2025*
