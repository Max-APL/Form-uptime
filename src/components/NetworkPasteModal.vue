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
              Importar Disponibilidad de Redes desde Excel
            </h3>
            <p class="text-xs text-slate-500">
              Sube tu archivo .xlsx o consulta la estructura de plantilla requerida para enlaces WAN, Agencias y ATMs.
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
                6 Columnas
              </span>
            </div>

            <!-- Botón de Descargar Plantilla -->
            <button
              type="button"
              @click="handleDownloadTemplate"
              class="flex items-center gap-1.5 rounded-lg bg-[#004D2C] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#003B22] transition cursor-pointer shrink-0"
              title="Descargar archivo Excel de ejemplo con encabezados y formato oficial de redes"
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
                    <span>TIPO DE ENLACE</span>
                    <span class="ml-1 text-[9px] text-purple-700 font-mono font-normal">(WAN/Agencias/ATMs)</span>
                  </th>
                  <th class="px-2.5 py-2 whitespace-nowrap">
                    <span>CIUDAD / DEPARTAMENTO</span>
                    <span class="ml-1 text-[9px] text-emerald-700 font-mono font-normal">(Ciudad/Depto)</span>
                  </th>
                  <th class="px-2.5 py-2 whitespace-nowrap">
                    <span>NOMBRE / DETALLE</span>
                    <span class="ml-1 text-[9px] text-slate-500 font-mono font-normal">(Proveedor/Agencia/ATM)</span>
                  </th>
                  <th class="px-2.5 py-2 whitespace-nowrap text-center">
                    <span>UPTIME MES (%)</span>
                    <span class="ml-1 text-[9px] text-emerald-700 font-mono font-normal">(Porcentaje)</span>
                  </th>
                  <th class="px-2.5 py-2 whitespace-nowrap text-center">
                    <span>UPTIME ANUAL (%)</span>
                    <span class="ml-1 text-[9px] text-slate-500 font-mono font-normal">(Porcentaje)</span>
                  </th>
                  <th class="px-2.5 py-2 whitespace-nowrap text-center">
                    <span>FECHA</span>
                    <span class="ml-1 text-[9px] text-slate-500 font-mono font-normal">(Opcional)</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-600 font-sans">
                <tr class="hover:bg-slate-50/50 bg-slate-50/30">
                  <td class="px-2.5 py-1.5">
                    <span class="rounded px-1.5 py-0.5 text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      WAN
                    </span>
                  </td>
                  <td class="px-2.5 py-1.5 font-bold text-slate-800">
                    <span class="rounded bg-amber-100/70 text-amber-800 px-1 py-0.2 text-[9px] mr-1 font-mono">EJEMPLO</span>
                    LA PAZ
                  </td>
                  <td class="px-2.5 py-1.5 font-semibold text-slate-900 italic">
                    (EJEMPLO) ENTEL (Enlace Principal WAN)
                  </td>
                  <td class="px-2.5 py-1.5 font-mono text-center font-bold text-emerald-700">99,9850%</td>
                  <td class="px-2.5 py-1.5 font-mono text-center text-slate-600">99,9990%</td>
                  <td class="px-2.5 py-1.5 font-mono text-center text-slate-400">2026-08-31</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-[10px] text-slate-400 mt-1 italic">
            * La plantilla descargable contiene 1 única fila de ejemplo descriptiva para indicar el formato exacto requerido.
          </p>
        </div>

        <!-- 2. Controls: Default Enlace Type, Ciudad/Depto, and Reference Date -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Tipo de Enlace por defecto:</label>
            <div v-if="isCustomEnlaceInModal" class="flex items-center gap-1">
              <input
                v-model="customEnlaceModalInput"
                @input="handleCustomModalInputChange"
                placeholder="Ej: ENLACES SATELITALES"
                class="w-full rounded-lg border border-[#004D2C] bg-white px-2.5 py-1.5 text-xs font-bold uppercase text-slate-900 focus:outline-none shadow-2xs"
                autofocus
              />
              <button
                type="button"
                @click="cancelCustomModalEnlace"
                class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                title="Volver al selector"
              >
                ✕
              </button>
            </div>
            <select
              v-else
              :value="selectedEnlace"
              @change="handleModalEnlaceSelect"
              class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#004D2C] focus:outline-none cursor-pointer shadow-2xs"
            >
              <option v-for="enl in DEFAULT_ENLACES" :key="enl" :value="enl">
                {{ enl }}
              </option>
              <option disabled>──────────</option>
              <option value="__CUSTOM_NEW__" class="text-[#004D2C] font-semibold">
                ✏️ + Personalizar nuevo enlace...
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Ciudad / Depto si falta:</label>
            <select
              v-model="selectedDepto"
              @change="handleDeptoChange"
              class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#004D2C] focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="">(Detectar de Excel / Vacío)</option>
              <option v-for="dep in DEFAULT_DEPARTAMENTOS" :key="dep" :value="dep">
                {{ dep }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Fecha de Referencia:</label>
            <input
              v-model="referenceDate"
              type="date"
              @change="handleDateChange"
              class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#004D2C] focus:outline-none shadow-2xs"
            />
          </div>
        </div>

        <!-- 3. Tabs: Subir Archivo vs Pegar Texto -->
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

        <!-- 4A. Modo Archivo: Dropzone -->
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
              <span class="text-xs font-bold text-slate-700">Analizando archivo Excel de Redes...</span>
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
                    {{ parsedRecords.length }} enlaces detectados correctamente. Haz clic para cambiar archivo.
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
                <strong class="font-bold text-[#004D2C]">Haz clic para examinar</strong> o arrastra y suelta tu archivo Excel de redes aquí
              </div>
              <div class="text-[11px] text-slate-400 font-mono">
                Formatos compatibles: .xlsx, .xls, .csv (hasta 10 MB)
              </div>
            </div>
          </div>
        </div>

        <!-- 4B. Modo Portapapeles: Textarea -->
        <div v-else class="space-y-2">
          <p class="text-xs text-slate-600">
            Copia filas de tu Excel con las columnas (ej: <em>Ciudad/Depto, Nombre, Uptime Mes %, Uptime Anual %</em>) y pégalas aquí:
          </p>
          <textarea
            v-model="pasteText"
            @input="handlePasteTextChange"
            rows="5"
            placeholder="Pega aquí el contenido copiado de Excel (Ctrl+V)..."
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
              Se detectaron {{ parsedRecords.length }} enlace(s) listos para importar.
            </span>
          </div>

          <!-- Preview Table (first 4 items) -->
          <div class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/40 text-[11px]">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th class="px-2.5 py-1.5">Tipo Enlace</th>
                  <th class="px-2.5 py-1.5">Ciudad / Depto</th>
                  <th class="px-2.5 py-1.5">Nombre / Proveedor</th>
                  <th class="px-2.5 py-1.5 text-center">Uptime Mes</th>
                  <th class="px-2.5 py-1.5 text-center">Uptime Anual</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="r in previewRecords" :key="r.id" class="bg-white">
                  <td class="px-2.5 py-1.5">
                    <span class="rounded px-1.5 py-0.2 text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {{ r.enlace }}
                    </span>
                  </td>
                  <td class="px-2.5 py-1.5 font-bold text-slate-800">{{ r.departamento || '-' }}</td>
                  <td class="px-2.5 py-1.5 text-slate-900 font-medium">{{ r.nombre }}</td>
                  <td class="px-2.5 py-1.5 font-mono text-center font-bold text-emerald-700">{{ formatUptimePercent(r.uptimeMensual) }}</td>
                  <td class="px-2.5 py-1.5 font-mono text-center text-slate-600">{{ formatUptimePercent(r.uptimeAnual) }}</td>
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
            Listo para importar <strong>{{ parsedRecords.length }} enlace(s)</strong> de red.
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
            <span>{{ importMode === 'replace' ? 'Reemplazar e Importar' : 'Importar Enlaces' }}</span>
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
import type { NetworkEventRecord } from '../types/networkUptime'
import { DEFAULT_ENLACES, DEFAULT_DEPARTAMENTOS, formatUptimePercent } from '../types/networkUptime'
import { parseNetworkExcelBuffer } from '../utils/networkExcelParser'
import { parsePastedNetworkText } from '../utils/networkClipboardParser'
import { downloadNetworkTemplate } from '../utils/templateDownloader'

const props = defineProps<{
  isOpen: boolean
  defaultReferenceDate?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'import-records', payload: { records: NetworkEventRecord[]; mode: 'append' | 'replace' }): void
}>()

const activeMode = ref<'file' | 'paste'>('file')
const isDragging = ref(false)
const isParsingFile = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)

const pasteText = ref('')
const importMode = ref<'append' | 'replace'>('append')
const selectedEnlace = ref<string>(DEFAULT_ENLACES[0])
const selectedDepto = ref<string>('')
const referenceDate = ref(props.defaultReferenceDate || new Date().toISOString().slice(0, 10))

const parsedRecords = ref<NetworkEventRecord[]>([])
const parseWarnings = ref<string[]>([])
const isCustomEnlaceInModal = ref(false)
const customEnlaceModalInput = ref('')

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
    const result = await parseNetworkExcelBuffer(
      buffer,
      selectedEnlace.value,
      selectedDepto.value,
      referenceDate.value
    )
    parsedRecords.value = result.records
    parseWarnings.value = result.warnings || []
  } catch (err: any) {
    parseWarnings.value = [`Error al leer archivo de redes: ${err.message || 'Formato no soportado.'}`]
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

function handleModalEnlaceSelect(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  if (val === '__CUSTOM_NEW__') {
    isCustomEnlaceInModal.value = true
    customEnlaceModalInput.value = ''
  } else {
    selectedEnlace.value = val
    reprocessIfPresent()
  }
}

function handleCustomModalInputChange() {
  const clean = customEnlaceModalInput.value.trim().toUpperCase()
  selectedEnlace.value = clean || DEFAULT_ENLACES[0]
  reprocessIfPresent()
}

function cancelCustomModalEnlace() {
  isCustomEnlaceInModal.value = false
  selectedEnlace.value = DEFAULT_ENLACES[0]
  reprocessIfPresent()
}

function handleDeptoChange() {
  reprocessIfPresent()
}

function handleDateChange() {
  reprocessIfPresent()
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
  const { records, warning } = parsePastedNetworkText(
    pasteText.value,
    selectedEnlace.value,
    referenceDate.value,
    selectedDepto.value
  )
  parsedRecords.value = records
  parseWarnings.value = warning ? [warning] : []
}

async function handleDownloadTemplate() {
  await downloadNetworkTemplate()
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
