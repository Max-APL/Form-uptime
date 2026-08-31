<template>
  <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
    <!-- Header of Sheet -->
    <div class="space-y-3">
      <h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide underline underline-offset-4 decoration-2">
        {{ systemMetrics.sistema }}
      </h2>

      <!-- Subheader Banner -->
      <div class="bg-[#D9D9D9] border border-slate-400 py-1.5 text-center text-xs font-bold text-black uppercase tracking-wider">
        {{ systemMetrics.sistema }}
      </div>
    </div>

    <!-- Main Events Table -->
    <div class="overflow-x-auto border border-slate-400">
      <table class="w-full text-xs text-left border-collapse">
        <thead class="bg-[#7F7F7F] text-white font-bold text-center">
          <tr class="divide-x divide-slate-400">
            <th class="py-2.5 px-4">FECHA</th>
            <th class="py-2.5 px-3">HORA DE INICIO CAIDA</th>
            <th class="py-2.5 px-3">HORA DE FIN CAIDA</th>
            <th class="py-2.5 px-3">TIEMPO SERVICIO ABAJO</th>
            <th class="py-2.5 px-3">INDICADOR</th>
            <th class="py-2.5 px-4 text-left">MOTIVO</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-300 bg-white text-slate-900">
          <tr
            v-for="(ev, idx) in systemMetrics.events"
            :key="idx"
            class="divide-x divide-slate-300 hover:bg-slate-50 transition"
          >
            <td class="py-2 px-4 whitespace-nowrap">{{ ev.fecha }}</td>
            <td class="py-2 px-3 text-center font-mono whitespace-nowrap">{{ ev.horaInicio }}</td>
            <td class="py-2 px-3 text-center font-mono whitespace-nowrap">{{ ev.horaFin }}</td>
            <td class="py-2 px-3 text-center font-mono font-bold whitespace-nowrap">{{ ev.tiempoServicioAbajo }}</td>
            <td class="py-2 px-3 text-center whitespace-nowrap">
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 border border-slate-300 text-slate-800">
                {{ ev.indicador }}
              </span>
            </td>
            <td class="py-2 px-4 text-slate-700">{{ ev.motivo }}</td>
          </tr>

          <!-- If system had 0 events -->
          <tr v-if="systemMetrics.events.length === 0" class="divide-x divide-slate-300 h-9">
            <td class="py-2 px-4 text-slate-400 italic text-center" colspan="6">
              (Sin registros de caídas en el período)
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary Metrics Table below Events -->
    <div class="pt-1">
      <div class="inline-block border border-slate-400 shadow-2xs">
        <table class="text-xs border-collapse">
          <tbody>
            <!-- Total Downtime Row -->
            <tr class="border-b border-slate-300">
              <td class="bg-[#D9D9D9] px-4 py-2 font-bold text-slate-900 text-center border-r border-slate-300">
                Total Downtime en horas (HH:MI:SS)
              </td>
              <td class="bg-white px-4 py-2 font-mono font-bold text-slate-900 text-center min-w-[120px]">
                {{ systemMetrics.totalDowntimeFormatted }}
              </td>
            </tr>

            <!-- % DOWNTIME -->
            <tr class="border-b border-slate-300">
              <td class="bg-[#F2F2F2] px-4 py-1.5 font-bold text-slate-800 text-right border-r border-slate-300">
                % DOWNTIME
              </td>
              <td class="bg-white px-4 py-1.5 font-mono font-bold text-slate-900 text-center">
                {{ systemMetrics.downtimePercentFormatted }}
              </td>
            </tr>

            <!-- % UPTIME -->
            <tr class="border-b border-slate-300">
              <td class="bg-[#F2F2F2] px-4 py-1.5 font-bold text-slate-800 text-right border-r border-slate-300">
                % UPTIME
              </td>
              <td class="bg-white px-4 py-1.5 font-mono font-bold text-slate-900 text-center">
                {{ systemMetrics.uptimePercentFormatted }}
              </td>
            </tr>

            <!-- % TOTAL -->
            <tr>
              <td class="bg-[#F2F2F2] px-4 py-1.5 font-bold text-slate-800 text-right border-r border-slate-300">
                % TOTAL
              </td>
              <td class="bg-white px-4 py-1.5 font-mono font-bold text-slate-900 text-center">
                {{ systemMetrics.totalPercentFormatted }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SystemMonthlyMetrics } from '../types/uptime'

defineProps<{
  systemMetrics: SystemMonthlyMetrics
}>()
</script>
