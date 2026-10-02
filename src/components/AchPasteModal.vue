<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
    <div class="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl my-6 flex flex-col max-h-[92vh]">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#004D2C]/10 text-[#004D2C] border border-[#004D2C]/20 shadow-2xs">
            <Upload class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Importar ACH Estadísticas desde Excel
            </h3>
            <p class="text-xs text-slate-500">
              Carga tu archivo .xlsx o pega datos para resoluciones de transferencias ACH y MLD Banco Central.
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="handleClose"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          title="Cerrar modal"
        >
          ✕
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="p-6 space-y-5 overflow-y-auto flex-1">
        
        <!-- 1. Card: Previsualización de la Plantilla & Botón de Descarga -->
        <div class="rounded-xl border border-[#004D2C]/20 bg-[#004D2C]/[0.03] p-4 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <FileSpreadsheet class="h-4 w-4 text-[#004D2C]" />
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Estructura de la Plantilla ACH_ESTADISTICAS
              </span>
              <span class="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-[#004D2C]">
                8 Columnas
              </span>
            </div>

            <!-- Botón de Descargar Plantilla -->
            <button
              type="button"
              @click="handleDownloadTemplate"
              class="flex items-center gap-1.5 rounded-lg bg-[#004D2C] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#003B22] transition cursor-pointer shrink-0"
              title="Descargar archivo Excel con formato oficial ACH y Banco Central MLD"
            >
              <Download class="h-3.5 w-3.5" />
              <span>Descargar Plantilla Excel (.xlsx)</span>
            </button>
          </div>

          <p class="text-[11px] text-slate-600">
            Tu archivo o datos copiados deben incluir estos campos (campos MLD corresponden a Banco Central):
          </p>

          <!-- Visual Table Mockup / Preview -->
          <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
            <table class="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr class="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th class="px-2 py-2 whitespace-nowrap">FECHA</th>
                  <th class="px-2 py-2 whitespace-nowrap">TIPO ACH</th>
                  <th class="px-2 py-2 whitespace-nowrap text-right">CANTIDAD</th>
                  <th class="px-2 py-2 whitespace-nowrap text-right">MONTO (BS.)</th>
                  <th class="px-2 py-2 whitespace-nowrap text-blue-800 bg-blue-50/50">TIPO MLD</th>
                  <th class="px-2 py-2 whitespace-nowrap text-right text-blue-800 bg-blue-50/50">CANT. MLD</th>
                  <th class="px-2 py-2 whitespace-nowrap text-right text-blue-800 bg-blue-50/50">MONTO MLD</th>
                  <th class="px-2 py-2 whitespace-nowrap text-center text-amber-800 bg-amber-50/50">REVISIÓN</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-600 font-sans">
                <tr class="hover:bg-slate-50/50 bg-slate-50/30">
                  <td class="px-2 py-1.5 font-mono text-slate-500">2026-08-31</td>
                  <td class="px-2 py-1.5 font-semibold text-slate-800">
                    <span class="rounded bg-emerald-100 text-emerald-800 px-1 py-0.2 text-[9px] mr-1">ACH</span>
                    TRANSF. ENTRANTE
                  </td>
                  <td class="px-2 py-1.5 font-mono text-right text-slate-700 font-bold">154</td>
                  <td class="px-2 py-1.5 font-mono text-right text-emerald-700 font-bold">Bs 845.200,50</td>
                  <td class="px-2 py-1.5 text-blue-900 bg-blue-50/30 font-medium">LIQUIDACION MLD</td>
                  <td class="px-2 py-1.5 font-mono text-right text-blue-900 bg-blue-50/30 font-bold">25</td>
                  <td class="px-2 py-1.5 font-mono text-right text-blue-900 bg-blue-50/30 font-bold">Bs 132.000,00</td>
                  <td class="px-2 py-1.5 text-center bg-blue-50/20">
                    <span class="rounded px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">SÍ (1)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. Tabs: Subir Archivo vs Pegar Texto -->
        <div>
          <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              @click="activeMode = 'file'"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer"
              :class="activeMode === 'file' ? 'bg-[#004D2C] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'"
            >
              <UploadCloud class="h-3.5 w-3.5" />
              <span>Subir Archivo Excel</span>
            </button>

            <button
              type="button"
              @click="activeMode = 'paste'"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer"
              :class="activeMode === 'paste' ? 'bg-[#004D2C] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'"
            >
              <ClipboardPaste class="h-3.5 w-3.5" />
              <span>Pegar desde Portapapeles (Ctrl+V)</span>
            </button>
          </div>
        </div>

        <!-- 3A. Modo Archivo: Dropzone -->
        <div v-if="activeMode === 'file'" class="space-y-3">
          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            @click="triggerFileInput"
            class="relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200"
            :class="[
              isDragging ? 'border-[#004D2C] bg-[#004D2C]/10 scale-[0.99]' : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-400',
              uploadedFile ? 'border-emerald-300 bg-emerald-50/30' : ''
            ]"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".xlsx,.xls,.csv"
              class="hidden"
              @change="handleFileInputChange"
            />

            <!-- Loading Spinner -->
            <div v-if="isParsingFile" class="flex flex-col items-center justify-center gap-2 py-4">
              <Loader2 class="h-8 w-8 animate-spin text-[#004D2C]" />
              <span class="text-xs font-bold text-slate-700">Analizando archivo Excel de ACH...</span>
            </div>

            <!-- Uploaded File State -->
            <div v-else-if="uploadedFile" class="flex items-center justify-between">
              <div class="flex items-center gap-3 text-left">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <FileSpreadsheet class="h-5 w-5" />
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{{ uploadedFile.name }}</span>
                    <span class="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] font-mono">
                      {{ formatFileSize(uploadedFile.size) }}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-500">
                    {{ parsedRecords.length }} registros detectados correctamente. Haz clic para cambiar archivo.
                  </div>
                </div>
              </div>

              <button
                type="button"
                @click.stop="clearFile"
                class="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                title="Quitar archivo"
              >
                ✕
              </button>
            </div>

            <!-- Idle State -->
            <div v-else class="flex flex-col items-center justify-center gap-2 py-2">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200/80 text-slate-600">
                <UploadCloud class="h-5 w-5" />
              </div>
              <div class="text-xs text-slate-700">
                <strong class="font-bold text-[#004D2C]">Haz clic para examinar</strong> o arrastra tu archivo Excel de ACH aquí
              </div>
              <div class="text-[11px] text-slate-400 font-mono">
                Formatos compatibles: .xlsx, .xls, .csv
              </div>
            </div>
          </div>
        </div>

        <!-- 3B. Modo Portapapeles: Textarea -->
        <div v-else class="space-y-3">
          <div class="flex items-center justify-between text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200">
            <span class="font-semibold text-slate-700">Fecha de Referencia por defecto:</span>
            <input
              v-model="referenceDate"
              type="date"
              @change="reprocessIfPresent"
              class="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-[#004D2C] focus:outline-none shadow-2xs"
            />
          </div>

          <p class="text-xs text-slate-600">
            Copia filas de tu Excel con las columnas (ej: <em>Fecha, Tipo, Cantidad, Monto, Tipo MLD, Cantidad MLD, Monto MLD, Revisión</em>) y pégalas aquí:
          </p>
          <textarea
            v-model="pasteText"
            @input="handlePasteTextChange"
            rows="5"
            placeholder="Pega aquí el contenido copiado de Excel (Ctrl+V)..."
            class="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#004D2C] focus:outline-none shadow-2xs"
          ></textarea>
        </div>

        <!-- Warnings alert -->
        <div v-if="parseWarnings.length > 0" class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-1">
          <div class="font-bold flex items-center gap-1.5">
            <AlertCircle class="h-4 w-4 text-amber-600 shrink-0" />
            <span>Advertencias durante el análisis:</span>
          </div>
          <ul class="list-disc pl-5 text-[11px] space-y-0.5">
            <li v-for="(w, idx) in parseWarnings" :key="idx">{{ w }}</li>
          </ul>
        </div>

        <!-- Preview of parsed records -->
        <div v-if="parsedRecords.length > 0" class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#004D2C] flex items-center gap-1.5">
              <CheckCircle2 class="h-4 w-4" />
              Se detectaron {{ parsedRecords.length }} fila(s) listas para importar.
            </span>
          </div>

          <!-- Preview Table -->
          <div class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/40 text-[11px]">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th class="px-2 py-1.5">Fecha</th>
                  <th class="px-2 py-1.5">Tipo ACH</th>
                  <th class="px-2 py-1.5 text-right">Cant. ACH</th>
                  <th class="px-2 py-1.5 text-right">Monto ACH (Bs.)</th>
                  <th class="px-2 py-1.5 text-blue-900">Tipo MLD</th>
                  <th class="px-2 py-1.5 text-right text-blue-900">Cant. MLD</th>
                  <th class="px-2 py-1.5 text-right text-blue-900">Monto MLD (Bs.)</th>
                  <th class="px-2 py-1.5 text-center">Revisión</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="r in previewRecords" :key="r.id" class="bg-white">
                  <td class="px-2 py-1.5 font-mono text-slate-600">{{ r.fecha }}</td>
                  <td class="px-2 py-1.5 font-medium text-slate-900">{{ r.tipo }}</td>
                  <td class="px-2 py-1.5 font-mono text-right font-bold text-slate-800">{{ formatQuantity(r.cantidad) }}</td>
                  <td class="px-2 py-1.5 font-mono text-right font-bold text-emerald-700">{{ formatCurrencyBs(r.monto) }}</td>
                  <td class="px-2 py-1.5 text-blue-900 font-medium">{{ r.tipoMld || '-' }}</td>
                  <td class="px-2 py-1.5 font-mono text-right font-bold text-blue-900">{{ formatQuantity(r.cantidadMld) }}</td>
                  <td class="px-2 py-1.5 font-mono text-right font-bold text-blue-900">{{ formatCurrencyBs(r.montoMld) }}</td>
                  <td class="px-2 py-1.5 text-center">
                    <span
                      class="rounded px-1.5 py-0.2 text-[9px] font-bold"
                      :class="r.revision === 1 ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'"
                    >
                      {{ r.revision === 1 ? 'SÍ' : 'NO' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="parsedRecords.length > 4" class="text-right text-[10px] text-slate-400">
            Mostrando las primeras 4 filas de {{ parsedRecords.length }} en total.
          </div>
        </div>

        <!-- Mode selection (Append vs Replace) -->
        <div class="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
          <span class="font-bold text-slate-800">Modo de Importación:</span>
          <label class="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="radio"
              v-model="importMode"
              value="append"
              class="text-[#004D2C] focus:ring-[#004D2C]"
            />
            <span class="text-slate-700">Añadir al final de la tabla existente</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="radio"
              v-model="importMode"
              value="replace"
              class="text-rose-600 focus:ring-rose-500"
            />
            <span class="text-rose-700">Reemplazar toda la tabla</span>
          </label>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between border-t border-slate-100 px-6 py-4 shrink-0 bg-slate-50/50 rounded-b-2xl">
        <span class="text-xs text-slate-500">
          <template v-if="parsedRecords.length > 0">
            Listo para importar <strong>{{ parsedRecords.length }} fila(s)</strong> de ACH Estadísticas.
          </template>
          <template v-else>
            Selecciona un archivo o pega datos para habilitar la importación.
          </template>
        </span>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="handleClose"
            class="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            @click="applyImport"
            :disabled="parsedRecords.length === 0 || isParsingFile"
            class="flex items-center gap-1.5 rounded-lg bg-[#004D2C] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#003B22] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <Check class="h-3.5 w-3.5" />
            <span>{{ importMode === 'replace' ? 'Reemplazar e Importar' : 'Importar Filas' }}</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Upload,
  UploadCloud,
  FileSpreadsheet,
  Download,
  ClipboardPaste,
  CheckCircle2,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-vue-next'
import type { AchStatisticRecord } from '../types/achStatistics'
import { formatCurrencyBs, formatQuantity } from '../types/achStatistics'
import { parseAchExcelBuffer } from '../utils/achExcelParser'
import { parsePastedAchText } from '../utils/achClipboardParser'
import { downloadAchTemplate } from '../utils/templateDownloader'

const props = defineProps<{
  isOpen: boolean
  defaultReferenceDate?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'import-records', payload: { records: AchStatisticRecord[]; mode: 'append' | 'replace' }): void
}>()

const activeMode = ref<'file' | 'paste'>('file')
const isDragging = ref(false)
const isParsingFile = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)

const pasteText = ref('')
const importMode = ref<'append' | 'replace'>('append')
const referenceDate = ref(props.defaultReferenceDate || new Date().toISOString().slice(0, 10))

const parsedRecords = ref<AchStatisticRecord[]>([])
const parseWarnings = ref<string[]>([])

const previewRecords = computed(() => parsedRecords.value.slice(0, 4))

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileInputChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

function handleFileDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    processFile(file)
  }
}

async function processFile(file: File) {
  uploadedFile.value = file
  isParsingFile.value = true
  parseWarnings.value = []

  try {
    const buffer = await file.arrayBuffer()
    const result = await parseAchExcelBuffer(buffer, referenceDate.value)
    parsedRecords.value = result.records
    parseWarnings.value = result.warnings || []
  } catch (err: any) {
    parseWarnings.value = [`Error al leer archivo de ACH: ${err.message || 'Formato no soportado.'}`]
    parsedRecords.value = []
  } finally {
    isParsingFile.value = false
  }
}

function clearFile() {
  uploadedFile.value = null
  parsedRecords.value = []
  parseWarnings.value = []
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function reprocessIfPresent() {
  if (activeMode.value === 'file' && uploadedFile.value) {
    processFile(uploadedFile.value)
  } else if (activeMode.value === 'paste' && pasteText.value.trim()) {
    handlePasteTextChange()
  }
}

function handlePasteTextChange() {
  if (!pasteText.value.trim()) {
    parsedRecords.value = []
    parseWarnings.value = []
    return
  }
  const { records, warning } = parsePastedAchText(pasteText.value, referenceDate.value)
  parsedRecords.value = records
  parseWarnings.value = warning ? [warning] : []
}

async function handleDownloadTemplate() {
  await downloadAchTemplate()
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function handleClose() {
  clearFile()
  pasteText.value = ''
  emit('close')
}

function applyImport() {
  if (parsedRecords.value.length === 0) return
  emit('import-records', {
    records: parsedRecords.value,
    mode: importMode.value
  })
  handleClose()
}
</script>
