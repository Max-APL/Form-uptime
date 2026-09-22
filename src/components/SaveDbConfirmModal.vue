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
      aria-labelledby="modal-title"
    >
      <!-- Header -->
      <div class="flex items-start justify-between border-b border-slate-100 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#004D2C]/10 text-[#004D2C] border border-[#004D2C]/20">
            <Database class="h-5 w-5" />
          </div>
          <div>
            <h3 id="modal-title" class="text-base font-bold text-slate-900">
              Confirmar Guardado en la BD
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
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition disabled:opacity-50"
        >
          ✕
        </button>
      </div>

      <!-- Loading comparison state -->
      <div v-if="isLoadingDb" class="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
        <Loader2 class="h-6 w-6 animate-spin text-[#004D2C]" />
        <span>Comparando con los registros actuales de la base de datos...</span>
      </div>

      <!-- Content body -->
      <div v-else class="mt-4 space-y-4">
        
        <!-- Summary Stats Grid (Nuevas, Modificadas, Sin Cambios, Eliminadas) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          
          <!-- Nuevas -->
          <div class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-center">
            <div class="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              Nuevas
            </div>
            <div class="mt-1 text-2xl font-black text-emerald-700 font-mono">
              {{ diffStats.newCount }}
            </div>
            <div class="text-[10px] text-emerald-600">
              A insertar
            </div>
          </div>

          <!-- Modificadas -->
          <div class="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-center">
            <div class="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              Modificadas
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
              Idénticas en BD
            </div>
          </div>

          <!-- Total a Guardar -->
          <div class="rounded-xl border border-[#004D2C]/20 bg-[#004D2C]/5 p-3 text-center">
            <div class="text-[11px] font-semibold text-[#004D2C] uppercase tracking-wider">
              Total a Guardar
            </div>
            <div class="mt-1 text-2xl font-black text-[#003B22] font-mono">
              {{ currentEvents.length }}
            </div>
            <div class="text-[10px] text-[#004D2C]/80">
              Filas finales
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
            Se detectaron <strong>{{ diffStats.deletedCount }} fila(s)</strong> que estaban en la BD y no están en la tabla actual (se desestimarán).
          </span>
        </div>

        <!-- Details Card -->
        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs space-y-2.5">
          
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Tabla destino:</span>
            <span class="font-mono font-semibold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
              EVENTOS_DOWNTIME (Oracle)
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-slate-500">Desglose de estados:</span>
            <span class="font-medium text-slate-700">
              <strong class="text-emerald-700">{{ diffStats.declaredCount }} declarados</strong> | 
              <strong class="text-blue-700">{{ diffStats.revisionCount }} revisados</strong> | 
              <strong class="text-slate-600">{{ diffStats.undeclaredCount }} no declarados</strong>
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-slate-500">Sistemas involucrados ({{ diffStats.systems.length }}):</span>
            <div class="flex flex-wrap gap-1 max-w-[65%] justify-end">
              <span
                v-for="sys in diffStats.systems"
                :key="sys"
                class="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-700"
              >
                {{ sys }}
              </span>
            </div>
          </div>

        </div>

        <!-- Informative Alert -->
        <div class="flex items-start gap-2.5 rounded-lg border border-[#004D2C]/20 bg-[#004D2C]/5 p-3 text-xs text-slate-700">
          <CheckCircle2 class="h-4 w-4 shrink-0 text-[#004D2C] mt-0.5" />
          <p>
            Al confirmar, se sincronizará el lote completo para <strong>{{ periodLabel }}</strong>. Las filas se guardarán directamente en Oracle y quedarán disponibles para reportes y auditoría.
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
          :disabled="isSaving || currentEvents.length === 0"
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
import { Database, AlertCircle, CheckCircle2, Loader2 } from 'lucide-vue-next'
import type { EventRecordV2 } from '../types/uptime'

const props = defineProps<{
  isOpen: boolean
  year: number
  month: number
  monthName: string
  currentEvents: EventRecordV2[]
  isSaving: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const isLoadingDb = ref(false)
const existingDbEvents = ref<any[]>([])

const periodLabel = computed(() => `${props.monthName} de ${props.year}`)

// Compare current events with existing records in Oracle
const diffStats = computed(() => {
  const current = props.currentEvents || []
  const db = existingDbEvents.value || []

  let newCount = 0
  let modifiedCount = 0
  let unchangedCount = 0

  // Track unmatched DB events by index
  const unmatchedDbIndices = new Set(db.map((_, i) => i))

  for (const row of current) {
    let matchIdx = -1

    // 1. Try matching by dbId or id first (exact persistent identity)
    if (row.dbId) {
      matchIdx = db.findIndex((dbItem, idx) => unmatchedDbIndices.has(idx) && String(dbItem.dbId) === String(row.dbId))
    }
    if (matchIdx === -1 && row.id && row.id.startsWith('ora-')) {
      matchIdx = db.findIndex((dbItem, idx) => unmatchedDbIndices.has(idx) && String(dbItem.id) === String(row.id))
    }

    // 2. Fallback heuristic: match by system, date, and start time
    if (matchIdx === -1) {
      const cleanSys = String(row.sistema || '').trim().toUpperCase()
      const cleanFecha = String(row.fecha || '').trim()
      const cleanHIni = String(row.horaInicio || '').trim().slice(0, 5)

      for (const idx of unmatchedDbIndices) {
        const dbItem = db[idx]
        const dbSys = String(dbItem.sistema || '').trim().toUpperCase()
        const dbFecha = String(dbItem.fecha || '').trim()
        const dbHIni = String(dbItem.horaInicio || '').trim().slice(0, 5)

        const sysMatch = (dbSys === cleanSys) || (!cleanSys && dbSys === 'DESCONOCIDO') || (cleanSys === 'DESCONOCIDO' && !dbSys)
        const fechaMatch = (dbFecha === cleanFecha) || !cleanFecha
        const timeMatch = dbHIni === cleanHIni || !cleanHIni

        if (sysMatch && fechaMatch && timeMatch) {
          matchIdx = idx
          break
        }
      }
    }

    if (matchIdx !== -1) {
      unmatchedDbIndices.delete(matchIdx)
      const matched = db[matchIdx]

      // Compare all attributes
      const cleanSysRow = String(row.sistema || '').trim().toUpperCase()
      const cleanSysDb = String(matched.sistema || '').trim().toUpperCase()
      const sysDiffers = (cleanSysRow !== cleanSysDb) && !(cleanSysRow === '' && cleanSysDb === 'DESCONOCIDO')

      const isModified =
        sysDiffers ||
        String(row.indicador || '').trim().toUpperCase() !== String(matched.indicador || '').trim().toUpperCase() ||
        String(row.motivo || '').trim() !== String(matched.motivo || '').trim() ||
        String(row.componente || '').trim() !== String(matched.componente || '').trim() ||
        String(row.responsable || '').trim() !== String(matched.responsable || '').trim() ||
        String(row.solucion || '').trim() !== String(matched.solucion || '').trim() ||
        String(row.origen || '').trim() !== String(matched.origen || '').trim() ||
        String(row.bitacora || '').trim() !== String(matched.bitacora || '').trim() ||
        Boolean(row.declarado) !== Boolean(matched.declarado) ||
        Boolean(row.revision) !== Boolean(matched.revision) ||
        String(row.fecha || '').trim() !== String(matched.fecha || '').trim() ||
        String(row.horaInicio || '').trim().slice(0, 5) !== String(matched.horaInicio || '').trim().slice(0, 5) ||
        String(row.horaFin || '').trim().slice(0, 5) !== String(matched.horaFin || '').trim().slice(0, 5)

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

  // Unique systems
  const systems = Array.from(new Set(current.map(e => e.sistema).filter(Boolean))).sort()

  const declaredCount = current.filter(e => e.declarado).length
  const undeclaredCount = current.length - declaredCount
  const revisionCount = current.filter(e => e.revision).length
  const unrevisedCount = current.length - revisionCount

  return {
    newCount,
    modifiedCount,
    unchangedCount,
    deletedCount,
    systems,
    declaredCount,
    undeclaredCount,
    revisionCount,
    unrevisedCount
  }
})

// Fetch current records from Oracle whenever the modal opens
watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      isLoadingDb.value = true
      try {
        const res = await fetch(`/api/events?year=${props.year}&month=${props.month}`)
        if (res.ok) {
          const data = await res.json()
          existingDbEvents.value = Array.isArray(data.events) ? data.events : []
        } else {
          existingDbEvents.value = []
        }
      } catch (err) {
        console.warn('No se pudieron consultar eventos previos de Oracle:', err)
        existingDbEvents.value = []
      } finally {
        isLoadingDb.value = false
      }
    }
  }
)
</script>
