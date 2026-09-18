<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
    
    <!-- Table Toolbar: Action Button, Search & Filters -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 p-3">
      
      <!-- Left: Primary Add Row Button + Search & Filters -->
      <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
        
        <!-- Primary "+ Agregar Fila" button -->
        <button
          type="button"
          @click="$emit('add-row-inline')"
          class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
          title="Inserta una fila vacía para editar directamente en la tabla"
        >
          <Plus class="h-3.5 w-3.5" />
          <span>+ Agregar Fila</span>
        </button>

        <button
          type="button"
          @click="$emit('open-create-modal')"
          class="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs"
          title="Abrir formulario guiado paso a paso"
        >
          <FileText class="h-3.5 w-3.5 text-slate-500" />
          <span class="hidden sm:inline">Formulario Detallado</span>
        </button>

        <div class="h-4 w-[1px] bg-slate-300 mx-1 hidden sm:block"></div>

        <!-- Search box -->
        <div class="relative flex-1 min-w-[170px] max-w-xs">
          <Search class="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            v-model="filters.searchQuery"
            type="text"
            placeholder="Buscar en la tabla..."
            class="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <button
            v-if="filters.searchQuery"
            type="button"
            @click="filters.searchQuery = ''"
            class="absolute right-2 top-1.5 text-xs text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <!-- Filter Sistema -->
        <select
          v-model="filters.sistema"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-600 focus:outline-none cursor-pointer"
        >
          <option value="">Todos los sistemas</option>
          <option v-for="sys in availableSystems" :key="sys" :value="sys">{{ sys }}</option>
        </select>

        <!-- Filter Indicador -->
        <select
          v-model="filters.indicador"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-600 focus:outline-none cursor-pointer"
        >
          <option value="">Todos los indicadores</option>
          <option value="II-FALLAS">II-FALLAS</option>
          <option value="II-PROVEEDOR">II-PROVEEDOR</option>
          <option value="II-PROGRAMADA">II-PROGRAMADA</option>
        </select>

        <!-- Filter Declarado -->
        <select
          v-model="filters.declarado"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-600 focus:outline-none cursor-pointer"
        >
          <option value="ALL">Declarado: Todos</option>
          <option value="YES">Solo Declarados (Sí)</option>
          <option value="NO">Solo No Declarados (No)</option>
        </select>

        <button
          v-if="hasActiveFilters"
          type="button"
          @click="resetFilters"
          class="text-xs text-blue-600 hover:underline px-1 font-medium"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Right: Segmented View Toggle (Cómoda / Compacta) & Count info -->
      <div class="flex items-center gap-3">
        <span class="text-xs text-slate-500">
          <strong class="text-slate-800">{{ filteredEvents.length }}</strong> filas
        </span>

        <!-- Segmented Control for View Mode -->
        <div class="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
          <button
            type="button"
            @click="isCompact = false"
            :class="[
              'rounded-md px-2.5 py-1 font-medium transition',
              !isCompact ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            Cómoda
          </button>
          <button
            type="button"
            @click="isCompact = true"
            :class="[
              'rounded-md px-2.5 py-1 font-medium transition',
              isCompact ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            Compacta
          </button>
        </div>
      </div>

    </div>

    <!-- The Editable Grid Table -->
    <div class="overflow-x-auto max-h-[660px]">
      <table
        class="w-full text-left border-collapse"
        :class="isCompact ? 'text-[11px]' : 'text-xs'"
      >
        <!-- Sticky Table Header -->
        <thead
          class="sticky top-0 z-20 bg-slate-100/95 backdrop-blur-md border-b border-slate-200 text-slate-700 shadow-xs select-none"
        >
          <tr>
            <!-- Checkbox All -->
            <th class="w-8 text-center" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleSelectAll"
                class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                :class="isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'"
              />
            </th>

            <th class="w-8 text-center text-slate-400 font-mono" :class="isCompact ? 'py-1.5 px-1' : 'py-2.5 px-2'">#</th>
            
            <th class="min-w-[130px] font-semibold cursor-pointer hover:text-slate-900" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'" @click="toggleSort('sistema')">
              <div class="flex items-center gap-1">
                <span>Sistema *</span>
                <ArrowUpDown class="h-3 w-3 text-slate-400" />
              </div>
            </th>

            <th class="min-w-[120px] font-semibold" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'">Componente</th>
            
            <th class="min-w-[105px] font-semibold cursor-pointer hover:text-slate-900" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'" @click="toggleSort('fecha')">
              <div class="flex items-center gap-1">
                <span>Fecha *</span>
                <ArrowUpDown class="h-3 w-3 text-slate-400" />
              </div>
            </th>

            <th class="min-w-[85px] font-semibold" :class="isCompact ? 'py-1.5 px-1.5' : 'py-2.5 px-2'">Inicio *</th>
            <th class="min-w-[85px] font-semibold" :class="isCompact ? 'py-1.5 px-1.5' : 'py-2.5 px-2'">Fin *</th>

            <th class="min-w-[95px] font-semibold cursor-pointer hover:text-slate-900" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'" @click="toggleSort('duracion')">
              <div class="flex items-center gap-1">
                <span>Duración</span>
                <ArrowUpDown class="h-3 w-3 text-slate-400" />
              </div>
            </th>

            <th class="min-w-[125px] font-semibold" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'">Indicador *</th>
            <th class="min-w-[120px] font-semibold" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'">Responsable</th>
            <th class="min-w-[110px] font-semibold" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'">Origen</th>
            
            <th class="min-w-[95px] font-semibold text-center" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'">Declarado</th>

            <th class="min-w-[100px] font-semibold" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'">Bitácora</th>
            <th class="min-w-[180px] font-semibold" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'">Motivo / Causa</th>
            <th class="min-w-[160px] font-semibold" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'">Solución</th>

            <th class="sticky right-0 z-20 w-20 bg-slate-100/95 text-center font-semibold border-l border-slate-200" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'">Acciones</th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="(event, idx) in filteredEvents"
            :key="event.id"
            :class="[
              'transition-colors duration-100',
              event.selected ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50/80',
              isCompact ? 'h-7' : 'h-10'
            ]"
          >
            <!-- Select Checkbox -->
            <td class="text-center" :class="isCompact ? 'py-0.5 px-2' : 'py-2 px-3'">
              <input
                type="checkbox"
                v-model="event.selected"
                class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                :class="isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'"
              />
            </td>

            <!-- Row index -->
            <td class="text-center font-mono text-slate-400 text-[10px]" :class="isCompact ? 'py-0.5 px-1' : 'py-2 px-2'">
              {{ idx + 1 }}
            </td>

            <!-- Sistema -->
            <td :class="isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2'">
              <input
                v-model="event.sistema"
                @change="onRecordFieldChange(event)"
                class="table-cell-input font-semibold text-slate-900"
                :class="isCompact ? 'h-6 text-[11px] py-0 px-1.5' : 'h-8 text-xs py-1 px-2'"
                placeholder="Ej: CORE T24"
              />
            </td>

            <!-- Componente [NUEVO] -->
            <td :class="isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2'">
              <input
                v-model="event.componente"
                @change="onRecordFieldChange(event)"
                class="table-cell-input text-slate-700"
                :class="isCompact ? 'h-6 text-[11px] py-0 px-1.5' : 'h-8 text-xs py-1 px-2'"
                placeholder="Componente..."
              />
            </td>

            <!-- Fecha -->
            <td :class="isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2'">
              <input
                v-model="event.fecha"
                type="date"
                @change="onRecordFieldChange(event)"
                class="table-cell-input text-slate-700 font-mono"
                :class="isCompact ? 'h-6 text-[10px] py-0 px-1' : 'h-8 text-[11px] py-1 px-1.5'"
              />
            </td>

            <!-- Hora Inicio -->
            <td :class="isCompact ? 'py-0.5 px-1' : 'py-1.5 px-1.5'">
              <input
                v-model="event.horaInicio"
                type="time"
                step="1"
                @change="onTimeChange(event)"
                class="table-cell-input text-slate-700 font-mono"
                :class="isCompact ? 'h-6 text-[10px] py-0 px-1' : 'h-8 text-[11px] py-1 px-1.5'"
              />
            </td>

            <!-- Hora Fin -->
            <td :class="isCompact ? 'py-0.5 px-1' : 'py-1.5 px-1.5'">
              <input
                v-model="event.horaFin"
                type="time"
                step="1"
                @change="onTimeChange(event)"
                class="table-cell-input text-slate-700 font-mono"
                :class="isCompact ? 'h-6 text-[10px] py-0 px-1' : 'h-8 text-[11px] py-1 px-1.5'"
              />
            </td>

            <!-- Duración (Calculada automáticamente) -->
            <td :class="isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2'">
              <div
                class="flex items-center gap-1 font-mono font-semibold text-slate-800 bg-slate-100 rounded border border-slate-200"
                :class="isCompact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]'"
              >
                <Clock class="h-2.5 w-2.5 text-slate-400" />
                <span>{{ event.tiempoServicioAbajo }}</span>
              </div>
            </td>

            <!-- Indicador -->
            <td :class="isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2'">
              <select
                v-model="event.indicador"
                @change="onRecordFieldChange(event)"
                :class="[
                  indicatorSelectClass(event.indicador),
                  isCompact ? 'h-6 text-[10px] py-0 px-1.5' : 'h-8 text-[11px] py-1 px-2'
                ]"
                class="rounded-md border font-bold focus:outline-none cursor-pointer w-full"
              >
                <option value="II-FALLAS" class="text-rose-700">II-FALLAS</option>
                <option value="II-PROVEEDOR" class="text-amber-800">II-PROVEEDOR</option>
                <option value="II-PROGRAMADA" class="text-blue-700">II-PROGRAMADA</option>
              </select>
            </td>

            <!-- Responsable [NUEVO] -->
            <td :class="isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2'">
              <input
                v-model="event.responsable"
                @change="onRecordFieldChange(event)"
                class="table-cell-input text-slate-700"
                :class="isCompact ? 'h-6 text-[11px] py-0 px-1.5' : 'h-8 text-xs py-1 px-2'"
                placeholder="Responsable..."
              />
            </td>

            <!-- Origen [NUEVO] -->
            <td :class="isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2'">
              <input
                v-model="event.origen"
                @change="onRecordFieldChange(event)"
                class="table-cell-input text-slate-700"
                :class="isCompact ? 'h-6 text-[11px] py-0 px-1.5' : 'h-8 text-xs py-1 px-2'"
                placeholder="Origen..."
              />
            </td>

            <!-- Declarado [NUEVO] -->
            <td class="text-center" :class="isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2'">
              <button
                type="button"
                @click="toggleDeclarado(event)"
                :class="[
                  'inline-flex items-center gap-1 rounded-full font-bold transition shadow-2xs cursor-pointer',
                  event.declarado ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-500 border border-slate-200',
                  isCompact ? 'px-2 py-0 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'
                ]"
              >
                <Check v-if="event.declarado" class="h-2.5 w-2.5 text-emerald-600" />
                <span>{{ event.declarado ? 'SÍ' : 'NO' }}</span>
              </button>
            </td>

            <!-- Bitácora [NUEVO] -->
            <td :class="isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2'">
              <input
                v-model="event.bitacora"
                @change="onRecordFieldChange(event)"
                class="table-cell-input text-slate-700 font-mono"
                :class="isCompact ? 'h-6 text-[10px] py-0 px-1.5' : 'h-8 text-[11px] py-1 px-2'"
                placeholder="INC-..."
              />
            </td>

            <!-- Motivo -->
            <td :class="isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2'">
              <div class="flex items-center gap-1 group">
                <input
                  v-model="event.motivo"
                  @change="onRecordFieldChange(event)"
                  class="table-cell-input text-slate-700 truncate"
                  :class="isCompact ? 'h-6 text-[11px] py-0 px-1.5' : 'h-8 text-xs py-1 px-2'"
                  placeholder="Motivo..."
                />
                <button
                  type="button"
                  @click="$emit('open-detail-modal', event)"
                  class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 p-0.5 transition"
                  title="Expandir texto"
                >
                  <Maximize2 class="h-3 w-3" />
                </button>
              </div>
            </td>

            <!-- Solución [NUEVO] -->
            <td :class="isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2'">
              <div class="flex items-center gap-1 group">
                <input
                  v-model="event.solucion"
                  @change="onRecordFieldChange(event)"
                  class="table-cell-input text-slate-700 truncate"
                  :class="isCompact ? 'h-6 text-[11px] py-0 px-1.5' : 'h-8 text-xs py-1 px-2'"
                  placeholder="Solución..."
                />
                <button
                  type="button"
                  @click="$emit('open-detail-modal', event)"
                  class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 p-0.5 transition"
                  title="Expandir texto"
                >
                  <Maximize2 class="h-3 w-3" />
                </button>
              </div>
            </td>

            <!-- Actions (Sticky right) -->
            <td
              class="sticky right-0 z-10 bg-white/95 backdrop-blur-xs text-center border-l border-slate-100"
              :class="isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2'"
            >
              <div class="flex items-center justify-center gap-0.5">
                <!-- Clone Row -->
                <button
                  type="button"
                  @click="cloneRecord(event)"
                  class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                  title="Duplicar incidente"
                >
                  <Copy class="h-3.5 w-3.5" />
                </button>

                <!-- Edit Modal -->
                <button
                  type="button"
                  @click="$emit('open-detail-modal', event)"
                  class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition"
                  title="Editar en ventana amplia"
                >
                  <Edit3 class="h-3.5 w-3.5" />
                </button>

                <!-- Delete -->
                <button
                  type="button"
                  @click="deleteRecord(event.id)"
                  class="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                  title="Eliminar incidente"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </td>

          </tr>

          <!-- Quick inline Add Row button row at the bottom of the table -->
          <tr
            class="bg-slate-50/50 hover:bg-blue-50/40 transition cursor-pointer"
            @click="$emit('add-row-inline')"
          >
            <td colspan="15" class="py-2.5 px-4 text-center">
              <div class="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700">
                <Plus class="h-3.5 w-3.5" />
                <span>+ Agregar nueva fila a la tabla</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty state -->
      <div v-if="filteredEvents.length === 0" class="py-16 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <Database class="h-5 w-5" />
        </div>
        <h4 class="text-sm font-bold text-slate-800">No hay incidentes registrados</h4>
        <p class="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Comienza agregando tu primera fila directamente o importa registros desde el portapapeles.
        </p>
        <div class="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            @click="$emit('add-row-inline')"
            class="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
          >
            + Agregar Primer Incidente
          </button>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import {
  Search,
  ArrowUpDown,
  Clock,
  Check,
  Maximize2,
  Copy,
  Edit3,
  Trash2,
  Database,
  Plus,
  FileText
} from 'lucide-vue-next'
import type { EventRecordV2, StandardIndicator } from '../types/uptime'
import {
  calculateDurationFromTimes,
  formatSecondsToHHMMSS
} from '../utils/calculator'

const props = defineProps<{
  events: EventRecordV2[]
  availableSystems?: string[]
}>()

const emit = defineEmits<{
  (e: 'update-events', events: EventRecordV2[]): void
  (e: 'open-detail-modal', event: EventRecordV2): void
  (e: 'open-create-modal'): void
  (e: 'add-row-inline'): void
}>()

const isCompact = ref(false)

const filters = reactive({
  searchQuery: '',
  sistema: '',
  indicador: '',
  declarado: 'ALL'
})

const hasActiveFilters = computed(() => {
  return Boolean(filters.searchQuery || filters.sistema || filters.indicador || filters.declarado !== 'ALL')
})

function resetFilters() {
  filters.searchQuery = ''
  filters.sistema = ''
  filters.indicador = ''
  filters.declarado = 'ALL'
}

type SortField = 'sistema' | 'fecha' | 'duracion'
const sortField = ref<SortField>('fecha')
const sortOrder = ref<'asc' | 'desc'>('desc')

function toggleSort(field: SortField) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

const filteredEvents = computed(() => {
  let list = [...props.events]

  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim()
    list = list.filter(e => {
      return (
        (e.sistema || '').toLowerCase().includes(q) ||
        (e.componente || '').toLowerCase().includes(q) ||
        (e.motivo || '').toLowerCase().includes(q) ||
        (e.solucion || '').toLowerCase().includes(q) ||
        (e.responsable || '').toLowerCase().includes(q) ||
        (e.origen || '').toLowerCase().includes(q) ||
        (e.bitacora || '').toLowerCase().includes(q)
      )
    })
  }

  if (filters.sistema) {
    list = list.filter(e => (e.sistema || '').toUpperCase() === filters.sistema.toUpperCase())
  }

  if (filters.indicador) {
    list = list.filter(e => e.indicador === filters.indicador)
  }

  if (filters.declarado === 'YES') {
    list = list.filter(e => e.declarado === true)
  } else if (filters.declarado === 'NO') {
    list = list.filter(e => e.declarado === false)
  }

  // Sorting
  list.sort((a, b) => {
    let cmp = 0
    if (sortField.value === 'sistema') {
      cmp = (a.sistema || '').localeCompare(b.sistema || '')
    } else if (sortField.value === 'fecha') {
      const dateA = `${a.fecha} ${a.horaInicio || '00:00:00'}`
      const dateB = `${b.fecha} ${b.horaInicio || '00:00:00'}`
      cmp = dateA.localeCompare(dateB)
    } else if (sortField.value === 'duracion') {
      cmp = (a.durationSeconds || 0) - (b.durationSeconds || 0)
    }
    return sortOrder.value === 'asc' ? cmp : -cmp
  })

  return list
})

const isAllSelected = computed(() => {
  return filteredEvents.value.length > 0 && filteredEvents.value.every(e => e.selected)
})

const isIndeterminate = computed(() => {
  const selectedCount = filteredEvents.value.filter(e => e.selected).length
  return selectedCount > 0 && selectedCount < filteredEvents.value.length
})

function toggleSelectAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  filteredEvents.value.forEach(item => {
    item.selected = checked
  })
}

function onTimeChange(event: EventRecordV2) {
  if (event.horaInicio && event.horaFin) {
    const sec = calculateDurationFromTimes(event.horaInicio, event.horaFin)
    event.durationSeconds = sec
    event.durationMinutes = Math.round((sec / 60) * 100) / 100
    event.tiempoServicioAbajo = formatSecondsToHHMMSS(sec)
  }
  onRecordFieldChange(event)
}

function toggleDeclarado(event: EventRecordV2) {
  event.declarado = !event.declarado
  onRecordFieldChange(event)
}

function onRecordFieldChange(event: EventRecordV2) {
  event.updatedAt = new Date().toISOString()
  emit('update-events', props.events)
}

function cloneRecord(record: EventRecordV2) {
  const clone: EventRecordV2 = {
    ...record,
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    selected: false,
    createdAt: new Date().toISOString()
  }
  const index = props.events.findIndex(e => e.id === record.id)
  const updated = [...props.events]
  if (index >= 0) {
    updated.splice(index + 1, 0, clone)
  } else {
    updated.push(clone)
  }
  emit('update-events', updated)
}

function deleteRecord(id: string) {
  const updated = props.events.filter(e => e.id !== id)
  emit('update-events', updated)
}

function indicatorSelectClass(ind: StandardIndicator) {
  if (ind === 'II-FALLAS') {
    return 'bg-rose-50 border-rose-200 text-rose-700'
  }
  if (ind === 'II-PROVEEDOR') {
    return 'bg-amber-50 border-amber-200 text-amber-800'
  }
  return 'bg-blue-50 border-blue-200 text-blue-700'
}
</script>
