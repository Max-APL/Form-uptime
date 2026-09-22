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
      aria-labelledby="modal-title-network"
    >
      <!-- Header -->
      <div class="flex items-start justify-between border-b border-slate-100 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#004D2C]/10 text-[#004D2C] border border-[#004D2C]/20">
            <Network class="h-5 w-5" />
          </div>
          <div>
            <h3 id="modal-title-network" class="text-base font-bold text-slate-900">
              Confirmar Guardado de Enlaces de Red
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
        <span>Comparando con los registros actuales de EVENTOS_REDES en Oracle...</span>
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
              Total Enlaces
            </div>
            <div class="mt-1 text-2xl font-black text-[#003B22] font-mono">
              {{ currentRecords.length }}
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
            Se detectaron <strong>{{ diffStats.deletedCount }} enlace(s)</strong> que estaban en la BD y no están en la tabla actual (se desestimarán).
          </span>
        </div>

        <!-- Details Card -->
        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs space-y-2.5">
          
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Tabla destino:</span>
            <span class="font-mono font-semibold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
              EVENTOS_REDES (Oracle)
            </span>
          </div>

          <!-- Breakdown by Enlace Type -->
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Desglose por tipo de enlace:</span>
            <div class="flex items-center gap-1.5 font-medium text-slate-700 text-[11px]">
              <span class="rounded bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2">
                WAN: <strong>{{ diffStats.wanCount }}</strong>
              </span>
              <span class="rounded bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2">
                Agencias: <strong>{{ diffStats.agenciasCount }}</strong>
              </span>
              <span class="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2">
                ATMs: <strong>{{ diffStats.atmsCount }}</strong>
              </span>
            </div>
          </div>

          <!-- Average Uptimes -->
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Disponibilidad Promedio:</span>
            <span class="font-medium text-slate-800 font-mono text-[11px]">
              Mes: <strong class="text-emerald-700">{{ diffStats.avgMensual }}%</strong> | 
              Anual: <strong class="text-slate-700">{{ diffStats.avgAnual }}%</strong>
            </span>
          </div>

        </div>

        <!-- Informative Alert -->
        <div class="flex items-start gap-2.5 rounded-lg border border-[#004D2C]/20 bg-[#004D2C]/5 p-3 text-xs text-slate-700">
          <CheckCircle2 class="h-4 w-4 shrink-0 text-[#004D2C] mt-0.5" />
          <p>
            Al confirmar, se sincronizará el lote completo para <strong>{{ periodLabel }}</strong> en la tabla <strong>EVENTOS_REDES</strong>. Los datos quedarán formalmente registrados para el informe mensual.
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
import { Database, AlertCircle, CheckCircle2, Loader2, Network } from 'lucide-vue-next'
import type { NetworkEventRecord } from '../types/networkUptime'

const props = defineProps<{
  isOpen: boolean
  year: number
  month: number
  monthName: string
  currentRecords: NetworkEventRecord[]
  isSaving: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const isLoadingDb = ref(false)
const existingDbRecords = ref<NetworkEventRecord[]>([])

const periodLabel = computed(() => `${props.monthName} de ${props.year}`)

async function loadExistingFromDb() {
  isLoadingDb.value = true
  try {
    const res = await fetch(`/api/network-events?year=${props.year}&month=${props.month}`)
    if (res.ok) {
      const data = await res.json()
      existingDbRecords.value = Array.isArray(data.records) ? data.records : []
    } else {
      existingDbRecords.value = []
    }
  } catch (err) {
    console.warn('No se pudieron consultar enlaces de Oracle:', err)
    existingDbRecords.value = []
  } finally {
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

    // 1. Match by dbId or persistent id
    if (row.dbId) {
      matchIdx = db.findIndex((dbItem, idx) => unmatchedDbIndices.has(idx) && String(dbItem.dbId) === String(row.dbId))
    }
    if (matchIdx === -1 && row.id && row.id.startsWith('net_')) {
      matchIdx = db.findIndex((dbItem, idx) => unmatchedDbIndices.has(idx) && String(dbItem.id) === String(row.id))
    }

    // 2. Fallback heuristic: match by enlace, departamento, and nombre
    if (matchIdx === -1) {
      const cleanEnlace = String(row.enlace || '').trim().toUpperCase()
      const cleanDepto = String(row.departamento || '').trim().toUpperCase()
      const cleanNombre = String(row.nombre || '').trim().toUpperCase()

      for (const idx of unmatchedDbIndices) {
        const dbItem = db[idx]
        const dbEnlace = String(dbItem.enlace || '').trim().toUpperCase()
        const dbDepto = String(dbItem.departamento || '').trim().toUpperCase()
        const dbNombre = String(dbItem.nombre || '').trim().toUpperCase()

        if (dbEnlace === cleanEnlace && dbDepto === cleanDepto && dbNombre === cleanNombre) {
          matchIdx = idx
          break
        }
      }
    }

    if (matchIdx >= 0) {
      unmatchedDbIndices.delete(matchIdx)
      const matched = db[matchIdx]

      const isModified =
        Number(row.uptimeMensual) !== Number(matched.uptimeMensual) ||
        Number(row.uptimeAnual) !== Number(matched.uptimeAnual) ||
        String(row.nombre || '').trim() !== String(matched.nombre || '').trim() ||
        String(row.departamento || '').trim().toUpperCase() !== String(matched.departamento || '').trim().toUpperCase() ||
        String(row.enlace || '').trim().toUpperCase() !== String(matched.enlace || '').trim().toUpperCase()

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

  // Breakdown by the 3 official enlace types
  const wanCount = current.filter(r => r.enlace?.toUpperCase().includes('WAN')).length
  const agenciasCount = current.filter(r => r.enlace?.toUpperCase().includes('AGENCIA')).length
  const atmsCount = current.filter(r => r.enlace?.toUpperCase().includes('ATM')).length

  // Overall averages
  const sumMensual = current.reduce((acc, r) => acc + (Number(r.uptimeMensual) || 0), 0)
  const sumAnual = current.reduce((acc, r) => acc + (Number(r.uptimeAnual) || 0), 0)
  const avgMensualNum = current.length > 0 ? sumMensual / current.length : 100
  const avgAnualNum = current.length > 0 ? sumAnual / current.length : 100

  return {
    newCount,
    modifiedCount,
    unchangedCount,
    deletedCount,
    wanCount,
    agenciasCount,
    atmsCount,
    avgMensual: avgMensualNum.toFixed(4),
    avgAnual: avgAnualNum.toFixed(4)
  }
})
</script>
