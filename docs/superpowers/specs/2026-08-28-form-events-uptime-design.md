# Design Specification: Generador de Reportes de Uptime y Eventos en Vue 3

**Fecha**: 2026-08-28  
**Tecnologías**: Vue 3 (Composition API + TypeScript), Vite, Tailwind CSS, ExcelJS, Chart.js, Lucide Icons

---

## 1. Resumen del Proyecto
Aplicación web moderna en Vue 3 para procesar archivos Excel mensuales de incidentes y caídas de sistemas. La aplicación calcula automáticamente métricas de disponibilidad (Uptime, Downtime por tipo de indicador, duraciones en `HH:MM:SS` y porcentajes con 4 decimales), previsualiza los resultados en un dashboard interactivo con gráficos, y genera un libro Excel multi-hoja con estilos idénticos a los reportes requeridos (una hoja por sistema y una hoja resumen general con las 2 tablas consolidadas).

---

## 2. Requerimientos de Entrada y Catálogo de Sistemas

### 2.1 Archivo de Entrada (1 sola hoja)
El archivo mensual cargado debe contener las siguientes columnas (con detección flexible de encabezados):
* `SISTEMA`: Nombre del sistema afectado.
* `FECHA`: Fecha del evento.
* `HORA DE INICIO CAIDA`: Hora de inicio del corte.
* `HORA DE FIN CAIDA`: Hora de finalización del corte.
* `TIEMPO SERVICIO ABAJO`: Duración de la indisponibilidad (`HH:MM:SS`).
* `INDICADOR`: Tipo de indicador (`II-PROVEEDOR`, `II-PROGRAMADA`, `II-FALLAS` o equivalentes).
* `MOTIVO`: Descripción de la causa.

### 2.2 Catálogo Base de Sistemas Críticos
Catálogo por defecto preconfigurado:
1. `CORE T24` (o `T24`)
2. `FISA`
3. `ICBANKING` (o `BANCA POR INTERNET`)
4. `BANCA MOVIL`
5. `PORTAL WEB`
6. `POSTILION`
7. `ACH`
8. `ONBASE`
9. `SWIFT`

*Nota:* Si el archivo de entrada incluye sistemas adicionales, se incorporan automáticamente. Si un sistema del catálogo no registra incidentes en el mes, se genera con 0 caídas (100% Uptime).

---

## 3. Motor de Cálculo y Reglas de Negocio

1. **Período Evaluado**:
   * Selección de Mes y Año (ej. Junio 2026 = 30 días = 720 horas = 43.200 minutos; Julio = 31 días = 744 horas = 44.640 minutos; Febrero = 28/29 días).
2. **Duración de Incidencias**:
   * Conversión a minutos y segundos exactos.
   * Agrupación por Sistema y por Indicador (`II-PROVEEDOR`, `II-PROGRAMADA`, `II-FALLAS`).
3. **Fórmulas de Porcentaje**:
   - % Downtime Indicador = (Minutos Indisponibilidad Indicador / Minutos Totales del Mes) * 100
   - % Downtime Total = Suma de % Downtime Indicadores
   - % Uptime (Disponibilidad) = 100.0000% - % Downtime Total
4. **Promedios Finales**:
   * Promedio aritmético de Uptime y Downtimes por columna para la fila `PROMEDIO FINAL`.

---

## 4. Estructura y Estilos del Excel Generado (`.xlsx`)

### 4.1 Hojas Individuales por Sistema (ej. Hoja "CORE T24", Hoja "POSTILION", etc.)
* **Título Superior**: Nombre del sistema en negrita subrayado.
* **Sub-encabezado**: Nombre del sistema centrado con fondo gris (`#D9D9D9`) y texto en negrita.
* **Tabla de Eventos**:
  * Encabezados: `FECHA` | `HORA DE INICIO CAIDA` | `HORA DE FIN CAIDA` | `TIEMPO SERVICIO ABAJO` | `INDICADOR` | `MOTIVO` (Fondo gris `#7F7F7F`, texto en negrita, bordes negros).
  * Filas de datos: Registros del sistema o una fila vacía con bordes si no hubo caídas.
* **Tabla de Resumen (debajo de la tabla de eventos)**:
  * `Total Downtime en horas (HH:MI:SS)`: Suma acumulada formateada `HH:MM:SS`.
  * `% DOWNTIME`: Porcentaje con 4 decimales (ej. `0,0949%`).
  * `% UPTIME`: Porcentaje con 4 decimales (ej. `99,9051%`).
  * `% TOTAL`: `100,0000%`.

### 4.2 Hoja General / Consolidada ("Resumen General")
Contiene las dos tablas consolidadas:

#### Tabla 1: "Resumen Final de UPTIME de Sistemas Críticos del BMSC"
* Encabezado negro con texto blanco:
  `SISTEMA` | `[MES]` (ej. `JUNIO`) | `II-PROVEEDOR` | `II-PROGRAMADA` | `II-FALLAS` | `TOTAL`
* Filas con el valor de disponibilidad (`% Uptime`) y desglose de indisponibilidad (`% Proveedor`, `% Programada`, `% Fallas`, `% Total Downtime`).
* Fila de cierre: `PROMEDIO FINAL` con los promedios de cada columna.

#### Tabla 2: "REPORTE UPTIME DE TECNOLOGIA"
* Subtítulo: `MES: [MES]` en azul/negro.
* Encabezado jerárquico verde claro (`#D9EAD3`) con bordes negros:
  * Fila 1: `SISTEMA` (rowspan 2) | `TOTAL NO DISPONIBILIDAD (Tiempo)` (rowspan 2) | `DISPONIBILIDAD (%)` (rowspan 2) | `NO DISPONIBILIDAD` (colspan 6)
  * Fila 2: `IIBHIBM PROVEEDOR (tiempo)` | `IIBHIBM PROVEEDOR (%)` | `IIBHIBM PROGRAMADA (tiempo)` | `IIBHIBM PROGRAMADA (%)` | `IIBHIBM FALLAS (tiempo)` | `IIBHIBM FALLAS (%)`
* Filas por sistema con tiempos en formato `HH:MM` / `HH:MM:SS` y porcentajes con 4 decimales.

---

## 5. Arquitectura del Frontend Vue 3

### 5.1 Estructura de Directorios
```
src/
├── assets/
│   └── main.css
├── components/
│   ├── Header.vue
│   ├── FileUpload.vue
│   ├── PeriodSelector.vue
│   ├── SystemsConfig.vue
│   ├── MetricsSummary.vue
│   ├── ChartsSection.vue
│   ├── SystemPreviewTab.vue
│   ├── GeneralSummaryTab.vue
│   └── ExportControls.vue
├── types/
│   └── uptime.ts
├── utils/
│   ├── calculator.ts
│   ├── excelParser.ts
│   ├── excelGenerator.ts
│   └── sampleData.ts
├── App.vue
└── main.ts
```

### 5.2 Experiencia de Usuario (UI/UX)
* **Zona de Carga**: Drag & drop interactivo con soporte para archivos `.xlsx`, `.xls` y `.csv`.
* **Botón de Cargar Ejemplo**: Carga instantánea de los datos reales de los ejemplos para probar en 1 clic.
* **Descarga de Plantilla**: Genera y descarga un Excel modelo vacío para que el usuario sepa cómo armar su archivo mensual.
* **Previsualización de Hojas**: Navegación por pestañas idéntica al archivo final Excel.
* **Gráficos Dinámicos**: Comparativa visual de Uptime por Sistema y distribución de fallas por causa.
* **Exportación Instantánea**: Botón prominente de descarga del archivo Excel estilizado generado con `ExcelJS`.

---

## 6. Plan de Pruebas y Validación
* Pruebas unitarias de cálculo de tiempos y porcentajes (comprobando exactitud con los casos de prueba de Junio/Julio: 41 minutos = 0,0949% en mes de 30 días).
* Verificación de generación de archivo `.xlsx` con todas las hojas, estilos, bordes, fórmulas y formatos.
* Verificación de la reactividad y componentes en la interfaz web.
