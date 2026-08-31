<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Bar Chart: Uptime por Sistema -->
    <div class="lg:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-sm bg-sky-500"></span>
            Disponibilidad (Uptime %) por Sistema
          </h3>
          <p class="text-xs text-slate-400">Comparativa porcentual del mes con respecto a la meta</p>
        </div>
        <span class="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Meta: 99.90%
        </span>
      </div>

      <div class="relative h-64 w-full">
        <canvas ref="barCanvasRef"></canvas>
      </div>
    </div>

    <!-- Doughnut Chart: Distribución por Indicador -->
    <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div class="mb-4">
        <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
          Distribución de Indisponibilidad
        </h3>
        <p class="text-xs text-slate-400">Proporción según indicador de causa</p>
      </div>

      <div class="relative h-56 w-full flex items-center justify-center">
        <canvas ref="doughnutCanvasRef"></canvas>
      </div>

      <div class="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/60 text-center text-xs">
        <div>
          <span class="block text-slate-400">Proveedor</span>
          <span class="font-bold text-amber-400 font-mono">{{ report.summary.averageProveedorFormatted }}</span>
        </div>
        <div>
          <span class="block text-slate-400">Programada</span>
          <span class="font-bold text-sky-400 font-mono">{{ report.summary.averageProgramadaFormatted }}</span>
        </div>
        <div>
          <span class="block text-slate-400">Fallas</span>
          <span class="font-bold text-rose-400 font-mono">{{ report.summary.averageFallasFormatted }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js'
import type { ConsolidatedReport } from '../types/uptime'

Chart.register(
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

const props = defineProps<{
  report: ConsolidatedReport
}>()

const barCanvasRef = ref<HTMLCanvasElement | null>(null)
const doughnutCanvasRef = ref<HTMLCanvasElement | null>(null)

let barChartInstance: Chart | null = null
let doughnutChartInstance: Chart | null = null

function renderCharts() {
  if (!barCanvasRef.value || !doughnutCanvasRef.value) return

  // 1. Render Bar Chart
  if (barChartInstance) {
    barChartInstance.destroy()
  }

  const systemLabels = props.report.systems.map(s => s.sistema)
  const uptimeData = props.report.systems.map(s => s.uptimePercent)
  const bgColors = uptimeData.map(v => {
    if (v >= 99.9) return '#10b981' // emerald-500
    if (v >= 99.0) return '#0284c7' // sky-600
    return '#f43f5e' // rose-500
  })

  // Min scale calculation to visually show differences around 98%-100%
  const minVal = Math.min(...uptimeData, 98)
  const suggestedMin = Math.max(90, Math.floor(minVal - 1))

  barChartInstance = new Chart(barCanvasRef.value, {
    type: 'bar',
    data: {
      labels: systemLabels,
      datasets: [
        {
          label: 'Uptime (%)',
          data: uptimeData,
          backgroundColor: bgColors,
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: suggestedMin,
          max: 100,
          ticks: {
            color: '#94a3b8',
            callback: (val) => `${val}%`
          },
          grid: {
            color: '#334155'
          }
        },
        x: {
          ticks: {
            color: '#94a3b8',
            maxRotation: 45,
            font: { size: 10 }
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `Disponibilidad: ${Number(ctx.raw).toFixed(4)}%`
          }
        }
      }
    }
  })

  // 2. Render Doughnut Chart
  if (doughnutChartInstance) {
    doughnutChartInstance.destroy()
  }

  const prov = props.report.summary.averageProveedor
  const prog = props.report.summary.averageProgramada
  const fal = props.report.summary.averageFallas

  const doughnutData = (prov === 0 && prog === 0 && fal === 0)
    ? [0, 0, 0, 100]
    : [prov, prog, fal]

  const doughnutLabels = (prov === 0 && prog === 0 && fal === 0)
    ? ['Proveedor', 'Programada', 'Fallas', 'Sin caídas']
    : ['II-PROVEEDOR', 'II-PROGRAMADA', 'II-FALLAS']

  const doughnutColors = (prov === 0 && prog === 0 && fal === 0)
    ? ['#f59e0b', '#0284c7', '#f43f5e', '#10b981']
    : ['#f59e0b', '#0284c7', '#f43f5e']

  doughnutChartInstance = new Chart(doughnutCanvasRef.value, {
    type: 'doughnut',
    data: {
      labels: doughnutLabels,
      datasets: [
        {
          data: doughnutData,
          backgroundColor: doughnutColors,
          borderWidth: 2,
          borderColor: '#1e293b'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#cbd5e1',
            boxWidth: 12,
            font: { size: 10 }
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${Number(ctx.raw).toFixed(4)}%`
          }
        }
      },
      cutout: '70%'
    }
  })
}

onMounted(() => {
  nextTick(renderCharts)
})

watch(() => props.report, () => {
  nextTick(renderCharts)
}, { deep: true })
</script>
