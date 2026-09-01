<template>
  <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
    <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-base font-bold text-slate-900">Cargar planilla de eventos</h2>
        <p class="mt-1 text-xs text-slate-500">Selecciona un archivo Excel o CSV para generar la previsualización.</p>
      </div>
      <button
        type="button"
        class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
        @click="$emit('downloadTemplate')"
      >
        Descargar plantilla
      </button>
    </div>

    <div
      :class="[
        'cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition',
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-50/40'
      ]"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input ref="fileInputRef" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="handleFileChange" />
      <svg class="mx-auto h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
      </svg>
      <p class="mt-3 text-sm font-semibold text-slate-800">Arrastra la planilla aquí o haz clic para seleccionarla</p>
      <p class="mt-1 text-xs text-slate-500">Formatos permitidos: .xlsx, .xls y .csv</p>
    </div>

    <div v-if="fileName" class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs">
      <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
      <span class="font-semibold text-emerald-900">{{ fileName }}</span>
      <span class="text-emerald-700">{{ totalEvents }} registros procesados</span>
    </div>

    <div v-if="warnings.length" class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
      <p class="font-semibold">Advertencias de lectura</p>
      <ul class="mt-1 list-disc space-y-0.5 pl-4"><li v-for="warning in warnings" :key="warning">{{ warning }}</li></ul>
    </div>

    <div v-if="fileName" class="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-semibold text-slate-800">{{ validationMessage }}</p>
        <p class="mt-1 text-xs text-slate-500">La planilla solo se guardará cuando presiones el botón.</p>
      </div>
      <button
        type="button"
        :disabled="!canUpload || isUploading"
        class="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        @click="$emit('upload')"
      >
        {{ isUploading ? 'Guardando…' : 'Subir registros' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  fileName: string | null
  totalEvents: number
  warnings: string[]
  canUpload: boolean
  isUploading: boolean
  validationMessage: string
}>()
const emit = defineEmits<{
  (e: 'fileSelected', file: File): void
  (e: 'upload'): void
  (e: 'downloadTemplate'): void
}>()
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

function triggerFileInput() { fileInputRef.value?.click() }
function selectFile(file?: File) { if (file) emit('fileSelected', file) }
function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectFile(input.files?.[0])
  input.value = ''
}
function handleDrop(event: DragEvent) {
  isDragging.value = false
  selectFile(event.dataTransfer?.files[0])
}
</script>
