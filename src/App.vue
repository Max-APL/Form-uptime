<template>
  <div class="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800">
    
    <!-- Top Header -->
    <Header
      v-model:year="year"
      v-model:month="month"
      v-model:active-tab="activeTab"
      :draft-status-text="currentDraftStatusText"
      :is-saving-oracle="isSavingOracle || isSavingNetworkOracle"
      :total-records="events.length"
      :total-network-records="networkRecords.length"
      @add-row="addNewRowInline"
      @add-network-row="addNewNetworkRow"
      @open-paste-modal="showPasteModal = true"
      @open-network-paste-modal="showNetworkPasteModal = true"
      @open-report-modal="showReportModal = true"
      @open-official-report="showOfficialReportModal = true"
      @export-excel="handleExportExcel"
      @export-network-excel="handleExportNetworkExcel"
      @save-oracle="handleSaveToOracle"
      @save-network-oracle="handleSaveNetworkToOracle"
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
      
      <!-- 1. Formulario de Sistemas Críticos (Core & Canales) -->
      <template v-if="activeTab === 'sistemas'">
        <UptimeTable
          :events="events"
          :available-systems="customSystems"
          @update-events="handleUpdateEvents"
          @open-detail-modal="openDetailModal"
          @open-create-modal="openCreateModal"
          @add-row-inline="addNewRowInline"
        />
        <MetricsSummary :summary="report.summary" />
      </template>

      <!-- 2. Formulario de Enlaces de Red (Telecom, Agencias & ATMs) -->
      <template v-else>
        <NetworkTable
          :records="networkRecords"
          :reference-date="defaultPeriodDate"
          @update:records="handleUpdateNetworkRecords"
        />
      </template>

    </main>

    <!-- Bulk Actions Floating Bar (Only for Incidentes) -->
    <BulkActionsBar
      v-if="activeTab === 'sistemas'"
      :selected-count="selectedCount"
      @batch-set-declarado="handleBatchSetDeclarado"
      @batch-set-revision="handleBatchSetRevision"
      @batch-set-indicador="handleBatchSetIndicador"
      @batch-delete="handleBatchDelete"
      @clear-selection="handleClearSelection"
    />

    <!-- Paste from Clipboard Modal for Sistemas -->
    <PasteImportModal
      :is-open="showPasteModal"
      @close="showPasteModal = false"
      @import-records="handleImportRecords"
    />

    <!-- Paste from Clipboard Modal for Enlaces de Red -->
    <NetworkPasteModal
      :is-open="showNetworkPasteModal"
      :default-reference-date="defaultPeriodDate"
      @close="showNetworkPasteModal = false"
      @import-records="handleImportNetworkRecords"
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

    <!-- Official BMSC Report Modal (PDF / Print) -->
    <OfficialReportModal
      :is-open="showOfficialReportModal"
      :report="report"
      :events="events"
      :year="year"
      :month="month"
      @close="showOfficialReportModal = false"
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

import type { NetworkEventRecord } from './types/networkUptime'
import { DEFAULT_ENLACES } from './types/networkUptime'
import { loadNetworkDraft, saveNetworkDraft } from './utils/networkStorage'
import { exportNetworkEventsToExcel } from './utils/networkExcelExporter'

import Header from './components/Header.vue'
import MetricsSummary from './components/MetricsSummary.vue'
import UptimeTable from './components/UptimeTable.vue'
import NetworkTable from './components/NetworkTable.vue'
import BulkActionsBar from './components/BulkActionsBar.vue'
import PasteImportModal from './components/PasteImportModal.vue'
import NetworkPasteModal from './components/NetworkPasteModal.vue'
import RowEditorModal from './components/RowEditorModal.vue'
import ConsolidatedReportModal from './components/ConsolidatedReportModal.vue'
import OfficialReportModal from './components/OfficialReportModal.vue'
import SaveDbConfirmModal from './components/SaveDbConfirmModal.vue'

// Active tab ('sistemas' | 'redes')
const activeTab = ref<'sistemas' | 'redes'>('sistemas')

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)

// ==========================================
// 1. Sistemas Críticos State (Downtime Events)
// ==========================================
const events = ref<EventRecordV2[]>([])
const draftTimestamp = ref(0)
const draftStatusText = ref('Borrador listo')
const isSavingOracle = ref(false)

const showPasteModal = ref(false)
const showReportModal = ref(false)
const showOfficialReportModal = ref(false)
const showEditorModal = ref(false)
const showSaveConfirmModal = ref(false)
const isCreatingNew = ref(false)
const selectedRecordForEdit = ref<EventRecordV2 | null>(null)

// ==========================================
// 2. Enlaces de Red State (Network Uptime)
// ==========================================
const networkRecords = ref<NetworkEventRecord[]>([])
const networkDraftTimestamp = ref(0)
const networkDraftStatusText = ref('Borrador listo')
const isSavingNetworkOracle = ref(false)
const showNetworkPasteModal = ref(false)

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

// Dynamic calculation of Uptime metrics for systems
const report = computed(() => {
  return calculateUptimeMetricsV2(events.value, year.value, month.value, customSystems.value)
})

const selectedCount = computed(() => {
  return events.value.filter(e => e.selected).length
})

// Current draft status text based on active tab
const currentDraftStatusText = computed(() => {
  return activeTab.value === 'sistemas' ? draftStatusText.value : networkDraftStatusText.value
})

// Default date for selected period
const defaultPeriodDate = computed(() => {
  const padM = String(month.value).padStart(2, '0')
  const isCurrentMonth = year.value === now.getFullYear() && month.value === (now.getMonth() + 1)
  return isCurrentMonth ? now.toISOString().slice(0, 10) : `${year.value}-${padM}-01`
})

// ==========================================
// Persistence & Data Loading
// ==========================================

// Load or change period draft for Sistemas
async function loadPeriodData() {
  const draft = loadDraft(year.value, month.value)
  if (draft && draft.events && draft.events.length > 0) {
    events.value = draft.events
    draftTimestamp.value = draft.timestamp
    draftStatusText.value = formatTimeAgo(draft.timestamp)
  } else {
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
      // offline or oracle unavailable
    }
    events.value = []
    draftTimestamp.value = Date.now()
    draftStatusText.value = 'Sin registros para este período'
  }
}

// Load or change period draft for Redes
async function loadNetworkPeriodData() {
  const draft = loadNetworkDraft(year.value, month.value)
  if (draft && draft.records && draft.records.length > 0) {
    networkRecords.value = draft.records
    networkDraftTimestamp.value = draft.timestamp
    networkDraftStatusText.value = formatTimeAgo(draft.timestamp)
  } else {
    try {
      const res = await fetch(`/api/network-events?year=${year.value}&month=${month.value}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.records) && data.records.length > 0) {
          networkRecords.value = data.records
          networkDraftTimestamp.value = Date.now()
          networkDraftStatusText.value = 'Cargado de la BD'
          saveNetworkDraft(year.value, month.value, data.records)
          return
        }
      }
    } catch {
      // offline or oracle unavailable
    }
    networkRecords.value = []
    networkDraftTimestamp.value = Date.now()
    networkDraftStatusText.value = 'Sin enlaces para este período'
  }
}

watch([year, month], () => {
  loadPeriodData()
  loadNetworkPeriodData()
}, { immediate: true })

// Auto-save draft on any change to events
watch(events, () => {
  saveDraft(year.value, month.value, events.value)
  draftTimestamp.value = Date.now()
  draftStatusText.value = formatTimeAgo(draftTimestamp.value)
}, { deep: true })

// Auto-save draft on any change to networkRecords
watch(networkRecords, () => {
  saveNetworkDraft(year.value, month.value, networkRecords.value)
  networkDraftTimestamp.value = Date.now()
  networkDraftStatusText.value = formatTimeAgo(networkDraftTimestamp.value)
}, { deep: true })

setInterval(() => {
  if (draftTimestamp.value > 0) {
    draftStatusText.value = formatTimeAgo(draftTimestamp.value)
  }
  if (networkDraftTimestamp.value > 0) {
    networkDraftStatusText.value = formatTimeAgo(networkDraftTimestamp.value)
  }
}, 30000)

// ==========================================
// Handlers for Sistemas Críticos
// ==========================================
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
    revision: false,
    bitacora: '',
    motivo: '',
    solucion: '',
    createdAt: new Date().toISOString()
  }

  events.value.unshift(newRow)
  showToast('Nueva fila agregada a la tabla de incidentes.', 'info')
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
    revision: false,
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

// Bulk batch operations for Sistemas
function handleBatchSetDeclarado(val: boolean) {
  events.value.forEach(e => {
    if (e.selected) e.declarado = val
  })
  showToast(`${selectedCount.value} incidentes marcados como ${val ? 'Declarado' : 'No Declarado'}.`, 'success')
}

function handleBatchSetRevision(val: boolean) {
  events.value.forEach(e => {
    if (e.selected) e.revision = val
  })
  showToast(`${selectedCount.value} incidentes marcados como ${val ? 'Revisado' : 'Pendiente'}.`, 'success')
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

// Import records from clipboard modal for Sistemas
function handleImportRecords(records: EventRecordV2[], mode: 'append' | 'replace') {
  if (mode === 'replace') {
    events.value = records
    showToast(`Se reemplazó la tabla con ${records.length} incidentes importados.`, 'success')
  } else {
    events.value = [...records, ...events.value]
    showToast(`Se agregaron ${records.length} incidentes a la tabla.`, 'success')
  }
}

// Export Excel for Sistemas
async function handleExportExcel() {
  if (events.value.length === 0) {
    showToast('No hay incidentes para exportar.', 'info')
    return
  }
  try {
    await exportEventsToExcelV2(events.value, report.value, year.value, month.value)
    showToast('Archivo Excel de incidentes descargado exitosamente.', 'success')
  } catch (err: any) {
    showToast(`Error al generar Excel: ${err.message || err}`, 'error')
  }
}

// Save to Oracle DB for Sistemas
function handleSaveToOracle() {
  if (events.value.length === 0) {
    showToast('No hay registros en la tabla para guardar.', 'info')
    return
  }
  showSaveConfirmModal.value = true
}

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
    showToast(data.message || 'Registros guardados en Oracle exitosamente.', 'success')

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

// ==========================================
// Handlers for Enlaces de Red
// ==========================================
function handleUpdateNetworkRecords(updated: NetworkEventRecord[]) {
  networkRecords.value = updated
}

function addNewNetworkRow() {
  const newRow: NetworkEventRecord = {
    id: `net-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    creadoEn: new Date().toISOString(),
    fecha: defaultPeriodDate.value,
    enlace: DEFAULT_ENLACES[0],
    departamento: 'NACIONAL',
    nombre: '',
    uptimeMensual: 100,
    uptimeAnual: 100,
    selected: false
  }

  networkRecords.value.unshift(newRow)
  showToast('Nueva fila de enlace agregada a la tabla.', 'info')
}

function handleImportNetworkRecords(payload: { records: NetworkEventRecord[]; mode: 'append' | 'replace' }) {
  if (payload.mode === 'replace') {
    networkRecords.value = payload.records
    showToast(`Se reemplazaron los datos con ${payload.records.length} enlaces importados.`, 'success')
  } else {
    networkRecords.value = [...payload.records, ...networkRecords.value]
    showToast(`Se agregaron ${payload.records.length} enlaces a la tabla.`, 'success')
  }
}

async function handleExportNetworkExcel() {
  if (networkRecords.value.length === 0) {
    showToast('No hay enlaces de red para exportar.', 'info')
    return
  }
  try {
    await exportNetworkEventsToExcel(networkRecords.value, year.value, report.value.monthName)
    showToast('Archivo Excel de Enlaces descargado exitosamente.', 'success')
  } catch (err: any) {
    showToast(`Error al exportar Excel de Redes: ${err.message || err}`, 'error')
  }
}

async function handleSaveNetworkToOracle() {
  if (networkRecords.value.length === 0) {
    showToast('No hay enlaces de red en la tabla para guardar.', 'info')
    return
  }

  const ok = window.confirm(`¿Confirmas guardar ${networkRecords.value.length} enlaces de red en la tabla EVENTOS_REDES de Oracle para el período ${report.value.monthName} ${year.value}?`)
  if (!ok) return

  isSavingNetworkOracle.value = true
  try {
    const res = await fetch('/api/network-events/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: year.value,
        month: month.value,
        records: networkRecords.value
      })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || 'No se pudo conectar al servidor de Oracle.')
    }
    showToast(data.message || 'Enlaces guardados en Oracle exitosamente.', 'success')

    try {
      const reloadRes = await fetch(`/api/network-events?year=${year.value}&month=${month.value}`)
      if (reloadRes.ok) {
        const reloadData = await reloadRes.json()
        if (Array.isArray(reloadData.records) && reloadData.records.length > 0) {
          networkRecords.value = reloadData.records
          saveNetworkDraft(year.value, month.value, reloadData.records)
        }
      }
    } catch {
      // ignore
    }
  } catch (err: any) {
    showToast(`Error al guardar en EVENTOS_REDES: ${err.message}. El borrador local permanece seguro.`, 'error')
  } finally {
    isSavingNetworkOracle.value = false
  }
}

// Initial seed if first visit
onMounted(() => {
  // Seed demo incidentes if empty
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
          revision: true,
          bitacora: '02:15 Notificación de alerta por correo del DBA. 02:22 Inicio de ventana de mantenimiento con Infraestructura. 02:45 Servicios validados y correos de conformidad enviados.',
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
          revision: false,
          bitacora: '14:20 Alerta crítica Dynatrace en correo/chat de soporte. 14:25 Se escala con equipo de Canales Digitales. 14:38 Despliegue de hotfix y normalización de balanceadores.',
          motivo: 'Degradación por saturación de conexiones HTTP en balanceador',
          solucion: 'Aumento de pool de conexiones y reinicio de contenedores pod',
          createdAt: new Date().toISOString()
        }
      ]
    }
  }

  // Seed demo network records if empty
  if (networkRecords.value.length === 0) {
    const netDraft = loadNetworkDraft(year.value, month.value)
    if (!netDraft || netDraft.records.length === 0) {
      const padM = String(month.value).padStart(2, '0')
      const refDate = `${year.value}-${padM}-01`
      networkRecords.value = [
        {
          id: 'net-demo-1',
          creadoEn: new Date().toISOString(),
          fecha: refDate,
          enlace: 'ENLACES WAN NACIONAL',
          departamento: 'NACIONAL',
          nombre: 'ENTEL (Enlace Principal WAN)',
          uptimeMensual: 99.9850,
          uptimeAnual: 99.9990
        },
        {
          id: 'net-demo-2',
          creadoEn: new Date().toISOString(),
          fecha: refDate,
          enlace: 'ENLACES WAN NACIONAL',
          departamento: 'NACIONAL',
          nombre: 'TIGO (Enlace de Respaldo WAN)',
          uptimeMensual: 100.0000,
          uptimeAnual: 99.9950
        },
        {
          id: 'net-demo-3',
          creadoEn: new Date().toISOString(),
          fecha: refDate,
          enlace: 'ENLACES SD-WAN NACIONALES',
          departamento: 'NACIONAL',
          nombre: 'SD-WAN INFRAESTRUCTURA BMSC',
          uptimeMensual: 99.9720,
          uptimeAnual: 99.9910
        },
        {
          id: 'net-demo-4',
          creadoEn: new Date().toISOString(),
          fecha: refDate,
          enlace: 'ENLACES AGENCIAS NACIONAL',
          departamento: 'LA PAZ',
          nombre: 'AGENCIA CENTRAL LA PAZ',
          uptimeMensual: 100.0000,
          uptimeAnual: 100.0000
        },
        {
          id: 'net-demo-5',
          creadoEn: new Date().toISOString(),
          fecha: refDate,
          enlace: 'ENLACES ATMS NACIONAL',
          departamento: 'SANTA CRUZ',
          nombre: 'ATM EQUIPETROL 24 HORAS',
          uptimeMensual: 99.9500,
          uptimeAnual: 99.9800
        }
      ]
    }
  }
})
</script>
