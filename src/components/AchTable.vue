<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
    
    <!-- Table Toolbar: Action Button, Search & Filters (Exact same unified layout as Transacciones y Redes) -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 p-3">
      
      <!-- Left: Primary Add Row Button + Search & Filters -->
      <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
        
        <!-- Primary "Agregar Registro" button with corporate gold styling & single + icon -->
        <button
          type="button"
          @click="addNewRow"
          class="flex items-center gap-1.5 rounded-lg bg-[#D39F28] px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#BE8D1F] transition border border-[#B3831D] cursor-pointer shrink-0"
          title="Inserta una fila vacía para registrar una transacción o resolución ACH"
        >
          <Plus class="h-3.5 w-3.5 text-slate-950" />
          <span>Agregar Registro</span>
        </button>

        <div class="h-4 w-[1px] bg-slate-300 mx-1 hidden sm:block"></div>

        <!-- Search box -->
        <div class="relative flex-1 min-w-[170px] max-w-xs">
          <Search class="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por tipo, fecha..."
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

        <!-- Filter by Tipo ACH -->
        <select
          v-model="filterTipo"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#004D2C] focus:outline-none cursor-pointer"
        >
          <option value="ALL">Todos los Tipos ACH</option>
          <option v-for="t in availableTipos" :key="t" :value="t">{{ t }}</option>
        </select>

        <!-- Filter by Revisión -->
        <select
          v-model="filterRevision"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#004D2C] focus:outline-none cursor-pointer"
        >
          <option value="ALL">Todas las Revisiones</option>
          <option value="1">Revisado: SÍ</option>
          <option value="0">Revisado: NO</option>
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

      <!-- Right: Batch Actions, Counter & Density toggle -->
      <div class="flex items-center gap-2.5">
        <!-- Batch Mark Reviewed (SÍ) -->
        <button
          v-if="selectedCount > 0"
          type="button"
          @click="batchToggleRevision(1)"
          class="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100 transition cursor-pointer shadow-2xs"
          title="Marcar filas seleccionadas con Revisión: SÍ"
        >
          <Check class="h-3.5 w-3.5 text-blue-600" />
          <span>Marcar SÍ ({{ selectedCount }})</span>
        </button>

        <!-- Batch Mark Pending (NO) -->
        <button
          v-if="selectedCount > 0"
          type="button"
          @click="batchToggleRevision(0)"
          class="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer shadow-2xs"
          title="Marcar filas seleccionadas con Revisión: NO"
        >
          <span>Marcar NO ({{ selectedCount }})</span>
        </button>

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
        <!-- Table Header (Two-tier visual grouping for ACH vs Banco Central MLD) -->
        <thead class="sticky top-0 z-20 bg-slate-100 text-slate-700 border-b border-slate-300 shadow-2xs">
          <!-- Tier 1 Grouping Header: Perfect 1:1 Column Alignment -->
          <tr class="bg-slate-200/90 text-[10px] uppercase font-bold tracking-wider text-slate-600 border-b border-slate-300">
            <th colspan="3" class="px-3 py-1 text-left bg-slate-200/80">Datos de Registro</th>
            <th colspan="3" class="px-3 py-1 text-center bg-emerald-100/70 text-emerald-900 border-x border-emerald-200">
              Transacciones ACH Estándar
            </th>
            <th colspan="3" class="px-3 py-1 text-center bg-blue-100/70 text-blue-900 border-r border-blue-200">
              Banco Central de Bolivia (Exclusivo MLD)
            </th>
            <th colspan="2" class="px-3 py-1 text-center bg-amber-100/60 text-amber-900">Control</th>
          </tr>
          <!-- Tier 2 Columns Header -->
          <tr class="bg-slate-100">
            <!-- Select All Checkbox -->
            <th class="w-9 px-3 py-2 text-center">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleSelectAll"
                class="rounded border-slate-300 text-[#004D2C] focus:ring-[#004D2C] cursor-pointer"
              />
            </th>

            <!-- N° Column -->
            <th class="w-12 px-2 py-2 text-center font-bold text-slate-600">N°</th>

            <!-- Fecha Column -->
            <th class="w-28 px-3 py-2 font-bold text-slate-800">Fecha</th>

            <!-- Tipo ACH Column -->
            <th class="w-56 min-w-[200px] px-3 py-2 font-bold text-emerald-950 bg-emerald-50/40">
              Tipo ACH
            </th>

            <!-- Cantidad ACH Column -->
            <th class="w-28 px-3 py-2 text-right font-bold text-emerald-950 bg-emerald-50/40 border-r border-slate-200">
              Cantidad ACH
            </th>

            <!-- Monto ACH Column -->
            <th class="w-36 px-3 py-2 text-right font-bold text-emerald-950 bg-emerald-50/40 border-r border-slate-200">
              Monto ACH (Bs.)
            </th>

            <!-- Tipo MLD Column -->
            <th class="w-56 min-w-[200px] px-3 py-2 font-bold text-blue-950 bg-blue-50/40">
              Tipo MLD (BCB)
            </th>

            <!-- Cantidad MLD Column -->
            <th class="w-28 px-3 py-2 text-right font-bold text-blue-950 bg-blue-50/40 border-r border-slate-200">
              Cant. MLD
            </th>

            <!-- Monto MLD Column -->
            <th class="w-36 px-3 py-2 text-right font-bold text-blue-950 bg-blue-50/40 border-r border-slate-200">
              Monto MLD (Bs.)
            </th>

            <!-- Revisión Column -->
            <th class="w-28 px-3 py-2 text-center font-bold text-slate-800">
              Revisión
            </th>

            <!-- Actions Column -->
            <th class="w-16 px-2 py-2 text-center font-bold text-slate-600">Acción</th>
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

            <!-- TIPO ACH (Desplegable + Personalizar) -->
            <td class="px-2 py-1 bg-emerald-50/[0.15]">
              <div class="relative flex items-center gap-0.5 w-full group/tipo">
                <!-- Inline Custom Input Mode for Tipo ACH -->
                <div v-if="editingCustomTipoRowId === row.id" class="flex items-center gap-1 w-full">
                  <input
                    v-model="customTipoInput"
                    @keydown.enter.prevent="confirmCustomTipo(row)"
                    @keydown.esc="cancelCustomTipo"
                    placeholder="Ej: REVERSA INTERBANCARIA"
                    class="w-full rounded border border-[#004D2C] bg-white px-1.5 py-0.5 text-xs font-bold uppercase text-slate-900 focus:outline-none shadow-2xs"
                    autofocus
                  />
                  <button
                    type="button"
                    @click="confirmCustomTipo(row)"
                    class="rounded p-1 bg-[#004D2C] text-white hover:bg-[#003B22] transition shrink-0 cursor-pointer"
                    title="Guardar tipo ACH"
                  >
                    <Check class="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    @click="cancelCustomTipo"
                    class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition shrink-0 cursor-pointer"
                    title="Cancelar"
                  >
                    ✕
                  </button>
                </div>

                <!-- Select Mode for Tipo ACH -->
                <div v-else class="flex items-center gap-0.5 w-full">
                  <select
                    :value="row.tipo"
                    @change="handleTipoSelect(row, $event)"
                    class="w-full rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-800 focus:border-[#004D2C] focus:outline-none cursor-pointer truncate shadow-2xs transition"
                    title="Seleccionar tipo de transacción o resolución ACH"
                  >
                    <option
                      v-for="t in availableTipos"
                      :key="t"
                      :value="t"
                    >
                      {{ t }}
                    </option>
                    <option disabled>──────────</option>
                    <option value="__CUSTOM_NEW__" class="text-[#004D2C] font-semibold">
                      ✏️ + Personalizar nuevo tipo...
                    </option>
                  </select>

                  <!-- Direct Pencil Button on Hover to write custom type -->
                  <button
                    type="button"
                    @click="startCustomTipo(row)"
                    class="opacity-0 group-hover/tipo:opacity-100 p-0.5 rounded text-slate-400 hover:text-[#004D2C] hover:bg-slate-100 transition cursor-pointer shrink-0"
                    title="Escribir tipo ACH personalizado"
                  >
                    <Edit3 class="h-3 w-3" />
                  </button>
                </div>
              </div>
            </td>

            <!-- CANTIDAD ACH (editable integer) -->
            <td class="px-2 py-1 text-right bg-emerald-50/[0.15]">
              <input
                :value="row.cantidad"
                @change="updateCantidad(row, ($event.target as HTMLInputElement).value)"
                type="number"
                min="0"
                step="1"
                class="w-full text-right rounded border border-transparent hover:border-slate-300 focus:border-[#004D2C] bg-transparent px-1.5 py-0.5 font-mono text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
              />
            </td>

            <!-- MONTO ACH (editable decimal Bs.) -->
            <td class="px-2 py-1 text-right bg-emerald-50/[0.15] border-r border-slate-200">
              <input
                :value="row.monto"
                @change="updateMonto(row, ($event.target as HTMLInputElement).value)"
                type="number"
                min="0"
                step="0.01"
                class="w-full text-right rounded border border-transparent hover:border-slate-300 focus:border-[#004D2C] bg-transparent px-1.5 py-0.5 font-mono text-xs font-bold text-emerald-700 focus:bg-white focus:outline-none"
              />
            </td>

            <!-- TIPO MLD (Desplegable + Personalizar exclusivo Banco Central) -->
            <td class="px-2 py-1 bg-blue-50/[0.15]">
              <div class="relative flex items-center gap-0.5 w-full group/mld">
                <!-- Inline Custom Input Mode for Tipo MLD -->
                <div v-if="editingCustomMldRowId === row.id" class="flex items-center gap-1 w-full">
                  <input
                    v-model="customMldInput"
                    @keydown.enter.prevent="confirmCustomMld(row)"
                    @keydown.esc="cancelCustomMld"
                    placeholder="Ej: COMPENSACION ESPECIAL MLD"
                    class="w-full rounded border border-blue-600 bg-white px-1.5 py-0.5 text-xs font-bold uppercase text-blue-900 focus:outline-none shadow-2xs"
                    autofocus
                  />
                  <button
                    type="button"
                    @click="confirmCustomMld(row)"
                    class="rounded p-1 bg-blue-700 text-white hover:bg-blue-800 transition shrink-0 cursor-pointer"
                    title="Guardar tipo MLD"
                  >
                    <Check class="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    @click="cancelCustomMld"
                    class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition shrink-0 cursor-pointer"
                    title="Cancelar"
                  >
                    ✕
                  </button>
                </div>

                <!-- Select Mode for Tipo MLD -->
                <div v-else class="flex items-center gap-0.5 w-full">
                  <select
                    :value="row.tipoMld || ''"
                    @change="handleMldSelect(row, $event)"
                    class="w-full rounded-md border border-blue-200 bg-white px-1.5 py-0.5 text-xs font-semibold text-blue-900 focus:border-blue-600 focus:outline-none cursor-pointer truncate shadow-2xs transition"
                    title="Seleccionar tipo Banco Central MLD"
                  >
                    <option value="">(Sin MLD / No aplica)</option>
                    <option
                      v-for="m in availableMldTipos"
                      :key="m"
                      :value="m"
                    >
                      {{ m }}
                    </option>
                    <option disabled>──────────</option>
                    <option value="__CUSTOM_NEW__" class="text-blue-700 font-semibold">
                      ✏️ + Personalizar nuevo MLD...
                    </option>
                  </select>

                  <!-- Direct Pencil Button on Hover to write custom MLD type -->
                  <button
                    type="button"
                    @click="startCustomMld(row)"
                    class="opacity-0 group-hover/mld:opacity-100 p-0.5 rounded text-slate-400 hover:text-blue-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                    title="Escribir tipo MLD personalizado"
                  >
                    <Edit3 class="h-3 w-3" />
                  </button>
                </div>
              </div>
            </td>

            <!-- CANTIDAD MLD (editable integer) -->
            <td class="px-2 py-1 text-right bg-blue-50/[0.15]">
              <input
                :value="row.cantidadMld || 0"
                @change="updateCantidadMld(row, ($event.target as HTMLInputElement).value)"
                type="number"
                min="0"
                step="1"
                class="w-full text-right rounded border border-transparent hover:border-blue-300 focus:border-blue-600 bg-transparent px-1.5 py-0.5 font-mono text-xs font-bold text-blue-900 focus:bg-white focus:outline-none"
              />
            </td>

            <!-- MONTO MLD (editable decimal Bs.) -->
            <td class="px-2 py-1 text-right bg-blue-50/[0.15] border-r border-slate-200">
              <input
                :value="row.montoMld || 0"
                @change="updateMontoMld(row, ($event.target as HTMLInputElement).value)"
                type="number"
                min="0"
                step="0.01"
                class="w-full text-right rounded border border-transparent hover:border-blue-300 focus:border-blue-600 bg-transparent px-1.5 py-0.5 font-mono text-xs font-bold text-blue-900 focus:bg-white focus:outline-none"
              />
            </td>

            <!-- REVISIÓN (0 o 1, SÍ / NO igual que Transacciones) -->
            <td class="px-2 py-1 text-center">
              <button
                type="button"
                @click="toggleRowRevision(row)"
                :class="[
                  'inline-flex items-center gap-1 rounded-full font-bold transition shadow-2xs cursor-pointer',
                  Number(row.revision) === 1
                    ? 'bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100'
                    : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200/70',
                  isCompact ? 'px-2 py-0 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'
                ]"
                title="Clic para alternar estado de Revisión (0 o 1)"
              >
                <Check v-if="Number(row.revision) === 1" class="h-2.5 w-2.5 text-blue-600" />
                <span>{{ Number(row.revision) === 1 ? 'SÍ' : 'NO' }}</span>
              </button>
            </td>

            <!-- Delete action -->
            <td class="px-2 py-1 text-center">
              <button
                type="button"
                @click="deleteRow(row.id)"
                class="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                title="Eliminar este registro"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="filteredRecords.length === 0">
            <td colspan="11" class="p-8 text-center text-slate-400">
              <div class="flex flex-col items-center justify-center gap-2">
                <ArrowLeftRight class="h-8 w-8 text-slate-300" />
                <span class="font-medium text-xs">No hay estadísticas de ACH registradas para este período.</span>
                <span class="text-[11px] text-slate-400">
                  Usa el botón <strong>«Agregar Registro»</strong> o <strong>«Importar»</strong> para cargar filas desde Excel.
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bottom Metrics Summary Bar (integrated in unified card) -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/70 p-3.5">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#004D2C]/10 text-[#004D2C]">
          <BarChart3 class="h-4 w-4" />
        </div>
        <span class="text-xs font-bold text-slate-800">
          Totales ACH & Banco Central ({{ records.length }} registros en total)
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-5 text-xs font-medium">
        <div>
          <span class="text-slate-500">Cant. ACH: </span>
          <strong class="font-mono text-sm font-bold text-slate-800">
            {{ formatQuantity(summaryTotals.cantidadAch) }}
          </strong>
        </div>
        <div>
          <span class="text-slate-500">Monto ACH: </span>
          <strong class="font-mono text-sm font-bold text-emerald-700">
            {{ formatCurrencyBs(summaryTotals.montoAch) }}
          </strong>
        </div>
        <div class="h-4 w-[1px] bg-slate-300 hidden md:block"></div>
        <div>
          <span class="text-slate-500">Cant. MLD (BCB): </span>
          <strong class="font-mono text-sm font-bold text-blue-900">
            {{ formatQuantity(summaryTotals.cantidadMld) }}
          </strong>
        </div>
        <div>
          <span class="text-slate-500">Monto MLD (BCB): </span>
          <strong class="font-mono text-sm font-bold text-blue-900">
            {{ formatCurrencyBs(summaryTotals.montoMld) }}
          </strong>
        </div>
        <div class="h-4 w-[1px] bg-slate-300 hidden md:block"></div>
        <div>
          <span class="text-slate-500">Revisión: </span>
          <span class="rounded bg-blue-100 text-blue-800 px-1.5 py-0.5 text-[10px] font-bold">
            {{ summaryTotals.reviewedCount }} SÍ
          </span>
          <span v-if="summaryTotals.pendingCount > 0" class="ml-1 rounded bg-slate-200 text-slate-700 px-1.5 py-0.5 text-[10px] font-bold">
            {{ summaryTotals.pendingCount }} NO
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AchStatisticRecord } from '../types/achStatistics'
import {
  DEFAULT_ACH_TIPOS,
  DEFAULT_MLD_TIPOS,
  parseAchAmount,
  formatCurrencyBs,
  formatQuantity
} from '../types/achStatistics'
import {
  Search,
  Plus,
  Trash2,
  BarChart3,
  ArrowLeftRight,
  Check,
  Edit3
} from 'lucide-vue-next'

const props = defineProps<{
  records: AchStatisticRecord[]
  referenceDate: string
}>()

const emit = defineEmits<{
  (e: 'update:records', val: AchStatisticRecord[]): void
}>()

const isCompact = ref(false)
const searchQuery = ref('')
const filterTipo = ref('ALL')
const filterRevision = ref('ALL')

// Inline custom editing states
const editingCustomTipoRowId = ref<string | null>(null)
const customTipoInput = ref('')
const editingCustomMldRowId = ref<string | null>(null)
const customMldInput = ref('')

const availableTipos = computed(() => {
  const set = new Set<string>()
  DEFAULT_ACH_TIPOS.forEach(t => {
    const clean = t.replace(/\s+/g, ' ').trim().toUpperCase()
    if (clean) set.add(clean)
  })
  props.records.forEach(r => {
    if (r.tipo) {
      const clean = r.tipo.replace(/\s+/g, ' ').trim().toUpperCase()
      if (clean) set.add(clean)
    }
  })
  return Array.from(set)
})

const availableMldTipos = computed(() => {
  const set = new Set<string>()
  DEFAULT_MLD_TIPOS.forEach(m => {
    const clean = m.replace(/\s+/g, ' ').trim().toUpperCase()
    if (clean) set.add(clean)
  })
  props.records.forEach(r => {
    if (r.tipoMld) {
      const clean = r.tipoMld.replace(/\s+/g, ' ').trim().toUpperCase()
      if (clean) set.add(clean)
    }
  })
  return Array.from(set)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || filterTipo.value !== 'ALL' || filterRevision.value !== 'ALL'
})

function resetFilters() {
  searchQuery.value = ''
  filterTipo.value = 'ALL'
  filterRevision.value = 'ALL'
}

const filteredRecords = computed(() => {
  let list = props.records || []

  if (filterTipo.value !== 'ALL') {
    list = list.filter(r => (r.tipo || '').toUpperCase() === filterTipo.value)
  }

  if (filterRevision.value !== 'ALL') {
    const revNum = Number(filterRevision.value)
    list = list.filter(r => Number(r.revision) === revNum)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(r =>
      (r.tipo && r.tipo.toLowerCase().includes(q)) ||
      (r.tipoMld && r.tipoMld.toLowerCase().includes(q)) ||
      (r.fecha && r.fecha.toLowerCase().includes(q))
    )
  }

  return list
})

// Checkbox selection logic
const selectedCount = computed(() => props.records.filter(r => r.selected).length)

const isAllSelected = computed(() => {
  if (filteredRecords.value.length === 0) return false
  return filteredRecords.value.every(r => r.selected)
})

const isIndeterminate = computed(() => {
  const selectedInFiltered = filteredRecords.value.filter(r => r.selected).length
  return selectedInFiltered > 0 && selectedInFiltered < filteredRecords.value.length
})

function toggleSelectAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  filteredRecords.value.forEach(r => {
    r.selected = checked
  })
}

// Add new row inline
function addNewRow() {
  const newRow: AchStatisticRecord = {
    id: `ach-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    creadoEn: new Date().toISOString(),
    fecha: props.referenceDate,
    tipo: DEFAULT_ACH_TIPOS[0],
    cantidad: 1,
    monto: 0,
    tipoMld: '',
    cantidadMld: 0,
    montoMld: 0,
    revision: 0,
    selected: false
  }

  const updated = [newRow, ...props.records]
  emit('update:records', updated)
}

function deleteRow(id: string) {
  const updated = props.records.filter(r => r.id !== id)
  emit('update:records', updated)
}

function deleteSelectedRows() {
  const updated = props.records.filter(r => !r.selected)
  emit('update:records', updated)
}

function batchToggleRevision(status: 0 | 1) {
  props.records.forEach(r => {
    if (r.selected) {
      r.revision = status
    }
  })
}

function toggleRowRevision(row: AchStatisticRecord) {
  row.revision = Number(row.revision) === 1 ? 0 : 1
}

// Handlers for Tipo ACH
function handleTipoSelect(row: AchStatisticRecord, e: Event) {
  const val = (e.target as HTMLSelectElement).value
  if (val === '__CUSTOM_NEW__') {
    startCustomTipo(row)
  } else {
    row.tipo = val
  }
}

function startCustomTipo(row: AchStatisticRecord) {
  editingCustomTipoRowId.value = row.id
  customTipoInput.value = row.tipo || ''
}

function confirmCustomTipo(row: AchStatisticRecord) {
  const clean = customTipoInput.value.replace(/\s+/g, ' ').trim().toUpperCase()
  if (clean) {
    row.tipo = clean
  }
  editingCustomTipoRowId.value = null
  customTipoInput.value = ''
}

function cancelCustomTipo() {
  editingCustomTipoRowId.value = null
  customTipoInput.value = ''
}

// Handlers for Tipo MLD
function handleMldSelect(row: AchStatisticRecord, e: Event) {
  const val = (e.target as HTMLSelectElement).value
  if (val === '__CUSTOM_NEW__') {
    startCustomMld(row)
  } else {
    row.tipoMld = val
  }
}

function startCustomMld(row: AchStatisticRecord) {
  editingCustomMldRowId.value = row.id
  customMldInput.value = row.tipoMld || ''
}

function confirmCustomMld(row: AchStatisticRecord) {
  const clean = customMldInput.value.replace(/\s+/g, ' ').trim().toUpperCase()
  row.tipoMld = clean
  editingCustomMldRowId.value = null
  customMldInput.value = ''
}

function cancelCustomMld() {
  editingCustomMldRowId.value = null
  customMldInput.value = ''
}

// Input update handlers
function updateCantidad(row: AchStatisticRecord, val: string) {
  row.cantidad = Math.max(0, Math.round(parseAchAmount(val)))
}

function updateMonto(row: AchStatisticRecord, val: string) {
  row.monto = Math.max(0, parseAchAmount(val))
}

function updateCantidadMld(row: AchStatisticRecord, val: string) {
  row.cantidadMld = Math.max(0, Math.round(parseAchAmount(val)))
}

function updateMontoMld(row: AchStatisticRecord, val: string) {
  row.montoMld = Math.max(0, parseAchAmount(val))
}

// Summary totals
const summaryTotals = computed(() => {
  const recs = props.records || []
  const cantidadAch = recs.reduce((sum, r) => sum + (Number(r.cantidad) || 0), 0)
  const montoAch = recs.reduce((sum, r) => sum + (Number(r.monto) || 0), 0)
  const cantidadMld = recs.reduce((sum, r) => sum + (Number(r.cantidadMld) || 0), 0)
  const montoMld = recs.reduce((sum, r) => sum + (Number(r.montoMld) || 0), 0)
  const reviewedCount = recs.filter(r => Number(r.revision) === 1).length
  const pendingCount = recs.length - reviewedCount

  return {
    cantidadAch,
    montoAch,
    cantidadMld,
    montoMld,
    reviewedCount,
    pendingCount
  }
})
</script>
