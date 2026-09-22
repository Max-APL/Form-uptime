<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
    <div class="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
      
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#004D2C]/10 text-[#004D2C] border border-[#004D2C]/20">
            <ClipboardPaste class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Pegar Enlaces de Red desde Excel</h3>
            <p class="text-xs text-slate-500">Copia celdas en tu Excel (Ctrl+C) y pégalas aquí directamente (Ctrl+V)</p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Controls: Default Enlace Type -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Tipo de Enlace por defecto:</label>
          <!-- Custom Enlace Input Mode in Modal -->
          <div v-if="isCustomEnlaceInModal" class="flex items-center gap-1">
            <input
              v-model="customEnlaceModalInput"
              @input="handleCustomModalInputChange"
              placeholder="Ej: ENLACES SATELITALES"
              class="w-full rounded-lg border border-[#004D2C] bg-white px-2.5 py-1.5 text-xs font-bold uppercase text-slate-900 focus:outline-none shadow-2xs"
              autofocus
            />
            <button
              type="button"
              @click="cancelCustomModalEnlace"
              class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              title="Volver al selector"
            >
              ✕
            </button>
          </div>

          <!-- Select Mode in Modal -->
          <select
            v-else
            :value="selectedEnlace"
            @change="handleModalEnlaceSelect"
            class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#004D2C] focus:outline-none cursor-pointer"
          >
            <option v-for="enl in DEFAULT_ENLACES" :key="enl" :value="enl">
              {{ enl }}
            </option>
            <option disabled>──────────</option>
            <option value="__CUSTOM_NEW__" class="text-[#004D2C] font-semibold">
              ✏️ + Personalizar nuevo enlace...
            </option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Fecha de Referencia:</label>
          <input
            v-model="referenceDate"
            type="date"
            @change="handleTextChange"
            class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#004D2C] focus:outline-none"
          />
        </div>
      </div>

      <!-- Instructions & Textarea -->
      <div class="space-y-3 text-xs">
        <p class="text-slate-600">
          El sistema detecta automáticamente columnas copiadas de Excel (e.g. <em>Departamento, Proveedor / Agencia / Nombre, Uptime Mensual %, Uptime Anual %</em>).
        </p>

        <div class="relative">
          <textarea
            v-model="pasteText"
            @input="handleTextChange"
            rows="6"
            placeholder="Pega aquí el contenido copiado de Excel (Ctrl+V)..."
            class="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#004D2C] focus:outline-none"
          ></textarea>
        </div>

        <!-- Preview summary -->
        <div v-if="parsedCount > 0" class="rounded-xl border border-[#004D2C]/20 bg-[#004D2C]/5 p-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-[#004D2C] flex items-center gap-1.5">
              <CheckCircle2 class="h-4 w-4" />
              Se detectaron {{ parsedCount }} enlace(s) listos para importar.
            </span>
          </div>
          <p class="mt-1 text-[11px] text-slate-600">
            Primer registro detectado: <strong class="text-slate-800">{{ previewFirstRecord }}</strong>
          </p>
        </div>

        <!-- Mode selection -->
        <div class="flex items-center gap-4 pt-1">
          <span class="font-semibold text-slate-700">Acción:</span>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              v-model="importMode"
              value="append"
              class="text-[#004D2C] focus:ring-[#004D2C]"
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
          class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
        >
          Cancelar
        </button>

        <button
          type="button"
          @click="applyImport"
          :disabled="parsedCount === 0"
          class="flex items-center gap-1.5 rounded-lg bg-[#004D2C] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#003B22] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <Plus class="h-3.5 w-3.5" />
          <span>{{ importMode === 'replace' ? 'Reemplazar e Importar' : 'Agregar Enlaces' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NetworkEventRecord } from '../types/networkUptime'
import { DEFAULT_ENLACES, formatUptimePercent } from '../types/networkUptime'
import { parsePastedNetworkText } from '../utils/networkClipboardParser'
import { ClipboardPaste, CheckCircle2, Plus } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  defaultReferenceDate?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'import-records', payload: { records: NetworkEventRecord[]; mode: 'append' | 'replace' }): void
}>()

const pasteText = ref('')
const importMode = ref<'append' | 'replace'>('append')
const selectedEnlace = ref<string>(DEFAULT_ENLACES[0])
const referenceDate = ref(props.defaultReferenceDate || new Date().toISOString().slice(0, 10))

const parsedRecords = ref<NetworkEventRecord[]>([])
const isCustomEnlaceInModal = ref(false)
const customEnlaceModalInput = ref('')

function handleModalEnlaceSelect(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  if (val === '__CUSTOM_NEW__') {
    isCustomEnlaceInModal.value = true
    customEnlaceModalInput.value = ''
  } else {
    selectedEnlace.value = val
    handleTextChange()
  }
}

function handleCustomModalInputChange() {
  const clean = customEnlaceModalInput.value.trim().toUpperCase()
  selectedEnlace.value = clean || DEFAULT_ENLACES[0]
  handleTextChange()
}

function cancelCustomModalEnlace() {
  isCustomEnlaceInModal.value = false
  selectedEnlace.value = DEFAULT_ENLACES[0]
  handleTextChange()
}

function handleTextChange() {
  if (!pasteText.value.trim()) {
    parsedRecords.value = []
    return
  }
  const { records } = parsePastedNetworkText(pasteText.value, selectedEnlace.value, referenceDate.value)
  parsedRecords.value = records
}

const parsedCount = computed(() => parsedRecords.value.length)

const previewFirstRecord = computed(() => {
  if (parsedRecords.value.length === 0) return ''
  const first = parsedRecords.value[0]
  return `${first.departamento} | ${first.nombre} (${first.enlace}) - Mensual: ${formatUptimePercent(first.uptimeMensual)}, Anual: ${formatUptimePercent(first.uptimeAnual)}`
})

function applyImport() {
  if (parsedRecords.value.length === 0) return
  emit('import-records', {
    records: parsedRecords.value,
    mode: importMode.value
  })
  pasteText.value = ''
  parsedRecords.value = []
  emit('close')
}
</script>
