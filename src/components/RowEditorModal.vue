<template>
  <div v-if="isOpen && localRecord" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
    <div class="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <FileText class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {{ isNew ? 'Nuevo Incidente' : 'Editar Incidente' }}
            </h3>
            <p class="text-[11px] text-slate-500">
              {{ isNew ? 'Completa los campos principales para registrar el incidente en la tabla' : 'Modifica los datos del registro y guarda los cambios' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          ✕
        </button>
      </div>

      <!-- Form Body organized into 3 clear, clean sections -->
      <form @submit.prevent="handleSave" class="space-y-4 text-xs">
        
        <!-- SECTION 1: Tiempo y Sistema -->
        <div class="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-500">1. Sistema y Período</span>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Sistema *</label>
              <input
                v-model="localRecord.sistema"
                list="modal-systems-datalist"
                required
                placeholder="Ej: CORE T24"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
              <datalist id="modal-systems-datalist">
                <option v-for="sys in availableSystems" :key="sys" :value="sys" />
              </datalist>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Componente [Opcional]</label>
              <input
                v-model="localRecord.componente"
                placeholder="Ej: Base de Datos, API Gateway..."
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Fecha *</label>
              <input
                v-model="localRecord.fecha"
                type="date"
                required
                class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Hora Inicio *</label>
              <input
                v-model="localRecord.horaInicio"
                type="time"
                step="1"
                required
                @input="recomputeDuration"
                class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Hora Fin *</label>
              <input
                v-model="localRecord.horaFin"
                type="time"
                step="1"
                required
                @input="recomputeDuration"
                class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          <!-- Auto calculated duration info -->
          <div class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
            <span>Duración calculada automáticamente:</span>
            <strong class="font-mono text-slate-900 text-sm">{{ localRecord.tiempoServicioAbajo }} ({{ localRecord.durationMinutes }} min)</strong>
          </div>
        </div>

        <!-- SECTION 2: Clasificación -->
        <div class="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-500">2. Clasificación y Responsable</span>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Indicador *</label>
              <select
                v-model="localRecord.indicador"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
              >
                <option value="II-FALLAS">II-FALLAS (Incidente no programado)</option>
                <option value="II-PROVEEDOR">II-PROVEEDOR (Causa externa/proveedor)</option>
                <option value="II-PROGRAMADA">II-PROGRAMADA (Ventana de mantenimiento)</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Responsable</label>
              <input
                v-model="localRecord.responsable"
                placeholder="Ej: Infraestructura, DBA, Canales..."
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Origen</label>
              <input
                v-model="localRecord.origen"
                placeholder="Ej: Monitoreo Zabbix, Dynatrace..."
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div class="flex flex-col justify-end">
              <label class="block font-semibold text-slate-700 mb-1">Estado de Declaración</label>
              <label class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  v-model="localRecord.declarado"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="font-semibold" :class="localRecord.declarado ? 'text-emerald-700' : 'text-slate-500'">
                  {{ localRecord.declarado ? 'Declarado Oficialmente (SÍ)' : 'No declarado (NO)' }}
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- SECTION 3: Detalle de Causa y Solución -->
        <div class="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-500">3. Bitácora, Motivo y Solución</span>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Código de Bitácora / Ticket</label>
            <input
              v-model="localRecord.bitacora"
              placeholder="Ej: INC-2026-0041"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Motivo / Causa Raíz</label>
            <textarea
              v-model="localRecord.motivo"
              rows="2"
              placeholder="Descripción de la causa o síntomas observados..."
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Solución Aplicada</label>
            <textarea
              v-model="localRecord.solucion"
              rows="2"
              placeholder="Acción correctiva o procedimiento ejecutado para resolver la caída..."
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
            ></textarea>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between border-t border-slate-100 pt-3">
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition"
          >
            <Check class="h-3.5 w-3.5" />
            <span>{{ isNew ? 'Agregar a la Tabla' : 'Guardar Cambios' }}</span>
          </button>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { FileText, Check } from 'lucide-vue-next'
import type { EventRecordV2 } from '../types/uptime'
import { calculateDurationFromTimes, formatSecondsToHHMMSS } from '../utils/calculator'

const props = defineProps<{
  isOpen: boolean
  record: EventRecordV2 | null
  isNew?: boolean
  availableSystems?: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', record: EventRecordV2): void
}>()

const localRecord = ref<EventRecordV2 | null>(null)

watch(() => props.record, (newVal) => {
  if (newVal) {
    localRecord.value = JSON.parse(JSON.stringify(newVal))
  } else {
    localRecord.value = null
  }
}, { immediate: true })

function recomputeDuration() {
  if (localRecord.value && localRecord.value.horaInicio && localRecord.value.horaFin) {
    const sec = calculateDurationFromTimes(localRecord.value.horaInicio, localRecord.value.horaFin)
    localRecord.value.durationSeconds = sec
    localRecord.value.durationMinutes = Math.round((sec / 60) * 100) / 100
    localRecord.value.tiempoServicioAbajo = formatSecondsToHHMMSS(sec)
  }
}

function handleSave() {
  if (!localRecord.value || !localRecord.value.sistema.trim()) return
  recomputeDuration()
  emit('save', localRecord.value)
  emit('close')
}
</script>
