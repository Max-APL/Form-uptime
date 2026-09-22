<template>
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-6 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-6 opacity-0"
  >
    <div
      v-if="selectedCount > 0"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-slate-300 bg-white/95 backdrop-blur-md px-4 py-2.5 text-xs shadow-xl"
    >
      <div class="flex items-center gap-2 border-r border-slate-200 pr-3">
        <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#004D2C]/10 text-[#004D2C] font-bold">
          {{ selectedCount }}
        </span>
        <span class="font-semibold text-slate-800">filas seleccionadas</span>
      </div>

      <!-- Quick batch actions -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="$emit('batch-set-declarado', true)"
          class="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 font-semibold text-emerald-700 hover:bg-emerald-100 transition"
        >
          <CheckCircle2 class="h-3.5 w-3.5" />
          <span>Declarar</span>
        </button>

        <button
          type="button"
          @click="$emit('batch-set-declarado', false)"
          class="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 transition"
        >
          <span>No Declarar</span>
        </button>

        <div class="h-4 w-[1px] bg-slate-200"></div>

        <button
          type="button"
          @click="$emit('batch-set-revision', true)"
          class="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 font-semibold text-blue-700 hover:bg-blue-100 transition"
        >
          <CheckCircle2 class="h-3.5 w-3.5" />
          <span>Revisado</span>
        </button>

        <button
          type="button"
          @click="$emit('batch-set-revision', false)"
          class="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 transition"
        >
          <span>Pendiente</span>
        </button>

        <!-- Change Indicator -->
        <select
          @change="onIndicatorSelect"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-700 focus:border-[#004D2C] focus:outline-none cursor-pointer"
        >
          <option value="" disabled selected>Asignar Indicador...</option>
          <option
            v-for="ind in (availableIndicators && availableIndicators.length ? availableIndicators : defaultIndicatorList)"
            :key="ind"
            :value="ind"
          >
            Asignar {{ ind }}
          </option>
        </select>

        <!-- Delete selected -->
        <button
          type="button"
          @click="$emit('batch-delete')"
          class="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 font-semibold text-rose-700 hover:bg-rose-100 transition"
        >
          <Trash2 class="h-3.5 w-3.5" />
          <span>Eliminar</span>
        </button>
      </div>

      <!-- Clear selection -->
      <button
        type="button"
        @click="$emit('clear-selection')"
        class="border-l border-slate-200 pl-3 text-slate-400 hover:text-slate-700 transition"
      >
        ✕
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { CheckCircle2, Trash2 } from 'lucide-vue-next'
import type { StandardIndicator } from '../types/uptime'

const defaultIndicatorList = [
  'II-FALLAS',
  'II-PROVEEDOR',
  'II-PROGRAMADA'
]

defineProps<{
  selectedCount: number
  availableIndicators?: string[]
}>()

const emit = defineEmits<{
  (e: 'batch-set-declarado', val: boolean): void
  (e: 'batch-set-revision', val: boolean): void
  (e: 'batch-set-indicador', ind: StandardIndicator): void
  (e: 'batch-delete'): void
  (e: 'clear-selection'): void
}>()

function onIndicatorSelect(e: Event) {
  const select = e.target as HTMLSelectElement
  const val = select.value as StandardIndicator
  if (val) {
    emit('batch-set-indicador', val)
    select.value = ''
  }
}
</script>
