<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
      
      <!-- Brand & Period Selector -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <Activity class="h-4 w-4" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-sm font-bold tracking-tight text-slate-900">UPTIME V2</h1>
              <span class="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                PRO
              </span>
            </div>
            <p class="text-[11px] text-slate-500">Banco Mercantil Santa Cruz — Control de Disponibilidad</p>
          </div>
        </div>

        <div class="hidden h-6 w-[1px] bg-slate-200 sm:block"></div>

        <!-- Period Selectors -->
        <div class="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <Calendar class="ml-2 h-3.5 w-3.5 text-slate-500" />
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

        <!-- Paste from clipboard button -->
        <button
          type="button"
          @click="$emit('open-paste-modal')"
          class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs"
          title="Pegar filas copiadas de Excel (Ctrl+V)"
        >
          <ClipboardPaste class="h-3.5 w-3.5 text-slate-500" />
          <span class="hidden sm:inline">Pegar Tabla</span>
        </button>

        <!-- View Consolidated Report -->
        <button
          type="button"
          @click="$emit('open-report-modal')"
          class="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100/70 transition"
          title="Ver disponibilidad y métricas consolidadas"
        >
          <BarChart3 class="h-3.5 w-3.5 text-blue-600" />
          <span class="hidden sm:inline">Informe Uptime</span>
        </button>

        <!-- Export Excel -->
        <button
          type="button"
          @click="$emit('export-excel')"
          class="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100/70 transition"
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
          class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title="Guardar eventos en la Base de Datos"
        >
          <Database class="h-3.5 w-3.5" :class="{ 'animate-spin': isSavingOracle }" />
          <span>{{ isSavingOracle ? 'Guardando...' : 'Guardar en la BD' }}</span>
        </button>

        <!-- Quick Add Row Button -->
        <button
          type="button"
          @click="$emit('add-row')"
          class="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
        >
          <Plus class="h-3.5 w-3.5" />
          <span>+ Incidente</span>
        </button>

      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Activity,
  Calendar,
  ClipboardPaste,
  BarChart3,
  FileSpreadsheet,
  Database,
  Plus
} from 'lucide-vue-next'

defineProps<{
  year: number
  month: number
  draftStatusText: string
  isSavingOracle: boolean
  totalRecords: number
}>()

defineEmits<{
  (e: 'update:year', val: number): void
  (e: 'update:month', val: number): void
  (e: 'add-row'): void
  (e: 'open-paste-modal'): void
  (e: 'open-report-modal'): void
  (e: 'export-excel'): void
  (e: 'save-oracle'): void
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
