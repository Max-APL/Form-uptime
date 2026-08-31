<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Card 1: Disponibilidad Promedio -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Disponibilidad Promedio</span>
        <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div class="mt-2 flex items-baseline justify-between">
        <span class="text-2xl font-extrabold text-slate-900 font-mono">{{ report.summary.averageUptimeFormatted }}</span>
        <span
          :class="[
            'text-xs font-semibold px-2 py-0.5 rounded border',
            report.summary.averageUptime >= 99.9
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : report.summary.averageUptime >= 99.0
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          ]"
        >
          {{ report.summary.averageUptime >= 99.9 ? 'Óptimo' : report.summary.averageUptime >= 99.0 ? 'Aceptable' : 'Alerta' }}
        </span>
      </div>
      <p class="text-xs text-slate-500 mt-1">Meta corporativa: 99.9000%</p>
    </div>

    <!-- Card 2: Total Downtime Acumulado -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Indisponibilidad</span>
        <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div class="mt-2 flex items-baseline justify-between">
        <span class="text-2xl font-extrabold text-slate-900 font-mono">{{ report.summary.totalDowntimeFormatted }}</span>
        <span class="text-xs font-medium text-slate-500">HH:MM:SS</span>
      </div>
      <p class="text-xs text-slate-500 mt-1">Promedio por sistema: {{ report.summary.averageTotalDowntimeFormatted }}</p>
    </div>

    <!-- Card 3: Total Eventos de Caída -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Eventos Registrados</span>
        <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
      <div class="mt-2 flex items-baseline justify-between">
        <span class="text-2xl font-extrabold text-slate-900 font-mono">{{ report.summary.totalEvents }}</span>
        <span class="text-xs font-medium text-slate-500">incidentes</span>
      </div>
      <p class="text-xs text-slate-500 mt-1">{{ report.summary.affectedSystemsCount }} de {{ report.systems.length }} sistemas con caídas</p>
    </div>

    <!-- Card 4: Desglose por Causa -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Causa Principal</span>
        <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          </svg>
        </div>
      </div>
      <div class="mt-2 flex items-baseline justify-between">
        <span class="text-lg font-bold text-slate-800">
          {{ mainCause }}
        </span>
      </div>
      <p class="text-xs text-slate-500 mt-1 font-mono">
        Fallas: {{ report.summary.averageFallasFormatted }} | Prog: {{ report.summary.averageProgramadaFormatted }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsolidatedReport } from '../types/uptime'

const props = defineProps<{
  report: ConsolidatedReport
}>()

const mainCause = computed(() => {
  const f = props.report.summary.averageFallas
  const p = props.report.summary.averageProgramada
  const pr = props.report.summary.averageProveedor

  if (f === 0 && p === 0 && pr === 0) return 'Sin incidentes'
  if (f >= p && f >= pr) return 'II-FALLAS'
  if (p >= f && p >= pr) return 'II-PROGRAMADA'
  return 'II-PROVEEDOR'
})
</script>
