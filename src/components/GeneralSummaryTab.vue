<template>
  <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-10">
    <!-- ========================================== -->
    <!-- TABLE 1: Resumen Final de UPTIME de Sistemas Críticos del BMSC -->
    <!-- ========================================== -->
    <div class="space-y-3">
      <div class="border-b border-slate-200 pb-2">
        <h2 class="text-base font-bold text-slate-900 uppercase tracking-wide underline underline-offset-4 decoration-2">
          Resumen Final de UPTIME de Sistemas Críticos del BMSC
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">Tabla consolidada de disponibilidad mensual y porcentaje de fallas por categoría</p>
      </div>

      <div class="overflow-x-auto border border-black shadow-2xs">
        <table class="w-full text-xs text-left border-collapse">
          <thead class="bg-black text-white font-bold text-center">
            <tr class="divide-x divide-slate-700">
              <th class="py-2.5 px-4 text-left">SISTEMA</th>
              <th class="py-2.5 px-3">{{ report.monthName }}</th>
              <th class="py-2.5 px-3">II-PROVEEDOR</th>
              <th class="py-2.5 px-3">II-PROGRAMADA</th>
              <th class="py-2.5 px-3">II-FALLAS</th>
              <th class="py-2.5 px-3">TOTAL</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-300 bg-white text-slate-900 font-mono">
            <tr
              v-for="sys in report.systems"
              :key="sys.sistema"
              class="divide-x divide-slate-300 hover:bg-slate-50 transition"
            >
              <td class="py-2 px-4 font-sans font-bold text-slate-900">{{ sys.sistema }}</td>
              <td class="py-2 px-3 text-center font-bold text-slate-900">{{ sys.uptimePercentFormatted }}</td>
              <td class="py-2 px-3 text-center text-slate-700">{{ sys.indicators.proveedor.formattedPercent }}</td>
              <td class="py-2 px-3 text-center text-slate-700">{{ sys.indicators.programada.formattedPercent }}</td>
              <td class="py-2 px-3 text-center text-slate-700">{{ sys.indicators.fallas.formattedPercent }}</td>
              <td class="py-2 px-3 text-center text-slate-900">{{ sys.downtimePercentFormatted }}</td>
            </tr>
          </tbody>
          <!-- PROMEDIO FINAL FOOTER -->
          <tfoot class="bg-black text-white font-bold font-mono border-t-2 border-black">
            <tr class="divide-x divide-slate-700">
              <td class="py-2.5 px-4 font-sans text-white uppercase">PROMEDIO FINAL</td>
              <td class="py-2.5 px-3 text-center text-white">{{ report.summary.averageUptimeFormatted }}</td>
              <td class="py-2.5 px-3 text-center text-white">{{ report.summary.averageProveedorFormatted }}</td>
              <td class="py-2.5 px-3 text-center text-white">{{ report.summary.averageProgramadaFormatted }}</td>
              <td class="py-2.5 px-3 text-center text-white">{{ report.summary.averageFallasFormatted }}</td>
              <td class="py-2.5 px-3 text-center text-white">{{ report.summary.averageTotalDowntimeFormatted }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TABLE 2: REPORTE UPTIME DE TECNOLOGIA -->
    <!-- ========================================== -->
    <div class="space-y-3 pt-2">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <h2 class="text-base font-bold text-slate-900 uppercase tracking-wide underline underline-offset-4 decoration-2">
          REPORTE UPTIME DE TECNOLOGIA
        </h2>
        <div class="flex items-center gap-2 text-xs font-bold">
          <span class="text-slate-500 uppercase">MES:</span>
          <span class="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 uppercase tracking-wider font-extrabold">
            {{ report.monthName }}
          </span>
        </div>
      </div>

      <div class="overflow-x-auto border border-black shadow-2xs">
        <table class="w-full text-xs text-left border-collapse">
          <thead class="bg-[#D9EAD3] text-black font-bold text-center border-b border-black">
            <!-- Header Row 1 -->
            <tr class="divide-x divide-black">
              <th rowspan="2" class="py-3 px-4 text-left align-middle min-w-[140px]">SISTEMA</th>
              <th rowspan="2" class="py-2 px-3 align-middle min-w-[120px]">
                TOTAL NO DISPONIBILIDAD<br/><span class="text-[10px] text-slate-700 font-normal">(Tiempo)</span>
              </th>
              <th rowspan="2" class="py-2 px-3 align-middle min-w-[110px]">
                DISPONIBILIDAD<br/><span class="text-[10px] text-slate-700 font-normal">(%)</span>
              </th>
              <th colspan="6" class="py-2 px-3 text-center uppercase tracking-wider">
                NO DISPONIBILIDAD
              </th>
            </tr>
            <!-- Header Row 2 -->
            <tr class="divide-x divide-black text-[10px] bg-[#D9EAD3]">
              <th class="py-1.5 px-2">IIBHIBM PROVEEDOR<br/><span class="font-normal">(tiempo)</span></th>
              <th class="py-1.5 px-2">IIBHIBM PROVEEDOR<br/><span class="font-normal">(%)</span></th>
              <th class="py-1.5 px-2">IIBHIBM PROGRAMADA<br/><span class="font-normal">(tiempo)</span></th>
              <th class="py-1.5 px-2">IIBHIBM PROGRAMADA<br/><span class="font-normal">(%)</span></th>
              <th class="py-1.5 px-2">IIBHIBM FALLAS<br/><span class="font-normal">(tiempo)</span></th>
              <th class="py-1.5 px-2">IIBHIBM FALLAS<br/><span class="font-normal">(%)</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-300 bg-white text-slate-900 font-mono">
            <tr
              v-for="sys in report.systems"
              :key="sys.sistema"
              class="divide-x divide-slate-300 hover:bg-slate-50 transition"
            >
              <td class="py-2 px-4 font-sans font-bold text-slate-900 whitespace-nowrap">{{ sys.sistema }}</td>
              <td class="py-2 px-3 text-center font-bold text-slate-900">
                {{ formatTotalDuration(sys.totalDowntimeMinutes) }}
              </td>
              <td class="py-2 px-3 text-center font-bold text-slate-900">{{ sys.uptimePercentFormatted }}</td>
              <td class="py-2 px-2 text-center text-slate-700">{{ sys.indicators.proveedor.formattedTime }}</td>
              <td class="py-2 px-2 text-center text-slate-700">{{ sys.indicators.proveedor.formattedPercent }}</td>
              <td class="py-2 px-2 text-center text-slate-700">{{ sys.indicators.programada.formattedTime }}</td>
              <td class="py-2 px-2 text-center text-slate-700">{{ sys.indicators.programada.formattedPercent }}</td>
              <td class="py-2 px-2 text-center text-slate-700">{{ sys.indicators.fallas.formattedTime }}</td>
              <td class="py-2 px-2 text-center text-slate-900">{{ sys.indicators.fallas.formattedPercent }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConsolidatedReport } from '../types/uptime'

defineProps<{
  report: ConsolidatedReport
}>()

function formatTotalDuration(minutes: number): string {
  if (minutes <= 0) return '00:00'
  const h = Math.floor(minutes / 60)
  const m = Math.floor(minutes % 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}
</script>
