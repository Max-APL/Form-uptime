<template>
  <!-- Subtle, non-dashboard summary bar (minimalist enterprise status strip) -->
  <div class="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 shadow-2xs">
    <div class="flex flex-wrap items-center justify-between gap-y-2 gap-x-6">
      
      <!-- Left: Title / Label -->
      <div class="flex items-center gap-2">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resumen Período:</span>
      </div>

      <!-- Center: Key Metrics Strip (Subtle, inline, neutral) -->
      <div class="flex flex-wrap items-center gap-x-6 gap-y-1.5">
        
        <!-- Disponibilidad -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500">Disponibilidad:</span>
          <span class="font-mono font-bold text-slate-900">{{ summary.averageUptimeFormatted }}</span>
          <span
            class="rounded px-1.5 py-0.2 text-[10px] font-semibold"
            :class="uptimeBadgeClass"
          >
            {{ uptimeStatusLabel }}
          </span>
        </div>

        <span class="hidden sm:inline text-slate-300">|</span>

        <!-- Tiempo de Caída -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500">Tiempo abajo:</span>
          <span class="font-mono font-semibold text-slate-900">{{ summary.totalDowntimeFormatted }}</span>
          <span class="text-[11px] text-slate-400">({{ totalMinutesText }})</span>
        </div>

        <span class="hidden sm:inline text-slate-300">|</span>

        <!-- Total Incidentes -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-500">Incidentes:</span>
          <span class="font-mono font-semibold text-slate-900">{{ summary.totalEvents }}</span>
          <span class="text-[11px] text-slate-500">
            ({{ summary.totalDeclaredCount }} declarados, {{ summary.totalUndeclaredCount }} no declarados)
          </span>
        </div>

        <span class="hidden md:inline text-slate-300">|</span>

        <!-- Indicadores -->
        <div class="hidden md:flex items-center gap-3 text-[11px] text-slate-500">
          <span>Fallas: <strong class="font-mono text-slate-700">{{ summary.averageFallasFormatted }}</strong></span>
          <span>Proveedor: <strong class="font-mono text-slate-700">{{ summary.averageProveedorFormatted }}</strong></span>
          <span>Programada: <strong class="font-mono text-slate-700">{{ summary.averageProgramadaFormatted }}</strong></span>
        </div>

      </div>

      <!-- Right: Systems count info -->
      <div class="text-[11px] text-slate-400">
        {{ affectedCountText }}
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GlobalAverageSummaryV2 } from '../types/uptime'

const props = defineProps<{
  summary: GlobalAverageSummaryV2
}>()

const uptimeStatusLabel = computed(() => {
  if (props.summary.averageUptime >= 99.9) return 'Óptimo'
  if (props.summary.averageUptime >= 99.0) return 'Aceptable'
  return 'Crítico'
})

const uptimeBadgeClass = computed(() => {
  if (props.summary.averageUptime >= 99.9) {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  }
  if (props.summary.averageUptime >= 99.0) {
    return 'bg-amber-50 text-amber-700 border border-amber-200'
  }
  return 'bg-rose-50 text-rose-700 border border-rose-200'
})

const affectedCountText = computed(() => {
  if (props.summary.affectedSystemsCount === 0) return '0 sistemas con caída'
  return `${props.summary.affectedSystemsCount} sistema(s) afectados`
})

const totalMinutesText = computed(() => {
  const min = Math.round(props.summary.totalDowntimeSeconds / 60)
  return `${min.toLocaleString('es-BO')} min`
})
</script>
