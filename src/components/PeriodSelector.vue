<template>
  <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
    <div class="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label class="space-y-1.5">
        <span class="text-xs font-semibold text-slate-600">Mes del reporte</span>
        <select
          :value="month"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          @change="$emit('update:month', Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="(name, index) in monthNames" :key="name" :value="index + 1">{{ name }}</option>
        </select>
      </label>

      <label class="space-y-1.5">
        <span class="text-xs font-semibold text-slate-600">Año del reporte</span>
        <input
          :value="year"
          type="number"
          min="2000"
          max="2100"
          class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          @input="$emit('update:year', Number(($event.target as HTMLInputElement).value) || new Date().getFullYear())"
        />
      </label>

      <div class="rounded-lg bg-blue-50 px-4 py-2.5 ring-1 ring-blue-100 sm:min-w-44">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Tiempo del período</p>
        <p class="mt-0.5 text-lg font-bold tabular-nums text-blue-950">{{ totalMinutes.toLocaleString('es-BO') }} min</p>
      </div>
    </div>

    <div
      v-if="periodStatus === 'loaded'"
      class="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900"
      role="status"
    >
      <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <span><strong>Este período tiene datos.</strong> Oracle contiene {{ existingRecords }} registros. Puedes revisarlos o cargar registros adicionales.</span>
    </div>

    <p v-else-if="periodStatus === 'checking'" class="mt-3 text-xs text-slate-500">Verificando si el período ya fue cargado…</p>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <p class="text-xs text-slate-500">Consulta el detalle almacenado para el mes y año seleccionados.</p>
      <button
        type="button"
        :disabled="periodStatus === 'checking'"
        class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800 transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-wait disabled:opacity-50"
        @click="$emit('viewExisting')"
      >
        Ver registros cargados<span v-if="existingRecords > 0"> ({{ existingRecords }})</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  month: number
  year: number
  totalMinutes: number
  periodStatus: 'checking' | 'empty' | 'loaded' | 'unavailable'
  existingRecords: number
}>()

defineEmits<{
  (e: 'update:month', value: number): void
  (e: 'update:year', value: number): void
  (e: 'viewExisting'): void
}>()

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
</script>
