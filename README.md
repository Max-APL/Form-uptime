# Form Uptime V2 — BMSC

Sistema interactivo avanzado para el registro, edición, cálculo y control de disponibilidad (Uptime) e incidentes de caídas de servicio.

---

## 🌟 Principales Características de la Versión 2

1. **Grilla Interactiva de Control Total (In-Place Editing)**:
   - Reemplaza el engorroso flujo de subir/descargar archivos Excel manuales.
   - Permite agregar filas al vuelo mediante el botón **`+ Agregar Fila`**.
   - Edición directa celda por celda con selector de sistemas, horas, indicadores y estados booleanos.
   - Modos de densidad de visualización: **`[ Cómoda | Compacta ]`** con un clic.

2. **Nuevas Columnas Operativas**:
   - **Componente**: Módulo o elemento específico afectado (Base de Datos, Servidor, Red, API Gateway, etc.).
   - **Responsable**: Responsable o equipo a cargo (Infraestructura, DBA, Canales, Proveedor X, etc.).
   - **Solución**: Medidas correctivas tomadas.
   - **Bitácora**: Identificador o número de ticket/caso de soporte.
   - **Origen**: Fuente de detección (Zabbix, Dynatrace, Mesa de Ayuda, Monitoreo, etc.).
   - **Declarado**: Estado oficial con interruptor booleano interactivo (*Sí / No*).

3. **Cálculo Automático de Tiempos y Métricas**:
   - Duración calculada en tiempo real al ingresar horas de inicio y fin (con soporte inteligente para eventos que cruzan la medianoche).
   - Porcentajes de disponibilidad (*Uptime %*) y desglose por fallas, mantenimiento programado y proveedor calculados al instante.

4. **Resumen de Métricas Sutil al Pie**:
   - Barra de estado minimalista y corporativa ubicada al final de la página (no intrusiva, sin saturar con tarjetas gigantes).

5. **Borrador Local Automático (`localStorage`)**:
   - El trabajo se guarda automáticamente por mes y año; nunca se pierde el avance ante recargas accidentales.

6. **Importación Rápida desde Portapapeles (`Ctrl+V`)**:
   - Permite copiar bloques de celdas desde hojas de cálculo externas o correos y pegarlos directamente como filas.

7. **Exportación Profesional a Excel (`.xlsx`)**:
   - Generación de libro Excel multihija con estilo corporativo BMSC, detalle de incidentes y resumen consolidado.

8. **Integración con Base de Datos Oracle**:
   - Soporta sincronización directa con la base de datos Oracle (Docker local o ambiente productivo mediante variables de entorno `.env`).

---

## 🚀 Comandos de Ejecución

### 1. Iniciar Base de Datos Oracle Local (Docker)
```bash
npm run db:start
```

### 2. Inicializar / Migrar Tabla en Oracle
```bash
npm run db:init
```

### 3. Servidor API Backend (Oracle)
```bash
npm run server
```
*Servidor API escuchando en `http://localhost:3001`.*

### 4. Servidor Frontend de Desarrollo
```bash
npm run dev
```
*Aplicación web disponible en `http://localhost:5173`.*

### 5. Consultar Registros en Oracle
```bash
npm run db:query
```

### 6. Ejecutar Pruebas Unitarias
```bash
npm run test
```

### 7. Compilar para Producción
```bash
npm run build
```

---

## ⚙️ Configuración (`.env`)

```ini
PORT=3001
ORACLE_USER=SYSTEM
ORACLE_PASSWORD=oracle
ORACLE_CONNECT_STRING=127.0.0.1:1521/XEPDB1
ORACLE_TABLE_NAME=EVENTOS_DOWNTIME
ORACLE_MODE=thin
```

Para conectar a producción, únicamente modifique los valores de `ORACLE_USER`, `ORACLE_PASSWORD` y `ORACLE_CONNECT_STRING` en el archivo `.env`.
