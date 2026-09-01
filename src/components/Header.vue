<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-base">
          B
        </div>
        <div>
          <h1 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            Reporte mensual de disponibilidad
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">BMSC</span>
          </h1>
          <p class="text-xs text-slate-500">Carga de eventos y previsualización del cálculo</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{{ periodText }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getMonthNameSpanish } from '../utils/calculator'

const props = defineProps<{
  year: number
  month: number
  totalHours: number
}>()

const periodText = computed(() => {
  return `${getMonthNameSpanish(props.month)} ${props.year} • ${(props.totalHours * 60).toLocaleString('es-BO')} min`
})
</script>
