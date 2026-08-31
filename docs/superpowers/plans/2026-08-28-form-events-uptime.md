# Generador de Reportes de Uptime y Eventos - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una aplicación web completa en Vue 3 con TypeScript, Vite y Tailwind CSS para cargar archivos Excel de caídas/incidentes mensuales, calcular automáticamente métricas de Uptime y Downtime por sistema e indicador, y generar un Excel multi-hoja descargable con estilos corporativos idénticos a los requeridos.

**Architecture:** Aplicación cliente (SPA) construida con Vue 3 Composition API. Utiliza `xlsx` y `exceljs` para parseo y generación avanzada con estilos (colores, bordes, formatos de celdas), `chart.js` para visualización gráfica, y un motor matemático de cálculo de disponibilidad mensual.

**Tech Stack:** Vue 3, TypeScript, Vite, Tailwind CSS, ExcelJS, SheetJS (xlsx), Chart.js, Lucide Icons, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-28-form-events-uptime-design.md`

## Global Constraints
- Framework: Vue 3 `<script setup lang="ts">`
- Estilos de Excel: ExcelJS con colores exactos (`#7F7F7F`, `#D9D9D9`, `#D9EAD3`, `#000000`), bordes y formateo numérico `0.0000%` y `HH:MM:SS`.
- Cobertura de tests con Vitest para cálculos y generación.

---

### Task 1: Scaffolding del Proyecto Vue 3 + TypeScript + Tailwind CSS

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.ts`, `src/assets/main.css`, `vitest.config.ts`

**Interfaces:**
- Produces: Base funcional del proyecto con todas las librerías requeridas instaladas (`vue`, `exceljs`, `xlsx`, `chart.js`, `lucide-vue-next`, `file-saver`, `vitest`).

- [ ] **Step 1: Crear configuración de `package.json` e instalar dependencias**
- [ ] **Step 2: Configurar Vite, TypeScript, Tailwind CSS y PostCSS**
- [ ] **Step 3: Configurar Vitest y script de pruebas**
- [ ] **Step 4: Verificar que el proyecto compila y los tests corren con `npm test`**
- [ ] **Step 5: Git commit inicial**

---

### Task 2: Tipos de Dominio y Motor de Cálculo Matemático de Uptime/Downtime

**Files:**
- Create: `src/types/uptime.ts`
- Create: `src/utils/calculator.ts`
- Test: `tests/unit/calculator.test.ts`

**Interfaces:**
- Produces:
  - `RawEventRecord`: Estructura del registro de entrada.
  - `SystemMonthlyMetrics`: Métricas calculadas por sistema (`totalDowntimeMinutes`, `downtimeFormatted`, `uptimePercent`, `downtimePercent`, `indicatorsBreakdown`).
  - `ConsolidatedReport`: Reporte consolidado con lista de sistemas y promedios finales.
  - `calculateUptimeMetrics(events: RawEventRecord[], year: number, month: number, systemCatalog: string[])`: Función pura de cálculo.

- [ ] **Step 1: Escribir tests unitarios fallando en `tests/unit/calculator.test.ts` validando cálculo exacto de Junio (30 días, 41 min = 0.0949% downtime y 99.9051% uptime) y sistemas con 0 caídas (100% uptime)**
- [ ] **Step 2: Ejecutar test y verificar que falla**
- [ ] **Step 3: Implementar `src/types/uptime.ts` y `src/utils/calculator.ts` con manejo de formatos de tiempo `HH:MM:SS`, cálculo de días por mes, y porcentajes**
- [ ] **Step 4: Ejecutar tests unitarios y verificar que pasan al 100%**
- [ ] **Step 5: Git commit**

---

### Task 3: Parser de Excel y Conjunto de Datos de Prueba

**Files:**
- Create: `src/utils/excelParser.ts`
- Create: `src/utils/sampleData.ts`
- Test: `tests/unit/excelParser.test.ts`

**Interfaces:**
- Consumes: `RawEventRecord` de `src/types/uptime.ts`
- Produces:
  - `parseExcelFile(file: File | ArrayBuffer): Promise<{ events: RawEventRecord[], detectedMonth?: number, detectedYear?: number }>`
  - `SAMPLE_EVENTS`: Datos reales de prueba (Junio/Julio BMSC) para validación inmediata en 1 clic.

- [ ] **Step 1: Escribir tests unitarios para `parseExcelFile` validando normalización de columnas, horas en formato AM/PM y seriales de Excel**
- [ ] **Step 2: Implementar `excelParser.ts` utilizando SheetJS y `sampleData.ts` con datos del banco**
- [ ] **Step 3: Ejecutar `tests/unit/excelParser.test.ts` y verificar que pasa**
- [ ] **Step 4: Git commit**

---

### Task 4: Generador de Excel Multi-Hoja con Estilos Corporativos (ExcelJS)

**Files:**
- Create: `src/utils/excelGenerator.ts`
- Test: `tests/unit/excelGenerator.test.ts`

**Interfaces:**
- Consumes: `ConsolidatedReport`, `RawEventRecord`
- Produces:
  - `generateUptimeWorkbook(report: ConsolidatedReport, events: RawEventRecord[]): Promise<Blob>`
  - `generateEmptyTemplateWorkbook(): Promise<Blob>`

- [ ] **Step 1: Escribir test en `tests/unit/excelGenerator.test.ts` que valide la creación de todas las hojas de sistemas + hoja "Resumen General", celdas con fórmulas/valores de porcentaje `0.0000%` y estilos aplicados**
- [ ] **Step 2: Implementar `excelGenerator.ts` creando cada hoja por sistema con su tabla y resumen, y la hoja general con las 2 tablas ("Resumen Final de UPTIME" y "REPORTE UPTIME DE TECNOLOGIA")**
- [ ] **Step 3: Ejecutar tests y comprobar generación correcta del workbook**
- [ ] **Step 4: Git commit**

---

### Task 5: Componentes de UI (Header, FileUpload, PeriodSelector, MetricsSummary, ChartsSection)

**Files:**
- Create: `src/components/Header.vue`
- Create: `src/components/FileUpload.vue`
- Create: `src/components/PeriodSelector.vue`
- Create: `src/components/MetricsSummary.vue`
- Create: `src/components/ChartsSection.vue`

**Interfaces:**
- Produces: Componentes modulares reactivos con Tailwind CSS y Chart.js para cargar archivos, seleccionar mes/año, ver métricas globales y gráficos interactivos.

- [ ] **Step 1: Implementar `Header.vue` y `PeriodSelector.vue` con selector de mes/año y catálogo de sistemas**
- [ ] **Step 2: Implementar `FileUpload.vue` con soporte Drag & Drop, botón "Cargar Datos de Ejemplo" y botón "Descargar Plantilla"**
- [ ] **Step 3: Implementar `MetricsSummary.vue` con tarjetas de KPI y `ChartsSection.vue` con gráficos de Uptime por Sistema y Distribución de Fallas**
- [ ] **Step 4: Git commit**

---

### Task 6: Previsualización de Hojas, Controles de Exportación y App Principal

**Files:**
- Create: `src/components/SystemPreviewTab.vue`
- Create: `src/components/GeneralSummaryTab.vue`
- Create: `src/components/ExportControls.vue`
- Modify: `src/App.vue`

**Interfaces:**
- Produces: Experiencia de usuario completa donde se pueden ver las tablas exactamente como quedarán en el Excel antes de descargarlo, y botón de descarga directa de `.xlsx`.

- [ ] **Step 1: Implementar `SystemPreviewTab.vue` que muestra la vista previa fiel de cada sistema (eventos y tabla de resumen de Uptime/Downtime)**
- [ ] **Step 2: Implementar `GeneralSummaryTab.vue` que muestra las 2 tablas consolidadas de Uptime de Sistemas Críticos y Reporte de Tecnología**
- [ ] **Step 3: Integrar todo en `src/App.vue` conectando el estado global de eventos, cálculos, pestañas y exportación**
- [ ] **Step 4: Probar la compilación y ejecución de la aplicación**
- [ ] **Step 5: Git commit**

---

### Task 7: Verificación Final, Pruebas End-to-End y Demostración

**Files:**
- Test: Verificación de importación de Excel, cálculo matemático, previsualización interactiva y descarga de Excel final.

- [ ] **Step 1: Ejecutar la suite completa de tests automatizados (`npm test`)**
- [ ] **Step 2: Compilar el proyecto para producción (`npm run build`) verificando 0 errores de TypeScript y bundling**
- [ ] **Step 3: Generar archivo de demostración y validar la salida contra las imágenes originales**
- [ ] **Step 4: Crear reporte de cierre (`walkthrough.md`)**
