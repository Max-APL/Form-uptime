<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
    <div class="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
      
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <ClipboardPaste class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Pegar Filas desde Excel</h3>
            <p class="text-xs text-slate-500">Copia celdas en tu Excel con Ctrl+C y pégalas aquí directamente con Ctrl+V</p>
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

      <!-- Instructions & Textarea -->
      <div class="space-y-3 text-xs">
        <p class="text-slate-600">
          El sistema detectará automáticamente las columnas tabuladas o separadas por comas. Si tu copia incluye encabezados, los emparejará de inmediato.
        </p>

        <div class="relative">
          <textarea
            v-model="pasteText"
            @input="handleTextChange"
            rows="6"
            placeholder="Pega aquí el contenido copiado de Excel (Ctrl+V)..."
            class="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
          ></textarea>
        </div>

        <!-- Preview summary -->
        <div v-if="parsedCount > 0" class="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-blue-700 flex items-center gap-1.5">
              <CheckCircle2 class="h-4 w-4" />
              Se detectaron {{ parsedCount }} registro(s) listos para importar.
            </span>
          </div>
          <p class="mt-1 text-[11px] text-slate-600">
            Primer registro detectado: <strong class="text-slate-800">{{ previewFirstRecord }}</strong>
          </p>
        </div>

        <!-- Import Mode Selection -->
        <div class="flex items-center gap-4 pt-1">
          <span class="font-bold text-slate-700">Modo de importación:</span>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              v-model="importMode"
              value="append"
              class="text-blue-600 focus:ring-blue-500"
            />
            <span class="text-slate-700">Añadir al final de la tabla</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              v-model="importMode"
              value="replace"
              class="text-rose-600 focus:ring-rose-500"
            />
            <span class="text-slate-700">Reemplazar toda la tabla</span>
          </label>
        </div>

      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          type="button"
          @click="$emit('close')"
          class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          Cancelar
        </button>

        <button
          type="button"
          @click="applyImport"
          :disabled="parsedCount === 0"
          class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Plus class="h-3.5 w-3.5" />
          <span>{{ importMode === 'replace' ? 'Reemplazar e Importar' : 'Agregar Registros' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ClipboardPaste, CheckCircle2, Plus } from 'lucide-vue-next'
import type { EventRecordV2 } from '../types/uptime'
import { parsePastedTableText } from '../utils/clipboardParser'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'import-records', records: EventRecordV2[], mode: 'append' | 'replace'): void
}>()

const pasteText = ref('')
const importMode = ref<'append' | 'replace'>('append')
const parsedRecords = ref<EventRecordV2[]>([])

function handleTextChange() {
  if (!pasteText.value.trim()) {
    parsedRecords.value = []
    return
  }
  const result = parsePastedTableText(pasteText.value)
  parsedRecords.value = result.records
}

const parsedCount = computed(() => parsedRecords.value.length)

const previewFirstRecord = computed(() => {
  if (!parsedRecords.value.length) return ''
  const r = parsedRecords.value[0]
  return `${r.sistema} | ${r.fecha} ${r.horaInicio}-${r.horaFin} (${r.tiempoServicioAbajo}) | ${r.indicador}`
})

function applyImport() {
  if (parsedRecords.value.length === 0) return
  emit('import-records', parsedRecords.value, importMode.value)
  pasteText.value = ''
  parsedRecords.value = []
  emit('close')
}
</script>
