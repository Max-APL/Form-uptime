<template>
  <div class="mb-4 font-sans">
    <!-- Title above table (bold and underlined, exactly as in original BMSC PDF) -->
    <div class="font-bold text-xs underline mb-1 uppercase tracking-wide text-slate-900">
      {{ title || metrics.sistema }}
    </div>

    <!-- Table with crisp black borders -->
    <table class="w-full text-left text-[8.5px] border-collapse font-sans border border-black">
      <thead>
        <!-- Row 1: Merged System Name -->
        <tr>
          <th
            colspan="6"
            class="border border-black bg-[#E2E6E3] py-0.5 text-center font-bold text-[9.5px] uppercase text-black tracking-wider"
          >
            {{ tableHeaderTitle }}
          </th>
        </tr>

        <!-- Row 2: Columns Header -->
        <tr class="bg-[#E2E6E3] text-black font-bold">
          <th class="border border-black px-2 py-1 text-center uppercase w-[22%]">
            FECHA
          </th>
          <th class="border border-black px-1 py-1 text-center uppercase w-[13%] leading-tight">
            HORA DE INICIO<br />DE LA CAIDA
          </th>
          <th class="border border-black px-1 py-1 text-center uppercase w-[13%] leading-tight">
            HORA DE FIN<br />DE LA CAIDA
          </th>
          <th class="border border-black px-1 py-1 text-center uppercase w-[13%] leading-tight">
            TIEMPO DEL<br />SERVICIO ABAJO
          </th>
          <th class="border border-black px-1 py-1 text-center uppercase w-[14%]">
            INDICADORES
          </th>
          <th class="border border-black px-2 py-1 text-center uppercase w-[25%]">
            MOTIVO
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- 1. Real Events Rows -->
        <template v-if="metrics.events.length > 0">
          <tr
            v-for="e in metrics.events"
            :key="e.id"
            class="text-slate-900"
          >
            <td class="border border-black px-2 py-1 text-left">
              {{ formatDateLongSpanish(e.fecha) }}
            </td>
            <td class="border border-black px-1 py-1 text-center font-sans">
              {{ formatTimeTo12Hour(e.horaInicio) }}
            </td>
            <td class="border border-black px-1 py-1 text-center font-sans">
              {{ formatTimeTo12Hour(e.horaFin) }}
            </td>
            <td class="border border-black px-1 py-1 text-center font-sans">
              {{ e.tiempoServicioAbajo || '00:00:00' }}
            </td>
            <td class="border border-black px-1 py-1 text-center font-sans">
              {{ e.indicador }}
            </td>
            <td class="border border-black px-2 py-1 text-center">
              {{ e.motivo }}
            </td>
          </tr>
        </template>

        <!-- 2. Empty Row when 0 incidents (matches FISA, SWIFT in original PDF) -->
        <template v-else>
          <tr class="h-5">
            <td class="border border-black px-2 py-1"></td>
            <td class="border border-black px-1 py-1"></td>
            <td class="border border-black px-1 py-1"></td>
            <td class="border border-black px-1 py-1"></td>
            <td class="border border-black px-1 py-1"></td>
            <td class="border border-black px-2 py-1"></td>
          </tr>
        </template>

        <!-- 3. Totals Block (Exactly aligned like Original PDF) -->
        <!-- Row 1 of totals: Total Downtime -->
        <tr class="font-bold">
          <td colspan="3" class="border border-black px-2 py-0.5 text-right uppercase text-[8.5px]">
            Total Downtime en horas
          </td>
          <td class="border border-black px-1 py-0.5 text-center font-sans text-[8.5px]">
            {{ metrics.totalDowntimeFormatted }}
          </td>
          <td class="border border-black"></td>
          <td class="border border-black"></td>
        </tr>

        <!-- Row 2 of totals: % DOWNTIME -->
        <tr class="text-[8px]">
          <td colspan="3" rowspan="3" class="border border-black bg-white"></td>
          <td class="border border-black px-1.5 py-0.5 text-left font-bold text-black uppercase">
            % DOWNTIME
          </td>
          <td class="border border-black px-1 py-0.5 text-center font-bold font-sans text-black">
            {{ metrics.downtimePercentFormatted }}
          </td>
          <td rowspan="3" class="border border-black bg-white"></td>
        </tr>

        <!-- Row 3 of totals: % UPTIME -->
        <tr class="text-[8px]">
          <td class="border border-black px-1.5 py-0.5 text-left font-bold text-black uppercase">
            % UPTIME
          </td>
          <td class="border border-black px-1 py-0.5 text-center font-bold font-sans text-black">
            {{ metrics.uptimePercentFormatted }}
          </td>
        </tr>

        <!-- Row 4 of totals: % TOTAL -->
        <tr class="text-[8px]">
          <td class="border border-black px-1.5 py-0.5 text-left font-bold text-black uppercase">
            % TOTAL
          </td>
          <td class="border border-black px-1 py-0.5 text-center font-bold font-sans text-black">
            {{ metrics.totalPercentFormatted }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SystemMonthlyMetricsV2 } from '../types/uptime'
import { formatDateLongSpanish, formatTimeTo12Hour } from '../utils/reportFormatters'

const props = defineProps<{
  metrics: SystemMonthlyMetricsV2
  title?: string
  innerHeaderName?: string
}>()

const tableHeaderTitle = computed(() => {
  if (props.innerHeaderName) return props.innerHeaderName
  if (props.title === 'T24') return 'CORE T24'
  return props.title || props.metrics.sistema
})
</script>
