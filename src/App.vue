<template>
  <div class="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800">
    <Header :year="year" :month="month" :total-hours="totalHours" />

    <main class="mx-auto w-full max-w-6xl flex-1 space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <transition enter-active-class="transition duration-200" enter-from-class="translate-y-1 opacity-0" leave-active-class="transition duration-100" leave-to-class="opacity-0">
        <div
          v-if="toast.show"
          :class="[
            'fixed bottom-5 right-5 z-50 flex max-w-md items-center gap-3 rounded-xl border p-4 text-xs font-semibold shadow-lg',
            toast.type === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' :
            toast.type === 'error' ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-blue-300 bg-blue-50 text-blue-900'
          ]"
        >
          <span>{{ toast.message }}</span>
          <button class="ml-auto text-slate-400 hover:text-slate-700" @click="toast.show = false">✕</button>
        </div>
      </transition>

      <PeriodSelector
        v-model:month="month"
        v-model:year="year"
        :total-minutes="totalMinutes"
        :period-status="periodStatus"
        :existing-records="existingRecords"
        @view-existing="loadExistingEvents"
      />

      <section v-if="showExistingEvents" class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 class="text-base font-bold text-slate-900">Registros cargados — {{ monthName }} {{ year }}</h2>
            <p class="mt-1 text-xs text-slate-500">{{ existingEvents.length }} registros encontrados en Oracle.</p>
          </div>
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50" @click="showExistingEvents = false">Cerrar</button>
        </div>
        <div v-if="isLoadingExisting" class="p-6 text-center text-sm text-slate-500">Cargando registros…</div>
        <div v-else-if="existingEvents.length" class="max-h-[32rem] overflow-auto">
          <table class="min-w-full text-left text-xs">
            <thead class="sticky top-0 bg-slate-100 text-slate-600">
              <tr><th class="px-4 py-3">Sistema</th><th class="px-4 py-3">Inicio</th><th class="px-4 py-3">Fin</th><th class="px-4 py-3">Duración</th><th class="px-4 py-3">Indicador</th><th class="px-4 py-3">Motivo</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="event in existingEvents" :key="event.id" class="hover:bg-slate-50">
                <td class="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{{ event.sistema }}</td>
                <td class="whitespace-nowrap px-4 py-3">{{ formatStoredDate(event.inicio) }}</td>
                <td class="whitespace-nowrap px-4 py-3">{{ formatStoredDate(event.fin) }}</td>
                <td class="whitespace-nowrap px-4 py-3">{{ formatMinutes(event.duracionMinutos) }}</td>
                <td class="whitespace-nowrap px-4 py-3">{{ event.indicador }}</td>
                <td class="min-w-56 px-4 py-3">{{ event.motivo || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="p-6 text-center text-sm text-slate-500">No hay registros guardados para este período.</p>
      </section>

      <FileUpload
        :file-name="fileName"
        :total-events="rawEvents.length"
        :warnings="warnings"
        :can-upload="canUpload"
        :is-uploading="isUploading"
        :validation-message="periodValidationMessage"
        @file-selected="handleFileSelected"
        @upload="handleUpload"
        @download-template="handleDownloadTemplate"
      />

      <section v-if="fileName" class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h2 class="text-base font-bold text-slate-900">Previsualización</h2>
          <p class="mt-1 text-xs text-slate-500">Resultado calculado con {{ totalMinutes.toLocaleString('es-BO') }} minutos para {{ monthName.toLowerCase() }} de {{ year }}.</p>
        </div>

        <div v-if="report.systems.length" class="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
          <button
            type="button"
            :class="tabClass(activeTab === 'general')"
            @click="activeTab = 'general'"
          >
            Resumen
          </button>
          <button
            v-for="system in report.systems"
            :key="system.sistema"
            type="button"
            :class="tabClass(activeTab === system.sistema)"
            @click="activeTab = system.sistema"
          >
            {{ system.sistema }}
          </button>
        </div>

        <div v-if="report.systems.length" class="pt-1">
          <GeneralSummaryTab v-if="activeTab === 'general'" :report="report" />
          <SystemPreviewTab v-else-if="activeSystemMetrics" :system-metrics="activeSystemMetrics" />
        </div>
        <p v-else class="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">La planilla no contiene registros válidos para previsualizar.</p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import saveAs from 'file-saver'
import type { RawEventRecord } from './types/uptime'
import type { ParsedExcelResult } from './utils/excelParser'
import { calculateUptimeMetrics, getMonthNameSpanish } from './utils/calculator'
import { parseExcelBuffer } from './utils/excelParser'
import { generateEmptyTemplateWorkbook } from './utils/excelGenerator'
import Header from './components/Header.vue'
import PeriodSelector from './components/PeriodSelector.vue'
import FileUpload from './components/FileUpload.vue'
import SystemPreviewTab from './components/SystemPreviewTab.vue'
import GeneralSummaryTab from './components/GeneralSummaryTab.vue'

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const rawEvents = ref<RawEventRecord[]>([])
const fileName = ref<string | null>(null)
const warnings = ref<string[]>([])
const parsedPeriod = ref<Pick<ParsedExcelResult, 'detectedMonth' | 'detectedYear' | 'detectedPeriods'> | null>(null)
const isUploading = ref(false)
const activeTab = ref('general')
const periodStatus = ref<'checking' | 'empty' | 'loaded' | 'unavailable'>('checking')
const existingRecords = ref(0)
interface StoredEvent {
  id: string
  sistema: string
  inicio: string
  fin: string
  indicador: string
  motivo: string
  duracionMinutos: number
}
const existingEvents = ref<StoredEvent[]>([])
const showExistingEvents = ref(false)
const isLoadingExisting = ref(false)
const toast = ref<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({ show: false, message: '', type: 'info' })

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toast.value = { show: true, message, type }
  window.setTimeout(() => { toast.value.show = false }, 4500)
}

const systemsFromFile = computed(() => {
  const names: string[] = []
  for (const event of rawEvents.value) {
    const name = event.sistema.trim()
    if (name && !names.some(item => item.toUpperCase() === name.toUpperCase())) names.push(name)
  }
  return names
})

const report = computed(() => calculateUptimeMetrics(rawEvents.value, year.value, month.value, systemsFromFile.value))
const totalHours = computed(() => report.value.totalMonthHours)
const totalMinutes = computed(() => report.value.totalMonthMinutes)
const monthName = computed(() => getMonthNameSpanish(month.value))
const activeSystemMetrics = computed(() => report.value.systems.find(system => system.sistema === activeTab.value))
const hasMixedPeriods = computed(() => (parsedPeriod.value?.detectedPeriods.length || 0) > 1)
const periodMatches = computed(() => {
  if (!parsedPeriod.value?.detectedMonth || !parsedPeriod.value.detectedYear) return false
  return parsedPeriod.value.detectedMonth === month.value && parsedPeriod.value.detectedYear === year.value
})
const periodValidationMessage = computed(() => {
  if (!rawEvents.value.length) return 'La planilla no contiene registros válidos.'
  if (!parsedPeriod.value?.detectedMonth || !parsedPeriod.value.detectedYear) return 'No se pudo detectar el mes y año de los registros. Revisa la columna FECHA.'
  if (hasMixedPeriods.value) {
    const periods = parsedPeriod.value.detectedPeriods.map(period => `${getMonthNameSpanish(period.month).toLowerCase()} ${period.year || '(sin año)'}`).join(', ')
    return `La planilla contiene más de un período: ${periods}. Debe contener un solo mes y año.`
  }
  const detected = `${getMonthNameSpanish(parsedPeriod.value.detectedMonth).toLowerCase()} de ${parsedPeriod.value.detectedYear}`
  if (!periodMatches.value) return `El archivo corresponde a ${detected}, pero seleccionaste ${monthName.value.toLowerCase()} de ${year.value}. Ajusta el período para continuar.`
  if (periodStatus.value === 'loaded') return `Período validado. Ya existen ${existingRecords.value} registros; puedes revisar el detalle y cargar registros adicionales.`
  return `Período validado: ${detected}. Puedes subir los registros.`
})
const canUpload = computed(() => rawEvents.value.length > 0 && periodMatches.value && !hasMixedPeriods.value && ['empty', 'loaded', 'unavailable'].includes(periodStatus.value) && !isUploading.value)

let statusRequest = 0
async function checkPeriodStatus() {
  const request = ++statusRequest
  periodStatus.value = 'checking'
  try {
    const response = await fetch(`/api/events/status?year=${year.value}&month=${month.value}`)
    if (!response.ok) throw new Error('status unavailable')
    const data = await response.json()
    if (request !== statusRequest) return
    existingRecords.value = Number(data.total || 0)
    periodStatus.value = data.loaded ? 'loaded' : 'empty'
  } catch {
    if (request !== statusRequest) return
    existingRecords.value = 0
    periodStatus.value = 'unavailable'
  }
}

watch([month, year], () => {
  activeTab.value = 'general'
  showExistingEvents.value = false
  existingEvents.value = []
  checkPeriodStatus()
}, { immediate: true })

async function handleFileSelected(file: File) {
  try {
    const result = await parseExcelBuffer(await file.arrayBuffer())
    rawEvents.value = result.events
    parsedPeriod.value = result
    fileName.value = file.name
    warnings.value = result.warnings
    activeTab.value = 'general'

    if (result.detectedMonth) {
      month.value = result.detectedMonth
    }
    if (result.detectedYear) {
      year.value = result.detectedYear
    }

    showToast(`Planilla analizada: ${result.events.length} registros listos para previsualizar.`, 'success')
    await checkPeriodStatus()
  } catch (error: any) {
    rawEvents.value = []
    fileName.value = null
    warnings.value = []
    parsedPeriod.value = null
    showToast(`No se pudo leer la planilla: ${error.message || error}`, 'error')
  }
}

async function handleDownloadTemplate() {
  try {
    const template = await generateEmptyTemplateWorkbook()
    saveAs(template, 'Plantilla_Eventos_Mensuales.xlsx')
    showToast('Plantilla Excel descargada.', 'success')
  } catch (error: any) {
    showToast(`No se pudo generar la plantilla: ${error.message || error}`, 'error')
  }
}

async function loadExistingEvents() {
  showExistingEvents.value = true
  isLoadingExisting.value = true
  try {
    const response = await fetch(`/api/events?year=${year.value}&month=${month.value}`)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.message || 'No se pudieron consultar los registros.')
    existingEvents.value = Array.isArray(data.events) ? data.events : []
  } catch (error: any) {
    existingEvents.value = []
    showToast(error.message || 'No se pudieron consultar los registros.', 'error')
  } finally {
    isLoadingExisting.value = false
  }
}

function formatStoredDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es-BO', { dateStyle: 'short', timeStyle: 'medium' }).format(date)
}

function formatMinutes(value: number) {
  const totalSeconds = Math.max(0, Math.round(Number(value || 0) * 60))
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

async function handleUpload() {
  if (!canUpload.value) {
    showToast(periodValidationMessage.value, 'error')
    return
  }
  isUploading.value = true
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: rawEvents.value })
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.message || 'No se pudieron guardar los registros en Oracle.')
    showToast(data.message || 'Los registros se guardaron correctamente.', 'success')
    await checkPeriodStatus()
    if (showExistingEvents.value) await loadExistingEvents()
  } catch (error: any) {
    showToast(error.message || 'El servidor de Oracle no está disponible.', 'error')
  } finally {
    isUploading.value = false
  }
}

function tabClass(active: boolean) {
  return [
    'whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition',
    active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
  ]
}
</script>
