<template>
  <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <!-- Month & Year Controls -->
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Mes Evaluado</label>
          <select
            :value="month"
            @change="$emit('update:month', parseInt(($event.target as HTMLSelectElement).value))"
            class="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-2xs"
          >
            <option v-for="(name, idx) in monthNames" :key="idx + 1" :value="idx + 1">
              {{ name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Año</label>
          <input
            type="number"
            :value="year"
            @input="$emit('update:year', parseInt(($event.target as HTMLInputElement).value) || 2026)"
            min="2020"
            max="2035"
            class="w-24 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-center shadow-2xs"
          />
        </div>

        <div class="hidden sm:block pl-3 border-l border-slate-200">
          <span class="block text-xs font-semibold text-slate-700 mb-1">Base de Cálculo</span>
          <div class="flex items-center gap-2 text-xs font-mono text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <span class="text-blue-700 font-bold">{{ daysInMonth }} días</span>
            <span>=</span>
            <span class="text-emerald-700 font-bold">{{ totalHours }} hrs</span>
            <span>=</span>
            <span class="text-slate-600 font-bold">{{ totalMinutes.toLocaleString() }} min</span>
          </div>
        </div>
      </div>

      <!-- Systems Catalog Manager Trigger -->
      <div class="flex items-center gap-2">
        <button
          @click="showCatalogModal = true"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-300 transition cursor-pointer"
        >
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Catálogo de Sistemas ({{ systemsCatalog.length }})
        </button>
      </div>
    </div>

    <!-- Catalog Management Modal -->
    <div
      v-if="showCatalogModal"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-900">Catálogo de Sistemas Evaluados</h3>
          <button
            @click="showCatalogModal = false"
            class="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
          >
            ✕
          </button>
        </div>

        <p class="text-xs text-slate-600">
          Cada sistema listado aquí tendrá su propia hoja en el Excel final. Si no registra caídas en el mes cargado, se generará su hoja con 100% de Uptime.
        </p>

        <!-- List of current systems -->
        <div class="max-h-56 overflow-y-auto space-y-1.5 pr-1">
          <div
            v-for="(sys, idx) in systemsCatalog"
            :key="idx"
            class="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
          >
            <span>{{ sys }}</span>
            <button
              @click="removeSystem(idx)"
              class="text-red-500 hover:text-red-700 transition p-1"
              title="Eliminar sistema"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Add new system input -->
        <div class="flex gap-2 pt-2 border-t border-slate-100">
          <input
            v-model="newSystemName"
            @keyup.enter="addSystem"
            placeholder="Nombre de nuevo sistema..."
            class="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            @click="addSystem"
            class="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition"
          >
            Añadir
          </button>
        </div>

        <div class="flex justify-end pt-2">
          <button
            @click="showCatalogModal = false"
            class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-xs font-semibold text-white transition cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  month: number
  year: number
  daysInMonth: number
  totalHours: number
  totalMinutes: number
  systemsCatalog: string[]
}>()

const emit = defineEmits<{
  (e: 'update:month', val: number): void
  (e: 'update:year', val: number): void
  (e: 'update:systemsCatalog', val: string[]): void
}>()

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const showCatalogModal = ref(false)
const newSystemName = ref('')

function addSystem() {
  const name = newSystemName.value.trim().toUpperCase()
  if (name && !props.systemsCatalog.includes(name)) {
    const updated = [...props.systemsCatalog, name]
    emit('update:systemsCatalog', updated)
    newSystemName.value = ''
  }
}

function removeSystem(idx: number) {
  const updated = props.systemsCatalog.filter((_, i) => i !== idx)
  emit('update:systemsCatalog', updated)
}
</script>
