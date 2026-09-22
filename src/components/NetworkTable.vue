<template>
  <div class="space-y-3">
    <!-- Filter and Quick Action Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
      
      <!-- Left Filters -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <!-- Search query -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre, agencia, ATM..."
            class="w-56 sm:w-64 rounded-lg border border-slate-300 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#004D2C] focus:outline-none"
          />
          <Search class="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
        </div>

        <!-- Filter by Enlace -->
        <select
          v-model="filterEnlace"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#004D2C] focus:outline-none cursor-pointer"
        >
          <option value="ALL">Todos los Enlaces</option>
          <option v-for="enl in availableEnlaces" :key="enl" :value="enl">{{ enl }}</option>
        </select>

        <!-- Filter by Departamento -->
        <select
          v-model="filterDepto"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#004D2C] focus:outline-none cursor-pointer"
        >
          <option value="ALL">Todos los Deptos</option>
          <option v-for="dep in DEFAULT_DEPARTAMENTOS" :key="dep" :value="dep">{{ dep }}</option>
        </select>

        <!-- Reset filters button -->
        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          Limpiar Filtros
        </button>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-2">
        <!-- Batch Delete Button -->
        <button
          v-if="selectedCount > 0"
          type="button"
          @click="deleteSelectedRows"
          class="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer shadow-2xs"
        >
          <Trash2 class="h-3.5 w-3.5" />
          <span>Eliminar ({{ selectedCount }})</span>
        </button>

        <!-- Quick Add Row -->
        <button
          type="button"
          @click="addNewRow"
          class="flex items-center gap-1.5 rounded-lg bg-[#D39F28] px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-[#BE8D1F] transition cursor-pointer shadow-2xs border border-[#B3831D]"
        >
          <Plus class="h-3.5 w-3.5 text-slate-950" />
          <span>+ Enlace</span>
        </button>
      </div>

    </div>

    <!-- Main Table Container -->
    <div class="relative overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs max-h-[68vh]">
      <table class="w-full text-left text-xs border-collapse">
        <!-- Table Header -->
        <thead class="sticky top-0 z-20 bg-slate-100 text-slate-700 border-b border-slate-300 shadow-2xs">
          <tr>
            <!-- Select All Checkbox -->
            <th class="w-9 px-3 py-2.5 text-center">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleSelectAll"
                class="rounded border-slate-300 text-[#004D2C] focus:ring-[#004D2C] cursor-pointer"
              />
            </th>

            <!-- N° Column -->
            <th class="w-12 px-2 py-2.5 text-center font-bold text-slate-600">N°</th>

            <!-- Fecha Column -->
            <th class="w-28 px-3 py-2.5 font-bold text-slate-800">Fecha</th>

            <!-- Enlace Column -->
            <th class="w-44 px-3 py-2.5 font-bold text-slate-800">Tipo de Enlace</th>

            <!-- Departamento Column -->
            <th class="w-32 px-3 py-2.5 font-bold text-slate-800">Departamento</th>

            <!-- Nombre / Proveedor / Agencia / ATM Column -->
            <th class="min-w-[220px] px-3 py-2.5 font-bold text-slate-800">Nombre / Agencia / ATM</th>

            <!-- Uptime Mensual Column -->
            <th class="w-32 px-3 py-2.5 text-center font-bold text-slate-800">
              Uptime Mes (%)
            </th>

            <!-- Uptime Anual Column -->
            <th class="w-32 px-3 py-2.5 text-center font-bold text-slate-800">
              Uptime Anual (%)
            </th>

            <!-- Actions Column -->
            <th class="w-16 px-2 py-2.5 text-center font-bold text-slate-600">Acción</th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="(row, idx) in filteredRecords"
            :key="row.id"
            :class="[
              row.selected ? 'bg-amber-50/60' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50',
              'hover:bg-slate-50 transition'
            ]"
          >
            <!-- Checkbox -->
            <td class="px-3 py-1.5 text-center">
              <input
                type="checkbox"
                v-model="row.selected"
                class="rounded border-slate-300 text-[#004D2C] focus:ring-[#004D2C] cursor-pointer"
              />
            </td>

            <!-- Row index -->
            <td class="px-2 py-1.5 text-center font-mono text-[11px] text-slate-400">
              {{ idx + 1 }}
            </td>

            <!-- Fecha (editable) -->
            <td class="px-2 py-1">
              <input
                v-model="row.fecha"
                type="date"
                class="w-full rounded border border-transparent hover:border-slate-300 focus:border-[#004D2C] bg-transparent px-1.5 py-0.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
              />
            </td>

            <!-- Enlace (editable select / input) -->
            <td class="px-2 py-1">
              <input
                v-model="row.enlace"
                list="enlace-list"
                placeholder="Tipo de enlace"
                class="w-full rounded border border-transparent hover:border-slate-300 focus:border-[#004D2C] bg-transparent px-1.5 py-0.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none"
              />
            </td>

            <!-- Departamento (editable select / input) -->
            <td class="px-2 py-1">
              <input
                v-model="row.departamento"
                list="depto-list"
                placeholder="Departamento"
                class="w-full rounded border border-transparent hover:border-slate-300 focus:border-[#004D2C] bg-transparent px-1.5 py-0.5 text-xs uppercase font-medium text-slate-800 focus:bg-white focus:outline-none"
              />
            </td>

            <!-- Nombre (editable text) -->
            <td class="px-2 py-1">
              <input
                v-model="row.nombre"
                type="text"
                placeholder="Nombre de proveedor, agencia o ATM..."
                class="w-full rounded border border-transparent hover:border-slate-300 focus:border-[#004D2C] bg-transparent px-1.5 py-0.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
            </td>

            <!-- Uptime Mensual (editable number) -->
            <td class="px-2 py-1 text-center">
              <div class="relative flex items-center justify-center">
                <input
                  :value="row.uptimeMensual"
                  @change="updateMonthlyUptime(row, ($event.target as HTMLInputElement).value)"
                  type="text"
                  class="w-24 text-center rounded border border-transparent hover:border-slate-300 focus:border-[#004D2C] bg-transparent px-1 py-0.5 font-mono text-xs font-bold focus:bg-white focus:outline-none"
                  :class="getUptimeColorClass(row.uptimeMensual)"
                />
              </div>
            </td>

            <!-- Uptime Anual (editable number) -->
            <td class="px-2 py-1 text-center">
              <div class="relative flex items-center justify-center">
                <input
                  :value="row.uptimeAnual"
                  @change="updateAnnualUptime(row, ($event.target as HTMLInputElement).value)"
                  type="text"
                  class="w-24 text-center rounded border border-transparent hover:border-slate-300 focus:border-[#004D2C] bg-transparent px-1 py-0.5 font-mono text-xs font-semibold focus:bg-white focus:outline-none"
                  :class="getUptimeColorClass(row.uptimeAnual)"
                />
              </div>
            </td>

            <!-- Delete action -->
            <td class="px-2 py-1 text-center">
              <button
                type="button"
                @click="deleteRow(row.id)"
                class="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                title="Eliminar este enlace"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="filteredRecords.length === 0">
            <td colspan="9" class="p-8 text-center text-slate-400">
              <div class="flex flex-col items-center justify-center gap-2">
                <Network class="h-8 w-8 text-slate-300" />
                <span class="font-medium text-xs">No hay enlaces de red registrados para este período.</span>
                <span class="text-[11px] text-slate-400">
                  Usa el botón <strong>«+ Enlace»</strong> o <strong>«Pegar Tabla»</strong> para cargar filas desde Excel.
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Datalists for Autocomplete -->
    <datalist id="enlace-list">
      <option v-for="enl in availableEnlaces" :key="enl" :value="enl" />
    </datalist>

    <datalist id="depto-list">
      <option v-for="dep in DEFAULT_DEPARTAMENTOS" :key="dep" :value="dep" />
    </datalist>

    <!-- Bottom Metrics Summary Bar -->
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#004D2C]/10 text-[#004D2C]">
          <BarChart3 class="h-4 w-4" />
        </div>
        <span class="text-xs font-bold text-slate-800">
          Resumen de Disponibilidad de Redes ({{ records.length }} enlaces en total)
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-6 text-xs font-medium">
        <div>
          <span class="text-slate-500">Promedio Mensual: </span>
          <strong class="font-mono text-sm font-bold" :class="getUptimeColorClass(avgMonthlyUptime)">
            {{ formatUptimePercent(avgMonthlyUptime) }}
          </strong>
        </div>
        <div>
          <span class="text-slate-500">Promedio Anual: </span>
          <strong class="font-mono text-sm font-bold" :class="getUptimeColorClass(avgAnnualUptime)">
            {{ formatUptimePercent(avgAnnualUptime) }}
          </strong>
        </div>
        <div>
          <span class="text-slate-500">Enlaces 100%: </span>
          <strong class="font-mono text-emerald-700">{{ fullUptimeCount }}</strong>
        </div>
        <div>
          <span class="text-slate-500">Enlaces &lt; 99.8%: </span>
          <strong class="font-mono" :class="degradedCount > 0 ? 'text-amber-600' : 'text-slate-400'">
            {{ degradedCount }}
          </strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NetworkEventRecord } from '../types/networkUptime'
import {
  DEFAULT_ENLACES,
  DEFAULT_DEPARTAMENTOS,
  parseUptimePercentage,
  formatUptimePercent
} from '../types/networkUptime'
import {
  Search,
  Plus,
  Trash2,
  BarChart3,
  Network
} from 'lucide-vue-next'

const props = defineProps<{
  records: NetworkEventRecord[]
  referenceDate: string
}>()

const emit = defineEmits<{
  (e: 'update:records', val: NetworkEventRecord[]): void
}>()

const searchQuery = ref('')
const filterEnlace = ref('ALL')
const filterDepto = ref('ALL')

const availableEnlaces = computed(() => {
  const custom = props.records.map(r => r.enlace).filter(Boolean)
  return Array.from(new Set([...DEFAULT_ENLACES, ...custom]))
})

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || filterEnlace.value !== 'ALL' || filterDepto.value !== 'ALL'
})

function resetFilters() {
  searchQuery.value = ''
  filterEnlace.value = 'ALL'
  filterDepto.value = 'ALL'
}

const filteredRecords = computed(() => {
  return props.records.filter(r => {
    if (filterEnlace.value !== 'ALL' && r.enlace !== filterEnlace.value) return false
    if (filterDepto.value !== 'ALL' && r.departamento !== filterDepto.value) return false
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchName = r.nombre?.toLowerCase().includes(q)
      const matchDepto = r.departamento?.toLowerCase().includes(q)
      const matchEnlace = r.enlace?.toLowerCase().includes(q)
      if (!matchName && !matchDepto && !matchEnlace) return false
    }
    return true
  })
})

const selectedCount = computed(() => {
  return props.records.filter(r => r.selected).length
})

const isAllSelected = computed(() => {
  return filteredRecords.value.length > 0 && filteredRecords.value.every(r => r.selected)
})

const isIndeterminate = computed(() => {
  const count = filteredRecords.value.filter(r => r.selected).length
  return count > 0 && count < filteredRecords.value.length
})

function toggleSelectAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  filteredRecords.value.forEach(r => {
    r.selected = checked
  })
}

function addNewRow() {
  const newRow: NetworkEventRecord = {
    id: `net_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    creadoEn: new Date().toISOString(),
    fecha: props.referenceDate || new Date().toISOString().slice(0, 10),
    enlace: filterEnlace.value !== 'ALL' ? filterEnlace.value : DEFAULT_ENLACES[0],
    departamento: filterDepto.value !== 'ALL' ? filterDepto.value : 'NACIONAL',
    nombre: '',
    uptimeMensual: 100,
    uptimeAnual: 100,
    selected: false
  }

  emit('update:records', [newRow, ...props.records])
}

function deleteRow(id: string) {
  emit('update:records', props.records.filter(r => r.id !== id))
}

function deleteSelectedRows() {
  emit('update:records', props.records.filter(r => !r.selected))
}

function updateMonthlyUptime(row: NetworkEventRecord, val: string) {
  row.uptimeMensual = parseUptimePercentage(val)
}

function updateAnnualUptime(row: NetworkEventRecord, val: string) {
  row.uptimeAnual = parseUptimePercentage(val)
}

function getUptimeColorClass(val: number): string {
  if (val >= 99.9) return 'text-emerald-700'
  if (val >= 99.0) return 'text-amber-600'
  return 'text-rose-600'
}

// Global Metrics Computed
const avgMonthlyUptime = computed(() => {
  if (props.records.length === 0) return 100
  const sum = props.records.reduce((acc, r) => acc + (Number(r.uptimeMensual) || 0), 0)
  return sum / props.records.length
})

const avgAnnualUptime = computed(() => {
  if (props.records.length === 0) return 100
  const sum = props.records.reduce((acc, r) => acc + (Number(r.uptimeAnual) || 0), 0)
  return sum / props.records.length
})

const fullUptimeCount = computed(() => {
  return props.records.filter(r => r.uptimeMensual >= 100).length
})

const degradedCount = computed(() => {
  return props.records.filter(r => r.uptimeMensual < 99.8).length
})
</script>
