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
              Importar Incidentes de Sistemas desde Excel
            </h3>
            <p class="text-xs text-slate-500">
              Sube tu archivo .xlsx o consulta la estructura de plantilla requerida.
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
                Estructura de la Plantilla Requerida
              </span>
              <span class="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-[#004D2C]">
                7 Columnas
              </span>
            </div>

            <!-- Botón de Descargar Plantilla -->
            <button
              type="button"
              @click="handleDownloadTemplate"
              class="flex items-center gap-1.5 rounded-lg bg-[#004D2C] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#003B22] transition cursor-pointer shrink-0"
              title="Descargar archivo Excel de ejemplo con encabezados y formato oficial"
            >
              <Download class="h-3.5 w-3.5" />
              <span>Descargar Plantilla Excel (.xlsx)</span>
            </button>
          </div>

          <p class="text-[11px] text-slate-600">
            Tu archivo debe incluir estos encabezados en la primera fila o usar la plantilla descargable:
          </p>

          <!-- Visual Table Mockup / Preview -->
          <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
            <table class="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr class="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th class="px-2.5 py-2 whitespace-nowrap">
                    <span>SISTEMA</span>
                    <span class="ml-1 text-[9px] text-emerald-700 font-mono font-normal">(Texto)</span>
                  </th>
                  <th class="px-2.5 py-2 whitespace-nowrap">
                    <span>FECHA</span>
                    <span class="ml-1 text-[9px] text-emerald-700 font-mono font-normal">(DD/MM/AAAA)</span>
                  </th>
                  <th class="px-2.5 py-2 whitespace-nowrap text-center">
                    <span>HORA INICIO</span>
                    <span class="ml-1 text-[9px] text-slate-500 font-mono font-normal">(HH:MM:SS)</span>
                  </th>
                  <th class="px-2.5 py-2 whitespace-nowrap text-center">
                    <span>HORA FIN</span>
                    <span class="ml-1 text-[9px] text-slate-500 font-mono font-normal">(HH:MM:SS)</span>
                  </th>
                  <th class="px-2.5 py-2 whitespace-nowrap text-center">
                    <span>DURACIÓN</span>
                    <span class="ml-1 text-[9px] text-slate-500 font-mono font-normal">(HH:MM:SS)</span>
                  </th>
                  <th class="px-2.5 py-2 whitespace-nowrap">
                    <span>INDICADOR</span>
                    <span class="ml-1 text-[9px] text-amber-700 font-mono font-normal">(Categoría)</span>
                  </th>
                  <th class="px-2.5 py-2 whitespace-nowrap">
                    <span>MOTIVO</span>
                    <span class="ml-1 text-[9px] text-slate-500 font-mono font-normal">(Causa/Detalle)</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-600 font-sans">
                <tr class="hover:bg-slate-50/50 bg-slate-50/30">
                  <td class="px-2.5 py-1.5 font-bold text-slate-900">
                    <span class="rounded bg-amber-100/70 text-amber-800 px-1 py-0.2 text-[9px] mr-1 font-mono">EJEMPLO</span>
                    BANCA MOVIL
                  </td>
                  <td class="px-2.5 py-1.5 font-mono">25/08/2026</td>
                  <td class="px-2.5 py-1.5 font-mono text-center">14:30:00</td>
                  <td class="px-2.5 py-1.5 font-mono text-center">15:15:00</td>
                  <td class="px-2.5 py-1.5 font-mono text-center font-bold text-slate-800">00:45:00</td>
                  <td class="px-2.5 py-1.5">
                    <span class="rounded px-1.5 py-0.5 text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">II-FALLAS</span>
                  </td>
                  <td class="px-2.5 py-1.5 truncate max-w-xs text-slate-500 italic">
                    (EJEMPLO) Intermitencia temporal en servidor de autenticación
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-[10px] text-slate-400 mt-1 italic">
            * La plantilla descargable contiene 1 única fila de ejemplo descriptiva para indicar el formato exacto requerido.
          </p>
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

        <!-- 3A. Modo Archivo: File Dropzone -->
        <div v-if="activeMode === 'file'" class="space-y-3">
          
          <!-- Dropzone Container -->
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
              <span class="text-xs font-bold text-slate-700">Analizando y validando archivo Excel...</span>
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

            <!-- Idle / Drop prompt -->
            <div v-else class="flex flex-col items-center justify-center gap-2 py-2">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200/80 text-slate-600">
                <UploadCloud class="h-5 w-5" />
              </div>
              <div class="text-xs text-slate-700">
                <strong class="font-bold text-[#004D2C]">Haz clic para examinar</strong> o arrastra y suelta tu archivo Excel aquí
              </div>
              <div class="text-[11px] text-slate-400 font-mono">
                Formatos compatibles: .xlsx, .xls, .csv (hasta 10 MB)
              </div>
            </div>
          </div>

        </div>

        <!-- 3B. Modo Portapapeles: Textarea -->
        <div v-else class="space-y-2">
          <p class="text-xs text-slate-600">
            Copia filas de tu Excel (Ctrl+C) y pégalas en el siguiente recuadro (Ctrl+V):
          </p>
          <textarea
            v-model="pasteText"
            @input="handlePasteTextChange"
            rows="5"
            placeholder="Pega aquí las celdas copiadas de Excel..."
            class="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#004D2C] focus:outline-none shadow-2xs"
          ></textarea>
        </div>

        <!-- Warnings / Errors alert -->
        <div v-if="parseWarnings.length > 0" class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-1">
          <div class="font-bold flex items-center gap-1.5">
            <AlertCircle class="h-4 w-4 text-amber-600 shrink-0" />
            <span>Advertencias durante el análisis del archivo:</span>
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
              Se detectaron {{ parsedRecords.length }} incidente(s) listos para importar.
            </span>
            <span v-if="detectedPeriodLabel" class="text-[11px] font-semibold text-slate-600 font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              Período: {{ detectedPeriodLabel }}
            </span>
          </div>

          <!-- Preview Table (first 4 items) -->
          <div class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/40 text-[11px]">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th class="px-2.5 py-1.5">Sistema</th>
                  <th class="px-2.5 py-1.5">Fecha</th>
                  <th class="px-2.5 py-1.5 text-center">Horario</th>
                  <th class="px-2.5 py-1.5 text-center">Duración</th>
                  <th class="px-2.5 py-1.5">Indicador</th>
                  <th class="px-2.5 py-1.5">Motivo</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="r in previewRecords" :key="r.id" class="bg-white">
                  <td class="px-2.5 py-1.5 font-bold text-slate-900">{{ r.sistema }}</td>
                  <td class="px-2.5 py-1.5 font-mono text-slate-600">{{ r.fecha }}</td>
                  <td class="px-2.5 py-1.5 font-mono text-center text-slate-600">{{ r.horaInicio }} - {{ r.horaFin }}</td>
                  <td class="px-2.5 py-1.5 font-mono text-center font-bold text-slate-800">{{ r.tiempoServicioAbajo }}</td>
                  <td class="px-2.5 py-1.5 font-semibold text-[10px] text-slate-700">{{ r.indicador }}</td>
                  <td class="px-2.5 py-1.5 truncate max-w-xs text-slate-500">{{ r.motivo }}</td>
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
            Listo para importar <strong>{{ parsedRecords.length }} incidente(s)</strong>.
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
            <span>{{ importMode === 'replace' ? 'Reemplazar e Importar' : 'Importar Incidentes' }}</span>
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
import type { EventRecordV2 } from '../types/uptime'
import { parseExcelBuffer } from '../utils/excelParser'
import { parsePastedTableText } from '../utils/clipboardParser'
import { downloadIncidentTemplate } from '../utils/templateDownloader'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'import-records', records: EventRecordV2[], mode: 'append' | 'replace'): void
}>()

const activeMode = ref<'file' | 'paste'>('file')
const isDragging = ref(false)
const isParsingFile = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)

const pasteText = ref('')
const importMode = ref<'append' | 'replace'>('append')
const parsedRecords = ref<EventRecordV2[]>([])
const parseWarnings = ref<string[]>([])
const detectedPeriodLabel = ref<string>('')

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
    const result = await parseExcelBuffer(buffer)
    parsedRecords.value = result.events
    parseWarnings.value = result.warnings || []

    if (result.detectedMonth) {
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ]
      const mName = monthNames[result.detectedMonth - 1] || `Mes ${result.detectedMonth}`
      detectedPeriodLabel.value = `${mName} ${result.detectedYear || ''}`.trim()
    } else {
      detectedPeriodLabel.value = ''
    }
  } catch (err: any) {
    parseWarnings.value = [`Error al leer el archivo: ${err.message || 'Formato no soportado.'}`]
    parsedRecords.value = []
  } finally {
    isParsingFile.value = false
  }
}

function clearFile() {
  uploadedFile.value = null
  parsedRecords.value = []
  parseWarnings.value = []
  detectedPeriodLabel.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function handlePasteTextChange() {
  if (!pasteText.value.trim()) {
    parsedRecords.value = []
    parseWarnings.value = []
    return
  }
  const result = parsePastedTableText(pasteText.value)
  parsedRecords.value = result.records
  parseWarnings.value = result.warning ? [result.warning] : []
}

async function handleDownloadTemplate() {
  await downloadIncidentTemplate()
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
  emit('import-records', parsedRecords.value, importMode.value)
  handleClose()
}
</script>
