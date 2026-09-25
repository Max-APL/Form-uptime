<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
    <!-- Corporate Top Brand Stripe -->
    <div class="h-1 w-full bg-gradient-to-r from-[#004D2C] via-[#D39F28] to-[#004D2C]"></div>

    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
      
      <!-- Brand & Period Selector -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <!-- BMSC Logo -->
          <img
            src="/bmsc-logo.png"
            alt="Banco Mercantil Santa Cruz"
            class="h-9 object-contain rounded-sm shadow-2xs"
          />
          <div class="hidden sm:block h-7 w-[1px] bg-slate-200"></div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xs sm:text-sm font-black tracking-tight text-slate-900 uppercase">
                Control de Disponibilidad
              </h1>
              <span class="rounded bg-[#004D2C]/10 px-1.5 py-0.2 text-[10px] font-bold text-[#004D2C] border border-[#004D2C]/20">
                V2
              </span>
            </div>
            <p class="text-[10px] text-slate-500 font-medium">BMSC — Gestión Operativa de Uptime</p>
          </div>
        </div>

        <div class="hidden h-6 w-[1px] bg-slate-200 sm:block"></div>

        <!-- Period Selectors -->
        <div class="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <Calendar class="ml-2 h-3.5 w-3.5 text-[#004D2C]" />
          <select
            :value="month"
            @change="$emit('update:month', Number(($event.target as HTMLSelectElement).value))"
            class="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
          >
            <option v-for="(name, idx) in monthsList" :key="idx" :value="idx + 1" class="text-slate-800">
              {{ name }}
            </option>
          </select>
          <select
            :value="year"
            @change="$emit('update:year', Number(($event.target as HTMLSelectElement).value))"
            class="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
          >
            <option v-for="y in availableYears" :key="y" :value="y" class="text-slate-800">
              {{ y }}
            </option>
          </select>
        </div>
      </div>

      <!-- Action buttons & Auto-save status -->
      <div class="flex items-center flex-wrap gap-2">
        
        <!-- Draft status badge -->
        <div class="flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span class="hidden md:inline">{{ draftStatusText }}</span>
          <span class="md:hidden">Auto-guardado</span>
        </div>

        <!-- ================= SISTEMAS ACTIONS ================= -->
        <template v-if="activeTab === 'sistemas'">
          <!-- Import from Excel button -->
          <button
            type="button"
            @click="$emit('open-paste-modal')"
            class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            title="Importar incidentes desde archivo Excel (.xlsx) o portapapeles"
          >
            <Upload class="h-3.5 w-3.5 text-[#004D2C]" />
            <span class="hidden sm:inline">Importar</span>
          </button>

          <!-- View Consolidated Report -->
          <button
            type="button"
            @click="$emit('open-report-modal')"
            class="flex items-center gap-1.5 rounded-lg border border-[#004D2C]/30 bg-[#004D2C]/5 px-3 py-1.5 text-xs font-semibold text-[#004D2C] hover:bg-[#004D2C]/10 transition shadow-2xs cursor-pointer"
            title="Ver disponibilidad y métricas consolidadas"
          >
            <BarChart3 class="h-3.5 w-3.5 text-[#004D2C]" />
            <span class="hidden sm:inline">Métricas</span>
          </button>

          <!-- Official BMSC Word Report -->
          <button
            type="button"
            @click="$emit('open-official-report')"
            class="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/90 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100 transition shadow-2xs cursor-pointer"
            title="Generar y descargar Informe Oficial BMSC en formato Word (.docx)"
          >
            <FileText class="h-3.5 w-3.5 text-blue-700" />
            <span class="hidden sm:inline">Informe Word</span>
          </button>

          <!-- Export Excel -->
          <button
            type="button"
            @click="$emit('export-excel')"
            class="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/70 transition shadow-2xs cursor-pointer"
            title="Descargar reporte Excel (.xlsx)"
          >
            <FileSpreadsheet class="h-3.5 w-3.5 text-emerald-600" />
            <span class="hidden sm:inline">Exportar Excel</span>
          </button>

          <!-- Save to DB -->
          <button
            type="button"
            @click="$emit('save-oracle')"
            :disabled="isSavingOracle || totalRecords === 0"
            class="flex items-center gap-1.5 rounded-lg bg-[#004D2C] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#003B22] border border-[#003B22] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Guardar incidentes en Oracle DB (EVENTOS_DOWNTIME)"
          >
            <Database class="h-3.5 w-3.5" :class="{ 'animate-spin': isSavingOracle }" />
            <span>{{ isSavingOracle ? 'Guardando...' : 'Guardar BD' }}</span>
          </button>
        </template>

        <!-- ================= REDES ACTIONS ================= -->
        <template v-else>
          <!-- Import from Excel button Redes -->
          <button
            type="button"
            @click="$emit('open-network-paste-modal')"
            class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            title="Importar enlaces de red desde archivo Excel (.xlsx) o portapapeles"
          >
            <Upload class="h-3.5 w-3.5 text-[#004D2C]" />
            <span class="hidden sm:inline">Importar</span>
          </button>

          <!-- Export Excel -->
          <button
            type="button"
            @click="$emit('export-network-excel')"
            class="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/70 transition shadow-2xs cursor-pointer"
            title="Descargar reporte de enlaces en Excel (.xlsx)"
          >
            <FileSpreadsheet class="h-3.5 w-3.5 text-emerald-600" />
            <span class="hidden sm:inline">Exportar Excel</span>
          </button>

          <!-- Save to DB Redes -->
          <button
            type="button"
            @click="$emit('save-network-oracle')"
            :disabled="isSavingOracle || totalNetworkRecords === 0"
            class="flex items-center gap-1.5 rounded-lg bg-[#004D2C] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#003B22] border border-[#003B22] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Guardar enlaces en Oracle DB (EVENTOS_REDES)"
          >
            <Database class="h-3.5 w-3.5" :class="{ 'animate-spin': isSavingOracle }" />
            <span>{{ isSavingOracle ? 'Guardando...' : 'Guardar BD' }}</span>
          </button>
        </template>

      </div>
    </div>

    <!-- Navigation Tabs Bar -->
    <div class="border-t border-slate-200/80 bg-slate-50/90 px-4 py-1.5 sm:px-6 lg:px-8">
      <div class="mx-auto flex max-w-7xl items-center justify-between">
        <div class="flex items-center gap-1.5">
          <!-- Tab 1: Sistemas Críticos -->
          <button
            type="button"
            @click="$emit('update:activeTab', 'sistemas')"
            :class="[
              activeTab === 'sistemas'
                ? 'bg-white text-[#004D2C] shadow-2xs border-[#004D2C]/40 font-bold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100 font-medium'
            ]"
            class="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition cursor-pointer"
          >
            <Server class="h-3.5 w-3.5" :class="activeTab === 'sistemas' ? 'text-[#004D2C]' : 'text-slate-500'" />
            <span>Sistemas Críticos (Core & Canales)</span>
            <span
              :class="activeTab === 'sistemas' ? 'bg-[#004D2C]/10 text-[#004D2C]' : 'bg-slate-200 text-slate-600'"
              class="rounded-full px-2 py-0.2 text-[10px] font-bold"
            >
              {{ totalRecords }}
            </span>
          </button>

          <!-- Tab 2: Enlaces de Red -->
          <button
            type="button"
            @click="$emit('update:activeTab', 'redes')"
            :class="[
              activeTab === 'redes'
                ? 'bg-white text-[#004D2C] shadow-2xs border-[#004D2C]/40 font-bold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100 font-medium'
            ]"
            class="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition cursor-pointer"
          >
            <Network class="h-3.5 w-3.5" :class="activeTab === 'redes' ? 'text-[#004D2C]' : 'text-slate-500'" />
            <span>Enlaces de Red (Telecom, Agencias & ATMs)</span>
            <span
              :class="activeTab === 'redes' ? 'bg-[#004D2C]/10 text-[#004D2C]' : 'bg-slate-200 text-slate-600'"
              class="rounded-full px-2 py-0.2 text-[10px] font-bold"
            >
              {{ totalNetworkRecords }}
            </span>
          </button>
        </div>

        <!-- Target Oracle Table Indicator -->
        <div class="hidden md:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span>Destino en Oracle:</span>
          <span class="rounded bg-slate-200/90 px-2 py-0.5 font-bold text-slate-800">
            {{ activeTab === 'sistemas' ? 'EVENTOS_DOWNTIME' : 'EVENTOS_REDES' }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Calendar,
  Upload,
  BarChart3,
  FileText,
  FileSpreadsheet,
  Database,
  Server,
  Network
} from 'lucide-vue-next'

withDefaults(
  defineProps<{
    year: number
    month: number
    draftStatusText: string
    isSavingOracle: boolean
    totalRecords: number
    activeTab?: 'sistemas' | 'redes'
    totalNetworkRecords?: number
  }>(),
  {
    activeTab: 'sistemas',
    totalNetworkRecords: 0
  }
)

defineEmits<{
  (e: 'update:year', val: number): void
  (e: 'update:month', val: number): void
  (e: 'update:activeTab', val: 'sistemas' | 'redes'): void
  (e: 'open-paste-modal'): void
  (e: 'open-network-paste-modal'): void
  (e: 'open-report-modal'): void
  (e: 'open-official-report'): void
  (e: 'export-excel'): void
  (e: 'export-network-excel'): void
  (e: 'save-oracle'): void
  (e: 'save-network-oracle'): void
}>()

const monthsList = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const currentYear = new Date().getFullYear()
const availableYears = computed(() => [
  currentYear - 2,
  currentYear - 1,
  currentYear,
  currentYear + 1
])
</script>
