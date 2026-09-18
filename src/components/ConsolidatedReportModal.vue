<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
    <div class="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <BarChart3 class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Informe Ejecutivo de Disponibilidad Mensual</h3>
            <p class="text-xs text-slate-500">
              Período: {{ report.monthName }} {{ report.year }} ({{ report.totalMonthHours }} horas / {{ report.totalMonthMinutes.toLocaleString('es-BO') }} minutos disponibles)
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          ✕
        </button>
      </div>

      <!-- Systems Table -->
      <div class="overflow-x-auto rounded-xl border border-slate-200">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100 text-slate-700 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 font-semibold">Sistema</th>
              <th class="px-3 py-3 text-center font-semibold">Incidentes</th>
              <th class="px-3 py-3 text-center font-semibold">Declarados</th>
              <th class="px-3 py-3 text-center font-semibold">Tiempo Caído</th>
              <th class="px-3 py-3 text-center font-semibold text-rose-700">Fallas (%)</th>
              <th class="px-3 py-3 text-center font-semibold text-amber-700">Proveedor (%)</th>
              <th class="px-3 py-3 text-center font-semibold text-blue-700">Programada (%)</th>
              <th class="px-4 py-3 text-center font-semibold text-blue-700">Disponibilidad (%)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(sys, i) in report.systems"
              :key="sys.sistema"
              :class="i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'"
              class="hover:bg-slate-50 transition"
            >
              <td class="px-4 py-2.5 font-bold text-slate-900">{{ sys.sistema }}</td>
              <td class="px-3 py-2.5 text-center font-mono text-slate-700">{{ sys.events.length }}</td>
              <td class="px-3 py-2.5 text-center">
                <span v-if="sys.declaredCount > 0" class="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 border border-emerald-200">
                  {{ sys.declaredCount }}
                </span>
                <span v-else class="text-slate-400 font-mono">0</span>
              </td>
              <td class="px-3 py-2.5 text-center font-mono font-semibold" :class="sys.totalDowntimeSeconds > 0 ? 'text-rose-600' : 'text-slate-400'">
                {{ sys.totalDowntimeFormatted }}
              </td>
              <td class="px-3 py-2.5 text-center font-mono text-slate-700">{{ sys.indicators.fallas.formattedPercent }}</td>
              <td class="px-3 py-2.5 text-center font-mono text-slate-700">{{ sys.indicators.proveedor.formattedPercent }}</td>
              <td class="px-3 py-2.5 text-center font-mono text-slate-700">{{ sys.indicators.programada.formattedPercent }}</td>
              <td class="px-4 py-2.5 text-center font-mono font-bold" :class="sys.uptimePercent >= 99.9 ? 'text-emerald-600' : sys.uptimePercent >= 99.0 ? 'text-amber-600' : 'text-rose-600'">
                {{ sys.uptimePercentFormatted }}
              </td>
            </tr>

            <!-- Global Average Footer Row -->
            <tr class="bg-slate-50 font-bold border-t-2 border-blue-600 text-slate-900">
              <td class="px-4 py-3 uppercase tracking-wider text-blue-900">Promedio General</td>
              <td class="px-3 py-3 text-center font-mono">{{ report.summary.totalEvents }}</td>
              <td class="px-3 py-3 text-center font-mono text-emerald-700">{{ report.summary.totalDeclaredCount }}</td>
              <td class="px-3 py-3 text-center font-mono text-rose-600">{{ report.summary.totalDowntimeFormatted }}</td>
              <td class="px-3 py-3 text-center font-mono">{{ report.summary.averageFallasFormatted }}</td>
              <td class="px-3 py-3 text-center font-mono">{{ report.summary.averageProveedorFormatted }}</td>
              <td class="px-3 py-3 text-center font-mono">{{ report.summary.averageProgramadaFormatted }}</td>
              <td class="px-4 py-3 text-center font-mono text-sm font-extrabold text-blue-700">
                {{ report.summary.averageUptimeFormatted }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          type="button"
          @click="windowPrint"
          class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition shadow-xs"
        >
          Imprimir Reporte
        </button>
        <button
          type="button"
          @click="$emit('close')"
          class="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
        >
          Cerrar
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { BarChart3 } from 'lucide-vue-next'
import type { ConsolidatedReportV2 } from '../types/uptime'

defineProps<{
  isOpen: boolean
  report: ConsolidatedReportV2
}>()

defineEmits<{
  (e: 'close'): void
}>()

function windowPrint() {
  window.print()
}
</script>
