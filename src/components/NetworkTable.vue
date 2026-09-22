<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
    
    <!-- Table Toolbar: Action Button, Search & Filters (exact same layout as Transacciones) -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 p-3">
      
      <!-- Left: Primary Add Row Button + Search & Filters -->
      <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
        
        <!-- Primary "Agregar Enlace" button with corporate gold styling & single + -->
        <button
          type="button"
          @click="addNewRow"
          class="flex items-center gap-1.5 rounded-lg bg-[#D39F28] px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#BE8D1F] transition border border-[#B3831D] cursor-pointer shrink-0"
          title="Inserta una fila vacía para editar directamente en la tabla"
        >
          <Plus class="h-3.5 w-3.5 text-slate-950" />
          <span>Agregar Enlace</span>
        </button>

        <div class="h-4 w-[1px] bg-slate-300 mx-1 hidden sm:block"></div>

        <!-- Search box -->
        <div class="relative flex-1 min-w-[170px] max-w-xs">
          <Search class="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar en la tabla..."
            class="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#004D2C] focus:outline-none focus:ring-1 focus:ring-[#004D2C]"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="absolute right-2 top-1.5 text-xs text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <!-- Filter by Enlace -->
        <select
          v-model="filterEnlace"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#004D2C] focus:outline-none cursor-pointer"
        >
          <option value="ALL">Todos los Enlaces</option>
          <option v-for="enl in availableEnlaces" :key="enl" :value="enl">{{ enl }}</option>
        </select>

        <!-- Filter by Departamento -->
        <select
          v-model="filterDepto"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#004D2C] focus:outline-none cursor-pointer"
        >
          <option value="ALL">Todos los Deptos</option>
          <option v-for="dep in DEFAULT_DEPARTAMENTOS" :key="dep" :value="dep">{{ dep }}</option>
        </select>

        <!-- Reset filters button -->
        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          Limpiar Filtros
        </button>
      </div>

      <!-- Right: Actions, Counter & Density toggle -->
      <div class="flex items-center gap-3">
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

        <!-- Row Counter -->
        <span class="text-xs font-semibold text-slate-500 font-mono">
          {{ filteredRecords.length }} filas
        </span>

        <!-- View Density Toggle -->
        <div class="hidden sm:flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px] font-medium text-slate-600">
          <button
            type="button"
            @click="isCompact = false"
            :class="!isCompact ? 'bg-white text-[#004D2C] font-bold shadow-2xs' : 'hover:text-slate-900'"
            class="rounded-md px-2 py-1 transition cursor-pointer"
          >
            Cómoda
          </button>
          <button
            type="button"
            @click="isCompact = true"
            :class="isCompact ? 'bg-white text-[#004D2C] font-bold shadow-2xs' : 'hover:text-slate-900'"
            class="rounded-md px-2 py-1 transition cursor-pointer"
          >
            Compacta
          </button>
        </div>
      </div>

    </div>

    <!-- Main Table Container -->
    <div class="relative overflow-x-auto max-h-[68vh]">
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
            <th class="w-56 min-w-[210px] px-3 py-2.5 font-bold text-slate-800">Tipo de Enlace</th>

            <!-- Departamento Column -->
            <th class="w-32 px-3 py-2.5 font-bold text-slate-800">Departamento</th>

            <!-- Dynamic Nombre / Proveedor / Agencia / ATM Column -->
            <th class="min-w-[220px] px-3 py-2.5 font-bold text-slate-800">
              <div class="flex items-center gap-1.5">
                <span>{{ dynamicNombreHeader }}</span>
                <span class="rounded bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                  {{ dynamicNombreSubtitle }}
                </span>
              </div>
            </th>

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

            <!-- Enlace (Desplegable 3 opciones oficiales + Personalizar) -->
            <td class="px-2 py-1">
              <div class="relative flex items-center gap-0.5 w-full group/enl">
                <!-- Inline Custom Input Mode -->
                <div v-if="editingCustomEnlaceRowId === row.id" class="flex items-center gap-1 w-full">
                  <input
                    v-model="customEnlaceInput"
                    @keydown.enter.prevent="confirmCustomEnlace(row)"
                    @keydown.esc="cancelCustomEnlace"
                    placeholder="Ej: ENLACES SATELITALES"
                    class="w-full rounded border border-[#004D2C] bg-white px-1.5 py-0.5 text-xs font-bold uppercase text-slate-900 focus:outline-none shadow-2xs"
                    autofocus
                  />
                  <button
                    type="button"
                    @click="confirmCustomEnlace(row)"
                    class="rounded p-1 bg-[#004D2C] text-white hover:bg-[#003B22] transition shrink-0 cursor-pointer"
                    title="Guardar tipo de enlace"
                  >
                    <Check class="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    @click="cancelCustomEnlace"
                    class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition shrink-0 cursor-pointer"
                    title="Cancelar"
                  >
                    ✕
                  </button>
                </div>

                <!-- Select Mode (3 official options + any existing custom + option to add custom) -->
                <div v-else class="flex items-center gap-0.5 w-full">
                  <select
                    :value="row.enlace"
                    @change="handleEnlaceSelect(row, $event)"
                    :class="[
                      enlaceSelectClass(row.enlace),
                      'w-full rounded-md border px-1.5 py-0.5 text-xs font-bold focus:outline-none cursor-pointer truncate shadow-2xs transition'
                    ]"
                    title="Seleccionar tipo de enlace"
                  >
                    <option
                      v-for="enl in availableEnlaces"
                      :key="enl"
                      :value="enl"
                    >
                      {{ enl }}
                    </option>
                    <option disabled>──────────</option>
                    <option value="__CUSTOM_NEW__" class="text-[#004D2C] font-semibold">
                      ✏️ + Personalizar nuevo enlace...
                    </option>
                  </select>

                  <!-- Direct Pencil Button on Hover to write custom code -->
                  <button
                    type="button"
                    @click="startCustomEnlace(row)"
                    class="opacity-0 group-hover/enl:opacity-100 p-0.5 rounded text-slate-400 hover:text-[#004D2C] hover:bg-slate-100 transition cursor-pointer shrink-0"
                    title="Escribir tipo de enlace personalizado"
                  >
                    <Edit3 class="h-3 w-3" />
                  </button>
                </div>
              </div>
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

            <!-- Nombre (editable text with dynamic placeholder and type tag) -->
            <td class="px-2 py-1">
              <div class="flex items-center gap-1.5">
                <span
                  v-if="filterEnlace === 'ALL'"
                  class="shrink-0 rounded px-1.5 py-0.2 text-[9px] font-bold uppercase border"
                  :class="[
                    row.enlace?.includes('WAN') ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    row.enlace?.includes('AGENCIA') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  ]"
                  :title="row.enlace"
                >
                  {{ getNombreFieldLabel(row.enlace) }}
                </span>
                <input
                  v-model="row.nombre"
                  type="text"
                  :placeholder="getNombreFieldPlaceholder(row.enlace)"
                  class="w-full rounded border border-transparent hover:border-slate-300 focus:border-[#004D2C] bg-transparent px-1.5 py-0.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
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
                  Usa el botón <strong>«Agregar Enlace»</strong> o <strong>«Pegar Tabla»</strong> para cargar filas desde Excel.
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Datalist for Departamento Autocomplete -->
    <datalist id="depto-list">
      <option v-for="dep in DEFAULT_DEPARTAMENTOS" :key="dep" :value="dep" />
    </datalist>

    <!-- Bottom Metrics Summary Bar (integrated in unified card) -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/70 p-3.5">
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
import { ref, computed, watch } from 'vue'
import type { NetworkEventRecord } from '../types/networkUptime'
import {
  DEFAULT_ENLACES,
  DEFAULT_DEPARTAMENTOS,
  parseUptimePercentage,
  formatUptimePercent,
  getNombreFieldLabel,
  getNombreFieldPlaceholder
} from '../types/networkUptime'
import {
  Search,
  Plus,
  Trash2,
  BarChart3,
  Network,
  Check,
  Edit3
} from 'lucide-vue-next'

const props = defineProps<{
  records: NetworkEventRecord[]
  referenceDate: string
}>()

const emit = defineEmits<{
  (e: 'update:records', val: NetworkEventRecord[]): void
}>()

const isCompact = ref(false)
const searchQuery = ref('')
const filterEnlace = ref('ALL')
const filterDepto = ref('ALL')

const availableEnlaces = computed(() => {
  const set = new Set<string>()
  DEFAULT_ENLACES.forEach(e => {
    const clean = e.replace(/\s+/g, ' ').trim().toUpperCase()
    if (clean) set.add(clean)
  })
  props.records.forEach(r => {
    if (r.enlace) {
      const clean = r.enlace.replace(/\s+/g, ' ').trim().toUpperCase()
      if (clean) set.add(clean)
    }
  })
  return Array.from(set)
})

// Auto-sanitize existing records' enlace so any untrimmed strings from localStorage/DB are cleaned up
watch(
  () => props.records,
  (recs) => {
    if (!recs) return
    recs.forEach(r => {
      if (r.enlace) {
        const clean = r.enlace.replace(/\s+/g, ' ').trim().toUpperCase()
        if (clean !== r.enlace) {
          r.enlace = clean
        }
      }
    })
  },
  { immediate: true, deep: true }
)

const dynamicNombreHeader = computed(() => {
  if (filterEnlace.value === 'ALL') return 'Detalle / Nombre'
  return getNombreFieldLabel(filterEnlace.value)
})

const dynamicNombreSubtitle = computed(() => {
  if (filterEnlace.value === 'ALL') return 'Proveedor / Agencia / Nombre'
  if (filterEnlace.value === 'ENLACES WAN NACIONAL') return 'Proveedor Telecom'
  if (filterEnlace.value === 'ENLACES AGENCIAS NACIONAL') return 'Nombre de Agencia'
  if (filterEnlace.value === 'ENLACES ATMS NACIONAL') return 'Nombre del Cajero ATM'
  return ''
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

// Custom Enlace Inline Editing State & Handlers
const editingCustomEnlaceRowId = ref<string | null>(null)
const customEnlaceInput = ref('')

function handleEnlaceSelect(row: NetworkEventRecord, e: Event) {
  const target = e.target as HTMLSelectElement
  const val = target.value
  if (val === '__CUSTOM_NEW__') {
    startCustomEnlace(row)
  } else {
    row.enlace = val
  }
}

function startCustomEnlace(row: NetworkEventRecord) {
  editingCustomEnlaceRowId.value = row.id
  customEnlaceInput.value = row.enlace || ''
}

function confirmCustomEnlace(row: NetworkEventRecord) {
  const clean = customEnlaceInput.value.trim().toUpperCase()
  if (clean) {
    row.enlace = clean
  }
  editingCustomEnlaceRowId.value = null
  customEnlaceInput.value = ''
}

function cancelCustomEnlace() {
  editingCustomEnlaceRowId.value = null
  customEnlaceInput.value = ''
}

function enlaceSelectClass(val?: string): string {
  if (!val) return 'bg-slate-50 text-slate-400 border-slate-200'
  const v = val.toUpperCase()
  if (v.includes('WAN')) {
    return 'bg-purple-50 text-purple-800 border-purple-200 hover:border-purple-300'
  }
  if (v.includes('AGENCIA')) {
    return 'bg-blue-50 text-blue-800 border-blue-200 hover:border-blue-300'
  }
  if (v.includes('ATM')) {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-300'
  }
  return 'bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-300'
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
