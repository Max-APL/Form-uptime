<template>
  <header class="sticky top-0 z-30 shadow-xs">
    
    <!-- ======================================================== -->
    <!-- NIVEL 1: Barra Institucional Verde Corporativo BMSC       -->
    <!-- Logo, Título, Período, Estado y Destino Oracle           -->
    <!-- ======================================================== -->
    <div class="border-b border-[#003B22] bg-[#004D2C] text-white">
      <!-- Gold Top Stripe Accent -->
      <div class="h-0.5 w-full bg-gradient-to-r from-[#D39F28] via-[#F3C258] to-[#D39F28]"></div>

      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        
        <!-- Left: Logo, Brand & Period Selector -->
        <div class="flex items-center flex-wrap gap-3">
          <div class="flex items-center gap-2.5">
            <!-- BMSC Logo directly on corporate green background (no white border) -->
            <img
              src="/bmsc-logo.png"
              alt="Banco Mercantil Santa Cruz"
              class="h-8 w-auto object-contain rounded"
            />

            <div class="hidden sm:block h-6 w-[1px] bg-white/20"></div>

            <div>
              <div class="flex items-center gap-1.5">
                <h1 class="text-xs sm:text-sm font-black tracking-tight text-white uppercase">
                  Control de Disponibilidad
                </h1>
                <span class="rounded bg-[#D39F28] text-slate-950 px-1.5 py-0.2 text-[10px] font-black shadow-2xs">
                  V2
                </span>
              </div>
              <p class="text-[10px] text-emerald-100/75 font-medium leading-none">
                BMSC — Gestión Operativa de Uptime
              </p>
            </div>
          </div>

          <div class="hidden md:block h-6 w-[1px] bg-white/20"></div>

          <!-- Period Selectors (Styled for Dark Header) -->
          <div class="flex items-center gap-1 rounded-lg border border-white/20 bg-black/25 px-2 py-1 shadow-inner text-xs">
            <Calendar class="h-3.5 w-3.5 text-[#D39F28] shrink-0" />
            <select
              :value="month"
              @change="$emit('update:month', Number(($event.target as HTMLSelectElement).value))"
              class="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1 [&>option]:text-slate-900 [&>option]:bg-white"
            >
              <option v-for="(name, idx) in monthsList" :key="idx" :value="idx + 1">
                {{ name }}
              </option>
            </select>
            <span class="text-white/40">/</span>
            <select
              :value="year"
              @change="$emit('update:year', Number(($event.target as HTMLSelectElement).value))"
              class="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1 [&>option]:text-slate-900 [&>option]:bg-white"
            >
              <option v-for="y in availableYears" :key="y" :value="y">
                {{ y }}
              </option>
            </select>
          </div>
        </div>

        <!-- Right: Auto-save status & Target Oracle badge -->
        <div class="flex items-center gap-3">
          <!-- Draft status badge -->
          <div class="flex items-center gap-1.5 rounded-lg bg-black/25 border border-white/15 px-2.5 py-1 text-xs text-emerald-200 font-mono shadow-2xs">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
            </span>
            <span class="hidden sm:inline">{{ draftStatusText }}</span>
            <span class="sm:hidden">Auto-guardado</span>
          </div>

          <!-- Target Oracle Table Indicator -->
          <div class="hidden lg:flex items-center gap-1.5 text-xs text-emerald-100/80 font-mono">
            <span>Oracle:</span>
            <span class="rounded bg-black/35 border border-white/20 px-2 py-0.5 font-bold text-white text-[11px] tracking-wide shadow-inner">
              {{ activeTab === 'sistemas' ? 'EVENTOS_DOWNTIME' : activeTab === 'redes' ? 'EVENTOS_REDES' : 'ACH_ESTADISTICAS' }}
            </span>
          </div>
        </div>

      </div>
    </div>

    <!-- ======================================================== -->
    <!-- NIVEL 2: Barra de Pestañas y Acciones Contextuales        -->
    <!-- Pestañas marcadas en pista segmentada y acciones agrupadas-->
    <!-- ======================================================== -->
    <div class="border-b border-slate-200 bg-slate-100/95 backdrop-blur-md">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5 px-4 py-1.5 sm:px-6 lg:px-8">
        
        <!-- Left: Navigation Tabs (Segmented pill track with high-contrast active tab) -->
        <nav class="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/90 border border-slate-300/80 shadow-inner">
          <!-- Tab 1: Sistemas Críticos -->
          <button
            type="button"
            @click="$emit('update:activeTab', 'sistemas')"
            :class="[
              activeTab === 'sistemas'
                ? 'bg-white text-[#004D2C] border-2 border-[#004D2C] shadow-md ring-2 ring-[#004D2C]/15 font-black'
                : 'bg-slate-100/70 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-300/70 hover:border-slate-400 font-bold shadow-2xs'
            ]"
            class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition cursor-pointer"
            title="Sistemas Críticos (Core & Canales)"
          >
            <Server class="h-3.5 w-3.5" :class="activeTab === 'sistemas' ? 'text-[#004D2C]' : 'text-slate-500'" />
            <span class="tracking-tight">Sistemas Críticos</span>
            <span class="hidden xl:inline text-[10px] font-medium opacity-75">(Core & Canales)</span>
            <span
              :class="activeTab === 'sistemas' ? 'bg-[#004D2C] text-white shadow-xs' : 'bg-slate-300 text-slate-800 border border-slate-400/40'"
              class="rounded-full px-2 py-0.2 text-[10px] font-black"
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
                ? 'bg-white text-[#004D2C] border-2 border-[#004D2C] shadow-md ring-2 ring-[#004D2C]/15 font-black'
                : 'bg-slate-100/70 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-300/70 hover:border-slate-400 font-bold shadow-2xs'
            ]"
            class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition cursor-pointer"
            title="Enlaces de Red (Telecom, Agencias & ATMs)"
          >
            <Network class="h-3.5 w-3.5" :class="activeTab === 'redes' ? 'text-[#004D2C]' : 'text-slate-500'" />
            <span class="tracking-tight">Enlaces de Red</span>
            <span class="hidden xl:inline text-[10px] font-medium opacity-75">(Telecom & ATMs)</span>
            <span
              :class="activeTab === 'redes' ? 'bg-[#004D2C] text-white shadow-xs' : 'bg-slate-300 text-slate-800 border border-slate-400/40'"
              class="rounded-full px-2 py-0.2 text-[10px] font-black"
            >
              {{ totalNetworkRecords }}
            </span>
          </button>

          <!-- Tab 3: ACH Estadísticas -->
          <button
            type="button"
            @click="$emit('update:activeTab', 'ach')"
            :class="[
              activeTab === 'ach'
                ? 'bg-white text-[#004D2C] border-2 border-[#004D2C] shadow-md ring-2 ring-[#004D2C]/15 font-black'
                : 'bg-slate-100/70 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-300/70 hover:border-slate-400 font-bold shadow-2xs'
            ]"
            class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition cursor-pointer"
            title="ACH Estadísticas (Resolución & MLD Banco Central)"
          >
            <ArrowLeftRight class="h-3.5 w-3.5" :class="activeTab === 'ach' ? 'text-[#004D2C]' : 'text-slate-500'" />
            <span class="tracking-tight">ACH Estadísticas</span>
            <span class="hidden xl:inline text-[10px] font-medium opacity-75">(Resolución & MLD)</span>
            <span
              :class="activeTab === 'ach' ? 'bg-[#004D2C] text-white shadow-xs' : 'bg-slate-300 text-slate-800 border border-slate-400/40'"
              class="rounded-full px-2 py-0.2 text-[10px] font-black"
            >
              {{ totalAchRecords }}
            </span>
          </button>
        </nav>

        <!-- Right: Action Buttons of the Active Tab -->
        <div class="flex items-center flex-wrap gap-1.5 p-1 rounded-xl bg-slate-200/60 border border-slate-300/70 shadow-2xs">
          
          <!-- ================= SISTEMAS ACTIONS ================= -->
          <template v-if="activeTab === 'sistemas'">
            <!-- Import from Excel button -->
            <button
              type="button"
              @click="$emit('open-paste-modal')"
              class="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              title="Importar incidentes desde archivo Excel (.xlsx) o portapapeles"
            >
              <Upload class="h-3.5 w-3.5 text-[#004D2C]" />
              <span class="hidden sm:inline">Importar</span>
            </button>

            <!-- View Consolidated Report -->
            <button
              type="button"
              @click="$emit('open-report-modal')"
              class="flex items-center gap-1.5 rounded-lg border border-[#004D2C]/30 bg-[#004D2C]/5 px-2.5 py-1.5 text-xs font-semibold text-[#004D2C] hover:bg-[#004D2C]/10 transition shadow-2xs cursor-pointer"
              title="Ver disponibilidad y métricas consolidadas"
            >
              <BarChart3 class="h-3.5 w-3.5 text-[#004D2C]" />
              <span class="hidden sm:inline">Métricas</span>
            </button>

            <!-- Official BMSC Word Report -->
            <button
              type="button"
              @click="$emit('open-official-report')"
              class="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/90 px-2.5 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100 transition shadow-2xs cursor-pointer"
              title="Generar y descargar Informe Oficial BMSC en formato Word (.docx)"
            >
              <FileText class="h-3.5 w-3.5 text-blue-700" />
              <span class="hidden sm:inline">Informe Word</span>
            </button>

            <!-- Export Excel -->
            <button
              type="button"
              @click="$emit('export-excel')"
              class="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/70 transition shadow-2xs cursor-pointer"
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
          <template v-else-if="activeTab === 'redes'">
            <!-- Import from Excel button Redes -->
            <button
              type="button"
              @click="$emit('open-network-paste-modal')"
              class="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              title="Importar enlaces de red desde archivo Excel (.xlsx) o portapapeles"
            >
              <Upload class="h-3.5 w-3.5 text-[#004D2C]" />
              <span class="hidden sm:inline">Importar</span>
            </button>

            <!-- Export Excel -->
            <button
              type="button"
              @click="$emit('export-network-excel')"
              class="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/70 transition shadow-2xs cursor-pointer"
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

          <!-- ================= ACH ESTADISTICAS ACTIONS ================= -->
          <template v-else-if="activeTab === 'ach'">
            <!-- Import from Excel button ACH -->
            <button
              type="button"
              @click="$emit('open-ach-paste-modal')"
              class="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              title="Importar estadísticas ACH desde archivo Excel (.xlsx) o portapapeles"
            >
              <Upload class="h-3.5 w-3.5 text-[#004D2C]" />
              <span class="hidden sm:inline">Importar</span>
            </button>

            <!-- Export Excel ACH -->
            <button
              type="button"
              @click="$emit('export-ach-excel')"
              class="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/70 transition shadow-2xs cursor-pointer"
              title="Descargar reporte ACH en Excel (.xlsx)"
            >
              <FileSpreadsheet class="h-3.5 w-3.5 text-emerald-600" />
              <span class="hidden sm:inline">Exportar Excel</span>
            </button>

            <!-- Save to DB ACH -->
            <button
              type="button"
              @click="$emit('save-ach-oracle')"
              :disabled="isSavingOracle || totalAchRecords === 0"
              class="flex items-center gap-1.5 rounded-lg bg-[#004D2C] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#003B22] border border-[#003B22] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Guardar estadísticas ACH en Oracle DB (ACH_ESTADISTICAS)"
            >
              <Database class="h-3.5 w-3.5" :class="{ 'animate-spin': isSavingOracle }" />
              <span>{{ isSavingOracle ? 'Guardando...' : 'Guardar BD' }}</span>
            </button>
          </template>

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
  Network,
  ArrowLeftRight
} from 'lucide-vue-next'

withDefaults(
  defineProps<{
    year: number
    month: number
    draftStatusText: string
    isSavingOracle: boolean
    totalRecords: number
    activeTab?: 'sistemas' | 'redes' | 'ach'
    totalNetworkRecords?: number
    totalAchRecords?: number
  }>(),
  {
    activeTab: 'sistemas',
    totalNetworkRecords: 0,
    totalAchRecords: 0
  }
)

defineEmits<{
  (e: 'update:year', val: number): void
  (e: 'update:month', val: number): void
  (e: 'update:activeTab', val: 'sistemas' | 'redes' | 'ach'): void
  (e: 'open-paste-modal'): void
  (e: 'open-network-paste-modal'): void
  (e: 'open-ach-paste-modal'): void
  (e: 'open-report-modal'): void
  (e: 'open-official-report'): void
  (e: 'export-excel'): void
  (e: 'export-network-excel'): void
  (e: 'export-ach-excel'): void
  (e: 'save-oracle'): void
  (e: 'save-network-oracle'): void
  (e: 'save-ach-oracle'): void
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
