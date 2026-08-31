<template>
  <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Cargar Archivo Excel de Incidentes
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Formato requerido: <span class="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">SISTEMA, FECHA, INICIO, FIN, TIEMPO SERVICIO ABAJO, INDICADOR, MOTIVO</span>
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          @click="$emit('downloadTemplate')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-300 transition cursor-pointer"
        >
          <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Descargar Plantilla
        </button>

        <button
          @click="$emit('loadSampleMarch')"
          class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 border border-emerald-300 transition cursor-pointer"
          title="Cargar los 23 incidentes reales del informe PDF de Marzo 2026"
        >
          Cargar Marzo (PDF)
        </button>

        <button
          @click="$emit('loadSampleJune')"
          class="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 border border-blue-200 transition cursor-pointer"
        >
          Cargar Junio
        </button>

        <button
          @click="$emit('loadSampleJuly')"
          class="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition cursor-pointer"
        >
          Cargar Ejemplo Julio
        </button>
      </div>
    </div>

    <!-- Drag and Drop Dropzone -->
    <div
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer relative group',
        isDragging
          ? 'border-blue-500 bg-blue-50/50'
          : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-white'
      ]"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".xlsx, .xls, .csv"
        class="hidden"
        @change="handleFileChange"
      />

      <div class="flex flex-col items-center justify-center space-y-2">
        <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-2xs">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <div class="space-y-1">
          <p class="text-sm font-semibold text-slate-800">
            Arrastra tu archivo Excel aquí o <span class="text-blue-600 underline">haz clic para seleccionarlo</span>
          </p>
          <p class="text-xs text-slate-500">
            Acepta archivos .xlsx, .xls o .csv (o usa <strong class="text-slate-700">eventos_marzo_2026.xlsx</strong> / <strong class="text-slate-700">ejemplo_incidentes_junio_2026.xlsx</strong>)
          </p>
        </div>
      </div>
    </div>

    <!-- Active File Bar & Oracle Sync Button -->
    <div v-if="fileName" class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-xs">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        <span class="font-medium text-slate-700">Archivo cargado:</span>
        <span class="font-bold text-slate-900 font-mono">{{ fileName }}</span>
        <span class="text-slate-500">({{ totalEvents }} registros procesados)</span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Save to Oracle DB Button -->
        <button
          @click="$emit('syncOracle')"
          :disabled="isSavingOracle || totalEvents === 0"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Inserta los eventos cargados en la tabla EVENTOS_DOWNTIME de Oracle"
        >
          <svg v-if="!isSavingOracle" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16m-8 4v6m-3-3l3 3 3-3" />
          </svg>
          <svg v-else class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isSavingOracle ? 'Guardando en Oracle...' : 'Guardar en BD Oracle' }}</span>
        </button>

        <button
          @click="$emit('clearData')"
          class="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
        >
          Limpiar
        </button>
      </div>
    </div>

    <!-- Warnings if any -->
    <div v-if="warnings.length > 0" class="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
      <div class="font-semibold flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Advertencias durante la lectura del archivo:
      </div>
      <ul class="list-disc list-inside space-y-0.5 text-amber-700 pl-1">
        <li v-for="(warn, i) in warnings" :key="i">{{ warn }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  fileName: string | null
  totalEvents: number
  warnings: string[]
  isSavingOracle?: boolean
}>()

const emit = defineEmits<{
  (e: 'fileSelected', file: File): void
  (e: 'loadSampleMarch'): void
  (e: 'loadSampleJune'): void
  (e: 'loadSampleJuly'): void
  (e: 'downloadTemplate'): void
  (e: 'syncOracle'): void
  (e: 'clearData'): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('fileSelected', target.files[0])
    target.value = ''
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    emit('fileSelected', e.dataTransfer.files[0])
  }
}
</script>
