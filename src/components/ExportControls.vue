<template>
  <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="space-y-1 text-center md:text-left">
      <h3 class="text-base font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
        <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Descargar Libro Excel Procesado
      </h3>
      <p class="text-xs text-slate-600">
        Genera el archivo Excel completo con <strong class="text-blue-900">{{ totalSheets }} hojas</strong> ({{ totalSystems }} hojas individuales por sistema + 1 hoja de Resumen General con las 2 tablas).
      </p>
    </div>

    <div class="flex items-center gap-3">
      <button
        @click="$emit('exportExcel')"
        :disabled="isExporting"
        class="flex items-center gap-2.5 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-bold text-white shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="!isExporting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <svg v-else class="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isExporting ? 'Generando Excel...' : 'Descargar Excel Completo (.xlsx)' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalSheets: number
  totalSystems: number
  isExporting: boolean
}>()

defineEmits<{
  (e: 'exportExcel'): void
}>()
</script>
