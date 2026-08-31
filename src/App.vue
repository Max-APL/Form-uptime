<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
    <!-- Header -->
    <Header
      :year="year"
      :month="month"
      :total-hours="totalHours"
    />

    <!-- Main Form & Dashboard Container -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- Notification Toast -->
      <transition
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="toast.show"
          :class="[
            'fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 max-w-md',
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
            toast.type === 'error' ? 'bg-rose-50 border-rose-300 text-rose-900' :
            'bg-blue-50 border-blue-300 text-blue-900'
          ]"
        >
          <svg v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else class="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-xs font-semibold">{{ toast.message }}</span>
          <button @click="toast.show = false" class="ml-auto text-slate-400 hover:text-slate-700 text-sm">✕</button>
        </div>
      </transition>

      <!-- Section 1: Selector de Período y Catálogo -->
      <PeriodSelector
        v-model:month="month"
        v-model:year="year"
        v-model:systems-catalog="systemsCatalog"
        :days-in-month="daysInMonth"
        :total-hours="totalHours"
        :total-minutes="totalMinutes"
      />

      <!-- Section 2: Formulario de Carga de Excel -->
      <FileUpload
        :file-name="fileName"
        :total-events="rawEvents.length"
        :warnings="warnings"
        :is-saving-oracle="isSavingOracle"
        @file-selected="handleFileSelected"
        @load-sample-march="loadSampleMarch"
        @load-sample-june="loadSampleJune"
        @load-sample-july="loadSampleJuly"
        @download-template="handleDownloadTemplate"
        @sync-oracle="handleSyncOracle"
        @clear-data="handleClearData"
      />

      <!-- Section 3: Botón de Exportación Directa -->
      <ExportControls
        :total-sheets="report.systems.length + 1"
        :total-systems="report.systems.length"
        :is-exporting="isExporting"
        @export-excel="handleExportExcel"
      />

      <!-- Section 4: Métricas Rápidas -->
      <MetricsSummary :report="report" />

      <!-- Section 5: Pestañas de Previsualización -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Previsualización de Hojas del Archivo Excel
            </h2>
            <p class="text-xs text-slate-500">Selecciona una pestaña para ver el contenido exacto de cada hoja antes de descargarlo</p>
          </div>
        </div>

        <!-- Sheet Tabs Navigation -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
          <!-- General Summary Tab -->
          <button
            @click="activeTab = 'general'"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer',
              activeTab === 'general'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Resumen General (2 Tablas)
          </button>

          <!-- Individual System Tabs -->
          <button
            v-for="sys in report.systems"
            :key="sys.sistema"
            @click="activeTab = sys.sistema"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer',
              activeTab === sys.sistema
                ? 'bg-slate-800 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            ]"
          >
            <span>{{ sys.sistema }}</span>
            <span
              v-if="sys.events.length > 0"
              class="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center border border-rose-300"
              title="Eventos registrados"
            >
              {{ sys.events.length }}
            </span>
            <span
              v-else
              class="w-2 h-2 rounded-full bg-emerald-500"
              title="100% Uptime"
            ></span>
          </button>
        </div>

        <!-- Tab Content View -->
        <div class="pt-2">
          <GeneralSummaryTab
            v-if="activeTab === 'general'"
            :report="report"
          />

          <SystemPreviewTab
            v-else
            :system-metrics="activeSystemMetrics"
          />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4">
        Generador de Reportes de Uptime y Eventos Mensuales &bull; BMSC
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import saveAs from 'file-saver'
import type { RawEventRecord } from './types/uptime'
import {
  DEFAULT_SYSTEMS,
  calculateUptimeMetrics
} from './utils/calculator'
import { parseExcelBuffer } from './utils/excelParser'
import {
  SAMPLE_MARCH_EVENTS,
  SAMPLE_JUNE_EVENTS,
  SAMPLE_JULY_EVENTS
} from './utils/sampleData'
import {
  generateUptimeWorkbook,
  generateEmptyTemplateWorkbook
} from './utils/excelGenerator'

import Header from './components/Header.vue'
import PeriodSelector from './components/PeriodSelector.vue'
import FileUpload from './components/FileUpload.vue'
import MetricsSummary from './components/MetricsSummary.vue'
import SystemPreviewTab from './components/SystemPreviewTab.vue'
import GeneralSummaryTab from './components/GeneralSummaryTab.vue'
import ExportControls from './components/ExportControls.vue'

// State
const year = ref<number>(2026)
const month = ref<number>(3) // Default to March 2026
const systemsCatalog = ref<string[]>([...DEFAULT_SYSTEMS])
const rawEvents = ref<RawEventRecord[]>([...SAMPLE_MARCH_EVENTS])
const fileName = ref<string | null>('eventos_marzo_2026.xlsx')
const warnings = ref<string[]>([])
const activeTab = ref<string>('general')
const isExporting = ref<boolean>(false)
const isSavingOracle = ref<boolean>(false)

const toast = ref<{
  show: boolean
  message: string
  type: 'success' | 'error' | 'info'
}>({
  show: false,
  message: '',
  type: 'info'
})

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 4500)
}

// Computed report metrics
const report = computed(() => {
  return calculateUptimeMetrics(
    rawEvents.value,
    year.value,
    month.value,
    systemsCatalog.value
  )
})

const daysInMonth = computed(() => report.value.daysInMonth)
const totalHours = computed(() => report.value.totalMonthHours)
const totalMinutes = computed(() => report.value.totalMonthMinutes)

const activeSystemMetrics = computed(() => {
  const found = report.value.systems.find(s => s.sistema === activeTab.value)
  return found || report.value.systems[0]
})

// File handling
async function handleFileSelected(file: File) {
  try {
    const buffer = await file.arrayBuffer()
    const result = await parseExcelBuffer(buffer)

    rawEvents.value = result.events
    fileName.value = file.name
    warnings.value = result.warnings

    if (result.detectedMonth) {
      month.value = result.detectedMonth
    }
    if (result.detectedYear) {
      year.value = result.detectedYear
    }

    showToast(`Archivo "${file.name}" cargado. ${result.events.length} registros procesados.`, 'success')

    // Automatically trigger Oracle DB sync on file upload
    await handleSyncOracle(false)
  } catch (err: any) {
    showToast(`Error al procesar archivo: ${err.message || err}`, 'error')
  }
}

async function handleSyncOracle(showExplicitToast = true) {
  if (!rawEvents.value || rawEvents.value.length === 0) {
    if (showExplicitToast) showToast('No hay eventos para guardar en Oracle.', 'info')
    return
  }

  isSavingOracle.value = true
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        events: rawEvents.value
      })
    })

    const data = await response.json()
    if (response.ok && data.success) {
      showToast(`✅ ${data.message || 'Eventos guardados en tabla EVENTOS_DOWNTIME de Oracle'}`, 'success')
    } else {
      if (showExplicitToast) {
        showToast(`⚠️ Oracle: ${data.message || 'No se pudo conectar a Oracle DB'}`, 'error')
      }
    }
  } catch (err: any) {
    if (showExplicitToast) {
      showToast(`⚠️ Aviso: Servidor Oracle no disponible en http://localhost:3001 (${err.message || 'Offline'})`, 'info')
    }
  } finally {
    isSavingOracle.value = false
  }
}

function loadSampleMarch() {
  rawEvents.value = [...SAMPLE_MARCH_EVENTS]
  month.value = 3
  year.value = 2026
  fileName.value = 'eventos_marzo_2026.xlsx'
  warnings.value = []
  showToast('Datos reales de Marzo 2026 (23 incidentes del PDF) cargados.', 'success')
}

function loadSampleJune() {
  rawEvents.value = [...SAMPLE_JUNE_EVENTS]
  month.value = 6
  year.value = 2026
  fileName.value = 'ejemplo_incidentes_junio_2026.xlsx'
  warnings.value = []
  showToast('Datos de ejemplo de Junio 2026 cargados.', 'info')
}

function loadSampleJuly() {
  rawEvents.value = [...SAMPLE_JULY_EVENTS]
  month.value = 7
  year.value = 2026
  fileName.value = 'ejemplo_incidentes_julio_2026.xlsx'
  warnings.value = []
  showToast('Datos de ejemplo de Julio 2026 cargados.', 'info')
}

function handleClearData() {
  rawEvents.value = []
  fileName.value = null
  warnings.value = []
  showToast('Datos limpiados. Puedes subir un nuevo archivo Excel.', 'info')
}

async function handleDownloadTemplate() {
  try {
    const blob = await generateEmptyTemplateWorkbook()
    saveAs(blob, 'Plantilla_Carga_Eventos_Mensuales.xlsx')
    showToast('Plantilla Excel descargada.', 'success')
  } catch (err: any) {
    showToast(`Error al descargar plantilla: ${err.message || err}`, 'error')
  }
}

async function handleExportExcel() {
  isExporting.value = true
  try {
    const blob = await generateUptimeWorkbook(report.value)
    const outName = `Reporte_Disponibilidad_BMSC_${report.value.monthName}_${year.value}.xlsx`
    saveAs(blob, outName)
    showToast(`Reporte "${outName}" generado y descargado con éxito.`, 'success')
  } catch (err: any) {
    showToast(`Error al generar Excel: ${err.message || err}`, 'error')
  } finally {
    isExporting.value = false
  }
}
</script>
