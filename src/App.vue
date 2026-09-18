<template>
  <div class="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800">
    
    <!-- Top Header -->
    <Header
      v-model:year="year"
      v-model:month="month"
      :draft-status-text="draftStatusText"
      :is-saving-oracle="isSavingOracle"
      :total-records="events.length"
      @add-row="addNewRowInline"
      @open-paste-modal="showPasteModal = true"
      @open-report-modal="showReportModal = true"
      @export-excel="handleExportExcel"
      @save-oracle="handleSaveToOracle"
    />

    <!-- Toast notification overlay -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toast.show"
        :class="[
          'fixed bottom-6 right-6 z-50 flex max-w-md items-center gap-3 rounded-xl border p-4 text-xs font-semibold shadow-xl',
          toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' :
          toast.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-blue-200 bg-blue-50 text-blue-900'
        ]"
      >
        <span>{{ toast.message }}</span>
        <button class="ml-auto text-slate-400 hover:text-slate-700" @click="toast.show = false">✕</button>
      </div>
    </transition>

    <!-- Main Container: Focused on the Table -->
    <main class="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-5 sm:px-6 lg:px-8">
      
      <!-- 1. The Core Table (Primary Workplace) -->
      <UptimeTable
        :events="events"
        :available-systems="customSystems"
        @update-events="handleUpdateEvents"
        @open-detail-modal="openDetailModal"
        @open-create-modal="openCreateModal"
        @add-row-inline="addNewRowInline"
      />

      <!-- 2. Subtle Status Bar of Metrics (At the bottom) -->
      <MetricsSummary :summary="report.summary" />

    </main>

    <!-- Bulk Actions Floating Bar -->
    <BulkActionsBar
      :selected-count="selectedCount"
      @batch-set-declarado="handleBatchSetDeclarado"
      @batch-set-indicador="handleBatchSetIndicador"
      @batch-delete="handleBatchDelete"
      @clear-selection="handleClearSelection"
    />

    <!-- Paste from Clipboard Modal -->
    <PasteImportModal
      :is-open="showPasteModal"
      @close="showPasteModal = false"
      @import-records="handleImportRecords"
    />

    <!-- Row Detail Editor / Creator Modal -->
    <RowEditorModal
      :is-open="showEditorModal"
      :record="selectedRecordForEdit"
      :is-new="isCreatingNew"
      :available-systems="customSystems"
      @close="showEditorModal = false"
      @save="handleSaveModalRecord"
    />

    <!-- Consolidated Report Modal -->
    <ConsolidatedReportModal
      :is-open="showReportModal"
      :report="report"
      @close="showReportModal = false"
    />

    <!-- Save to DB Confirmation Modal -->
    <SaveDbConfirmModal
      :is-open="showSaveConfirmModal"
      :year="year"
      :month="month"
      :month-name="report.monthName"
      :current-events="events"
      :is-saving="isSavingOracle"
      @close="showSaveConfirmModal = false"
      @confirm="executeSaveToOracle"
    />

    <!-- Footer -->
    <footer class="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
      Banco Mercantil Santa Cruz &copy; {{ year }} — Formulario de Disponibilidad y Caídas V2
    </footer>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import type { EventRecordV2, StandardIndicator } from './types/uptime'
import { calculateUptimeMetricsV2, DEFAULT_SYSTEMS } from './utils/calculator'
import { loadDraft, saveDraft, formatTimeAgo } from './utils/storage'
import { exportEventsToExcelV2 } from './utils/excelExporter'

import Header from './components/Header.vue'
import MetricsSummary from './components/MetricsSummary.vue'
import UptimeTable from './components/UptimeTable.vue'
import BulkActionsBar from './components/BulkActionsBar.vue'
import PasteImportModal from './components/PasteImportModal.vue'
import RowEditorModal from './components/RowEditorModal.vue'
import ConsolidatedReportModal from './components/ConsolidatedReportModal.vue'
import SaveDbConfirmModal from './components/SaveDbConfirmModal.vue'

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const events = ref<EventRecordV2[]>([])
const draftTimestamp = ref(0)
const draftStatusText = ref('Borrador listo')
const isSavingOracle = ref(false)

const showPasteModal = ref(false)
const showReportModal = ref(false)
const showEditorModal = ref(false)
const showSaveConfirmModal = ref(false)
const isCreatingNew = ref(false)
const selectedRecordForEdit = ref<EventRecordV2 | null>(null)

// Toast system
const toast = ref<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
  show: false,
  message: '',
  type: 'info'
})

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toast.value = { show: true, message, type }
  window.setTimeout(() => {
    toast.value.show = false
  }, 4000)
}

// Custom systems extracted from events
const customSystems = computed(() => {
  const set = new Set<string>(DEFAULT_SYSTEMS)
  events.value.forEach(e => {
    if (e.sistema && e.sistema.trim()) {
      set.add(e.sistema.trim().toUpperCase())
    }
  })
  return Array.from(set)
})

// Dynamic calculation of Uptime metrics
const report = computed(() => {
  return calculateUptimeMetricsV2(events.value, year.value, month.value, customSystems.value)
})

const selectedCount = computed(() => {
  return events.value.filter(e => e.selected).length
})

// Default date for selected period
const defaultPeriodDate = computed(() => {
  const m = String(month.value).padStart(2, '0')
  return `${year.value}-${m}-01`
})

// Load or change period draft
async function loadPeriodData() {
  const draft = loadDraft(year.value, month.value)
  if (draft && draft.events && draft.events.length > 0) {
    events.value = draft.events
    draftTimestamp.value = draft.timestamp
    draftStatusText.value = formatTimeAgo(draft.timestamp)
  } else {
    // Check if Oracle already has events for this period
    try {
      const res = await fetch(`/api/events?year=${year.value}&month=${month.value}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.events) && data.events.length > 0) {
          events.value = data.events
          draftTimestamp.value = Date.now()
          draftStatusText.value = 'Cargado de la BD'
          saveDraft(year.value, month.value, data.events)
          return
        }
      }
    } catch {
      // ignore
    }
    events.value = []
    draftTimestamp.value = Date.now()
    draftStatusText.value = 'Sin registros para este período'
  }
}

watch([year, month], () => {
  loadPeriodData()
}, { immediate: true })

// Auto-save draft on any change to events
watch(events, () => {
  saveDraft(year.value, month.value, events.value)
  draftTimestamp.value = Date.now()
  draftStatusText.value = formatTimeAgo(draftTimestamp.value)
}, { deep: true })

setInterval(() => {
  if (draftTimestamp.value > 0) {
    draftStatusText.value = formatTimeAgo(draftTimestamp.value)
  }
}, 30000)

/**
 * Clean & fast in-table row addition
 */
function addNewRowInline() {
  const newRow: EventRecordV2 = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sistema: '',
    componente: '',
    fecha: defaultPeriodDate.value,
    horaInicio: '08:00:00',
    horaFin: '08:15:00',
    tiempoServicioAbajo: '00:15:00',
    durationMinutes: 15,
    durationSeconds: 900,
    indicador: 'II-FALLAS',
    responsable: '',
    origen: '',
    declarado: false,
    bitacora: '',
    motivo: '',
    solucion: '',
    createdAt: new Date().toISOString()
  }

  events.value.unshift(newRow)
  showToast('Nueva fila agregada a la tabla.', 'info')
}

function openCreateModal() {
  isCreatingNew.value = true
  selectedRecordForEdit.value = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sistema: '',
    componente: '',
    fecha: defaultPeriodDate.value,
    horaInicio: '08:00:00',
    horaFin: '08:15:00',
    tiempoServicioAbajo: '00:15:00',
    durationMinutes: 15,
    durationSeconds: 900,
    indicador: 'II-FALLAS',
    responsable: '',
    origen: '',
    declarado: false,
    bitacora: '',
    motivo: '',
    solucion: '',
    createdAt: new Date().toISOString()
  }
  showEditorModal.value = true
}

function openDetailModal(record: EventRecordV2) {
  isCreatingNew.value = false
  selectedRecordForEdit.value = record
  showEditorModal.value = true
}

function handleSaveModalRecord(saved: EventRecordV2) {
  if (isCreatingNew.value) {
    events.value.unshift(saved)
    showToast(`Incidente agregado a ${saved.sistema} exitosamente.`, 'success')
  } else {
    const idx = events.value.findIndex(e => e.id === saved.id)
    if (idx >= 0) {
      events.value[idx] = saved
      showToast('Cambios guardados en la tabla.', 'success')
    }
  }
}

function handleUpdateEvents(updated: EventRecordV2[]) {
  events.value = updated
}

// Bulk batch operations
function handleBatchSetDeclarado(val: boolean) {
  events.value.forEach(e => {
    if (e.selected) e.declarado = val
  })
  showToast(`${selectedCount.value} incidentes marcados como ${val ? 'Declarado' : 'No Declarado'}.`, 'success')
}

function handleBatchSetIndicador(ind: StandardIndicator) {
  events.value.forEach(e => {
    if (e.selected) e.indicador = ind
  })
  showToast(`Indicador ${ind} asignado a ${selectedCount.value} incidentes.`, 'success')
}

function handleBatchDelete() {
  const count = selectedCount.value
  events.value = events.value.filter(e => !e.selected)
  showToast(`${count} incidente(s) eliminados de la tabla.`, 'info')
}

function handleClearSelection() {
  events.value.forEach(e => {
    e.selected = false
  })
}

// Import records from clipboard modal
function handleImportRecords(records: EventRecordV2[], mode: 'append' | 'replace') {
  if (mode === 'replace') {
    events.value = records
    showToast(`Se reemplazó la tabla con ${records.length} registros importados.`, 'success')
  } else {
    events.value = [...records, ...events.value]
    showToast(`Se agregaron ${records.length} registros a la tabla.`, 'success')
  }
}

// Export Excel
async function handleExportExcel() {
  if (events.value.length === 0) {
    showToast('No hay registros para exportar.', 'info')
    return
  }
  try {
    await exportEventsToExcelV2(events.value, report.value, year.value, month.value)
    showToast('Archivo Excel descargado exitosamente.', 'success')
  } catch (err: any) {
    showToast(`Error al generar Excel: ${err.message || err}`, 'error')
  }
}

// Open Save to DB Confirmation Modal
function handleSaveToOracle() {
  if (events.value.length === 0) {
    showToast('No hay registros en la tabla para guardar.', 'info')
    return
  }
  showSaveConfirmModal.value = true
}

// Execute Save to Oracle DB via backend API after confirmation
async function executeSaveToOracle() {
  isSavingOracle.value = true
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: year.value,
        month: month.value,
        events: events.value
      })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || 'No se pudo conectar al servidor de Oracle.')
    }
    showSaveConfirmModal.value = false
    showToast(data.message || 'Registros guardados en la base de datos exitosamente.', 'success')

    // Reload persisted rows from DB so all rows are tagged with their dbId and id
    try {
      const reloadRes = await fetch(`/api/events?year=${year.value}&month=${month.value}`)
      if (reloadRes.ok) {
        const reloadData = await reloadRes.json()
        if (Array.isArray(reloadData.events) && reloadData.events.length > 0) {
          events.value = reloadData.events
          saveDraft(year.value, month.value, reloadData.events)
        }
      }
    } catch {
      // ignore
    }
  } catch (err: any) {
    showToast(`Error al guardar en la BD: ${err.message}. El borrador local permanece seguro.`, 'error')
  } finally {
    isSavingOracle.value = false
  }
}

// Initial seed if first visit
onMounted(() => {
  if (events.value.length === 0) {
    const d = loadDraft(year.value, month.value)
    if (!d || d.events.length === 0) {
      const padM = String(month.value).padStart(2, '0')
      events.value = [
        {
          id: 'demo-1',
          sistema: 'CORE T24',
          componente: 'Base de Datos Oracle',
          fecha: `${year.value}-${padM}-05`,
          horaInicio: '02:15:00',
          horaFin: '02:45:00',
          tiempoServicioAbajo: '00:30:00',
          durationMinutes: 30,
          durationSeconds: 1800,
          indicador: 'II-PROGRAMADA',
          responsable: 'DBA / Infraestructura',
          origen: 'Mantenimiento Programado',
          declarado: true,
          bitacora: 'INC-2026-0812',
          motivo: 'Aplicación de parches de seguridad trimestral en nodo principal RAC',
          solucion: 'Reinicio controlado de instancias y validación de listeners',
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-2',
          sistema: 'BANCA MOVIL',
          componente: 'API Gateway',
          fecha: `${year.value}-${padM}-12`,
          horaInicio: '14:20:00',
          horaFin: '14:38:00',
          tiempoServicioAbajo: '00:18:00',
          durationMinutes: 18,
          durationSeconds: 1080,
          indicador: 'II-FALLAS',
          responsable: 'Canales Digitales',
          origen: 'Alerta Dynatrace',
          declarado: false,
          bitacora: 'INC-2026-0943',
          motivo: 'Degradación por saturación de conexiones HTTP en balanceador',
          solucion: 'Aumento de pool de conexiones y reinicio de contenedores pod',
          createdAt: new Date().toISOString()
        }
      ]
    }
  }
})
</script>
