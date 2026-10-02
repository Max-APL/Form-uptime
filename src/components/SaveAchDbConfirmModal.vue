<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs transition-opacity"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-ach"
    >
      <!-- Header -->
      <div class="flex items-start justify-between border-b border-slate-100 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#004D2C]/10 text-[#004D2C] border border-[#004D2C]/20">
            <ArrowLeftRight class="h-5 w-5" />
          </div>
          <div>
            <h3 id="modal-title-ach" class="text-base font-bold text-slate-900">
              Confirmar Guardado de ACH Estadísticas
            </h3>
            <p class="text-xs text-slate-500">
              Período oficial: <strong class="text-slate-700">{{ periodLabel }}</strong>
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          :disabled="isSaving"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition disabled:opacity-50 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Loading comparison state -->
      <div v-if="isLoadingDb" class="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
        <Loader2 class="h-6 w-6 animate-spin text-[#004D2C]" />
        <span>Comparando con los registros actuales de ACH_ESTADISTICAS en Oracle...</span>
      </div>

      <!-- Content body -->
      <div v-else class="mt-4 space-y-4">
        
        <!-- Summary Stats Grid (Nuevos, Modificados, Sin Cambios, Total) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          
          <!-- Nuevos -->
          <div class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-center">
            <div class="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              Nuevos
            </div>
            <div class="mt-1 text-2xl font-black text-emerald-700 font-mono">
              {{ diffStats.newCount }}
            </div>
            <div class="text-[10px] text-emerald-600">
              A insertar
            </div>
          </div>

          <!-- Modificados -->
          <div class="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-center">
            <div class="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              Modificados
            </div>
            <div class="mt-1 text-2xl font-black text-amber-700 font-mono">
              {{ diffStats.modifiedCount }}
            </div>
            <div class="text-[10px] text-amber-600">
              Con cambios
            </div>
          </div>

          <!-- Sin Cambios -->
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
            <div class="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Sin Cambios
            </div>
            <div class="mt-1 text-2xl font-black text-slate-700 font-mono">
              {{ diffStats.unchangedCount }}
            </div>
            <div class="text-[10px] text-slate-500">
              Idénticos en BD
            </div>
          </div>

          <!-- Total a Guardar -->
          <div class="rounded-xl border border-[#004D2C]/20 bg-[#004D2C]/5 p-3 text-center">
            <div class="text-[11px] font-semibold text-[#004D2C] uppercase tracking-wider">
              Total Filas
            </div>
            <div class="mt-1 text-2xl font-black text-[#003B22] font-mono">
              {{ currentRecords.length }}
            </div>
            <div class="text-[10px] text-[#004D2C]/80">
              En lote
            </div>
          </div>

        </div>

        <!-- Note if some rows from DB were deleted from table -->
        <div
          v-if="diffStats.deletedCount > 0"
          class="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800"
        >
          <AlertCircle class="h-4 w-4 shrink-0 text-rose-600" />
          <span>
            Se detectaron <strong>{{ diffStats.deletedCount }} registro(s)</strong> que estaban en la BD y no están en la tabla actual (se desestimarán).
          </span>
        </div>

        <!-- Details Card -->
        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs space-y-2.5">
          
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Tabla destino:</span>
            <span class="font-mono font-semibold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
              ACH_ESTADISTICAS (Oracle)
            </span>
          </div>

          <!-- Breakdown ACH vs MLD totals -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div class="rounded-lg bg-emerald-50/80 border border-emerald-200 p-2.5 space-y-1">
              <div class="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                Transacciones ACH
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-600">Cantidad Total:</span>
                <strong class="font-mono text-emerald-900">{{ formatQuantity(diffStats.totalCantidadAch) }}</strong>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-600">Monto Total:</span>
                <strong class="font-mono text-emerald-900">{{ formatCurrencyBs(diffStats.totalMontoAch) }}</strong>
              </div>
            </div>

            <div class="rounded-lg bg-blue-50/80 border border-blue-200 p-2.5 space-y-1">
              <div class="text-[10px] font-bold uppercase text-blue-800 tracking-wider">
                Banco Central (MLD)
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-600">Cantidad MLD:</span>
                <strong class="font-mono text-blue-900">{{ formatQuantity(diffStats.totalCantidadMld) }}</strong>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-600">Monto MLD:</span>
                <strong class="font-mono text-blue-900">{{ formatCurrencyBs(diffStats.totalMontoMld) }}</strong>
              </div>
            </div>
          </div>

          <!-- Revision status -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-slate-500">Estado de Revisión:</span>
            <span class="font-medium text-slate-800 text-[11px]">
              <strong class="text-blue-700">{{ diffStats.reviewedCount }}</strong> con SÍ / 
              <strong class="text-slate-600">{{ diffStats.pendingCount }}</strong> con NO
            </span>
          </div>

        </div>

        <!-- Informative Alert -->
        <div class="flex items-start gap-2.5 rounded-lg border border-[#004D2C]/20 bg-[#004D2C]/5 p-3 text-xs text-slate-700">
          <CheckCircle2 class="h-4 w-4 shrink-0 text-[#004D2C] mt-0.5" />
          <p>
            Al confirmar, se sincronizará el lote para <strong>{{ periodLabel }}</strong> en la tabla <strong>ACH_ESTADISTICAS</strong>. Los datos quedarán formalmente registrados en Oracle.
          </p>
        </div>

      </div>

      <!-- Actions -->
      <div class="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          @click="$emit('close')"
          :disabled="isSaving"
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="button"
          @click="$emit('confirm')"
          :disabled="isSaving || currentRecords.length === 0"
          class="flex items-center gap-1.5 rounded-lg bg-[#004D2C] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#003B22] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Database class="h-3.5 w-3.5" :class="{ 'animate-spin': isSaving }" />
          <span>{{ isSaving ? 'Guardando en Oracle...' : 'Confirmar y Guardar' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Database, AlertCircle, CheckCircle2, Loader2, ArrowLeftRight } from 'lucide-vue-next'
import type { AchStatisticRecord } from '../types/achStatistics'
import { formatCurrencyBs, formatQuantity } from '../types/achStatistics'

const props = defineProps<{
  isOpen: boolean
  year: number
  month: number
  monthName: string
  currentRecords: AchStatisticRecord[]
  isSaving: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const isLoadingDb = ref(false)
const existingDbRecords = ref<AchStatisticRecord[]>([])

const periodLabel = computed(() => `${props.monthName} de ${props.year}`)

async function loadExistingFromDb() {
  isLoadingDb.value = true
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 3500)

  try {
    const res = await fetch(`/api/ach-statistics?year=${props.year}&month=${props.month}`, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    if (res.ok) {
      const data = await res.json()
      existingDbRecords.value = Array.isArray(data.records) ? data.records : []
    } else {
      existingDbRecords.value = []
    }
  } catch (err) {
    console.warn('No se pudieron consultar registros ACH de Oracle:', err)
    existingDbRecords.value = []
  } finally {
    clearTimeout(timeoutId)
    isLoadingDb.value = false
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    loadExistingFromDb()
  }
})

// Compute diff stats between current draft and DB
const diffStats = computed(() => {
  const current = props.currentRecords || []
  const db = existingDbRecords.value || []

  let newCount = 0
  let modifiedCount = 0
  let unchangedCount = 0

  const unmatchedDbIndices = new Set(db.map((_, i) => i))

  for (const row of current) {
    let matchIdx = -1

    // 1. Match by idRegistro or id
    if (row.idRegistro) {
      matchIdx = db.findIndex((dbItem, idx) => unmatchedDbIndices.has(idx) && String(dbItem.idRegistro) === String(row.idRegistro))
    }
    if (matchIdx === -1 && row.id && row.id.startsWith('ach_')) {
      matchIdx = db.findIndex((dbItem, idx) => unmatchedDbIndices.has(idx) && String(dbItem.id) === String(row.id))
    }

    // 2. Fallback heuristic: match by fecha, tipo, and tipoMld
    if (matchIdx === -1) {
      const cleanFecha = String(row.fecha || '').trim()
      const cleanTipo = String(row.tipo || '').trim().toUpperCase()
      const cleanTipoMld = String(row.tipoMld || '').trim().toUpperCase()

      for (const idx of unmatchedDbIndices) {
        const dbItem = db[idx]
        const dbFecha = String(dbItem.fecha || '').trim()
        const dbTipo = String(dbItem.tipo || '').trim().toUpperCase()
        const dbTipoMld = String(dbItem.tipoMld || '').trim().toUpperCase()

        if (dbFecha === cleanFecha && dbTipo === cleanTipo && dbTipoMld === cleanTipoMld) {
          matchIdx = idx
          break
        }
      }
    }

    if (matchIdx >= 0) {
      unmatchedDbIndices.delete(matchIdx)
      const matched = db[matchIdx]

      const isModified =
        Number(row.cantidad) !== Number(matched.cantidad) ||
        Number(row.monto) !== Number(matched.monto) ||
        Number(row.cantidadMld) !== Number(matched.cantidadMld) ||
        Number(row.montoMld) !== Number(matched.montoMld) ||
        Number(row.revision) !== Number(matched.revision) ||
        String(row.tipo || '').trim().toUpperCase() !== String(matched.tipo || '').trim().toUpperCase() ||
        String(row.tipoMld || '').trim().toUpperCase() !== String(matched.tipoMld || '').trim().toUpperCase()

      if (isModified) {
        modifiedCount++
      } else {
        unchangedCount++
      }
    } else {
      newCount++
    }
  }

  const deletedCount = unmatchedDbIndices.size

  // Totals
  const totalCantidadAch = current.reduce((sum, r) => sum + (Number(r.cantidad) || 0), 0)
  const totalMontoAch = current.reduce((sum, r) => sum + (Number(r.monto) || 0), 0)
  const totalCantidadMld = current.reduce((sum, r) => sum + (Number(r.cantidadMld) || 0), 0)
  const totalMontoMld = current.reduce((sum, r) => sum + (Number(r.montoMld) || 0), 0)
  const reviewedCount = current.filter(r => Number(r.revision) === 1).length
  const pendingCount = current.length - reviewedCount

  return {
    newCount,
    modifiedCount,
    unchangedCount,
    deletedCount,
    totalCantidadAch,
    totalMontoAch,
    totalCantidadMld,
    totalMontoMld,
    reviewedCount,
    pendingCount
  }
})
</script>
