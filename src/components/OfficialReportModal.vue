<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
    
    <!-- Modal Dialog -->
    <div class="flex flex-col w-full max-w-5xl h-[94vh] rounded-2xl border border-slate-200 bg-slate-100 shadow-2xl overflow-hidden">
      
      <!-- Top Action Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3 shadow-xs">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#004D2C]/10 text-[#004D2C] border border-[#004D2C]/20">
            <FileText class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              Informe Oficial de Uptime BMSC
              <span class="rounded bg-[#004D2C]/10 px-2 py-0.5 text-[11px] font-semibold text-[#004D2C]">
                {{ report.monthName }} {{ year }}
              </span>
            </h2>
            <p class="text-xs text-slate-500">Replicación fiel del informe institucional (Páginas 1 a 4 de Sistemas Críticos)</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Toggle Metadata Editor -->
          <button
            type="button"
            @click="showEditorDrawer = !showEditorDrawer"
            :class="showEditorDrawer ? 'bg-slate-200 text-slate-800' : 'bg-white text-slate-700 hover:bg-slate-50'"
            class="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            <Settings2 class="h-3.5 w-3.5" />
            <span>{{ showEditorDrawer ? 'Ocultar Edición' : 'Editar Datos y Redacción' }}</span>
          </button>

          <!-- Print / Save Vector PDF -->
          <button
            type="button"
            @click="handlePrint"
            class="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
            title="Imprimir o guardar como PDF nativo vectorial"
          >
            <Printer class="h-3.5 w-3.5 text-slate-600" />
            <span>Imprimir</span>
          </button>

          <!-- Direct Download PDF -->
          <button
            type="button"
            @click="handleDownloadPdf"
            :disabled="isGeneratingPdf"
            class="flex items-center gap-1.5 rounded-lg border border-[#004D2C]/30 bg-[#004D2C]/10 px-3 py-1.5 text-xs font-bold text-[#004D2C] hover:bg-[#004D2C]/20 disabled:opacity-50 transition cursor-pointer shadow-xs"
            title="Descargar informe en formato PDF"
          >
            <Loader2 v-if="isGeneratingPdf" class="h-3.5 w-3.5 animate-spin" />
            <Download v-else class="h-3.5 w-3.5" />
            <span>{{ isGeneratingPdf ? 'Generando...' : 'PDF' }}</span>
          </button>

          <!-- Direct Download Word (.docx) - PRIMARY -->
          <button
            type="button"
            @click="handleDownloadWord"
            :disabled="isGeneratingWord"
            class="flex items-center gap-1.5 rounded-lg bg-[#2B579A] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#1E3E6E] disabled:opacity-50 transition cursor-pointer shadow-xs"
            title="Descargar Informe Oficial BMSC en formato editable de Microsoft Word (.docx)"
          >
            <Loader2 v-if="isGeneratingWord" class="h-3.5 w-3.5 animate-spin" />
            <FileDown v-else class="h-3.5 w-3.5" />
            <span>{{ isGeneratingWord ? 'Generando Word...' : 'Descargar Word (.docx)' }}</span>
          </button>

          <!-- Close Modal -->
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Collapsible Metadata & Text Editor -->
      <transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-96 opacity-100"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="max-h-96 opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <div v-if="showEditorDrawer" class="border-b border-slate-200 bg-slate-50 p-4 overflow-y-auto">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Código de Informe:</label>
              <input
                v-model="metadata.informeCode"
                type="text"
                class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono focus:border-[#004D2C] focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Fecha de Emisión:</label>
              <input
                v-model="metadata.fechaEmision"
                type="text"
                class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#004D2C] focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Referencia:</label>
              <input
                v-model="metadata.referencia"
                type="text"
                class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#004D2C] focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">A (Destinatario):</label>
              <input
                v-model="metadata.destinatarioNombre"
                type="text"
                class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs focus:border-[#004D2C] focus:outline-none"
                placeholder="Nombre"
              />
              <input
                v-model="metadata.destinatarioCargo"
                type="text"
                class="w-full mt-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 focus:border-[#004D2C] focus:outline-none"
                placeholder="Cargo"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">DE (Remitente):</label>
              <input
                v-model="metadata.remitenteNombre"
                type="text"
                class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs focus:border-[#004D2C] focus:outline-none"
                placeholder="Nombre"
              />
              <input
                v-model="metadata.remitenteCargo"
                type="text"
                class="w-full mt-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 focus:border-[#004D2C] focus:outline-none"
                placeholder="Cargo"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Redacción Introductoria:</label>
              <textarea
                v-model="metadata.redaccion"
                rows="3"
                class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs leading-relaxed focus:border-[#004D2C] focus:outline-none"
              ></textarea>
            </div>
          </div>
          <div class="mt-2 flex justify-end">
            <button
              type="button"
              @click="resetMetadata"
              class="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              ↺ Restaurar valores oficiales por defecto
            </button>
          </div>
        </div>
      </transition>

      <!-- Scrollable Document Preview Area -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/70 flex flex-col items-center gap-8">
        
        <!-- WRAPPER TARGET FOR HTML2CANVAS / PRINT -->
        <div id="bmsc-official-report-content" class="flex flex-col items-center gap-8">
          
          <!-- ================= PAGE 1 ================= -->
          <div class="bmsc-report-page-render report-page relative flex flex-col justify-between bg-white text-slate-900 shadow-xl border border-slate-300 p-8 sm:p-12 w-[794px] min-h-[1123px] box-border">
            
            <div>
              <!-- Header Brand Banner (Official Image) -->
              <div class="flex justify-end mb-4">
                <img
                  src="/bmsc-header-banner.png"
                  alt="Mercantil Santa Cruz"
                  class="h-12 sm:h-14 w-auto object-contain rounded-xl select-none"
                />
              </div>

              <!-- Formal Memorandum Block -->
              <div class="mb-4 text-xs font-sans text-black">
                <!-- Title and Code Centered -->
                <div class="text-center mb-5">
                  <div class="font-bold text-xs tracking-wider">INFORME</div>
                  <div class="font-bold text-xs tracking-wider">{{ metadata.informeCode }}</div>
                </div>

                <!-- A, DE, FECHA, REF aligned in 2 columns -->
                <div class="space-y-2 max-w-2xl text-xs">
                  <div class="flex items-start">
                    <span class="w-20 font-bold text-black">A:</span>
                    <div class="font-bold text-black leading-tight">
                      <div>{{ metadata.destinatarioNombre }}</div>
                      <div>{{ metadata.destinatarioCargo }}</div>
                    </div>
                  </div>

                  <div class="flex items-start">
                    <span class="w-20 font-bold text-black">DE:</span>
                    <div class="font-bold text-black leading-tight">
                      <div>{{ metadata.remitenteNombre }}</div>
                      <div>{{ metadata.remitenteCargo }}</div>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <span class="w-20 font-bold text-black">FECHA:</span>
                    <span class="font-bold text-black">{{ metadata.fechaEmision }}</span>
                  </div>

                  <div class="flex items-start">
                    <span class="w-20 font-bold text-black">REF:</span>
                    <span class="font-bold text-black">{{ metadata.referencia }}</span>
                  </div>
                </div>

                <!-- Solid Horizontal Divider Line -->
                <div class="border-b-2 border-black mt-4 mb-4"></div>
              </div>

              <!-- Introductory Redaction Paragraph -->
              <p class="text-xs leading-relaxed text-black mb-5 text-justify font-sans">
                {{ metadata.redaccion }}
              </p>

              <!-- Tables: CORE T24, FISA, ICBANKING -->
              <div class="space-y-4">
                <SystemReportTable :metrics="getSystemMetrics('CORE T24')" title="T24" innerHeaderName="CORE T24" />
                <SystemReportTable :metrics="getSystemMetrics('FISA')" title="FISA" />
                <SystemReportTable :metrics="getSystemMetrics('ICBANKING')" title="ICBANKING" />
              </div>
            </div>

            <!-- Page 1 Footer -->
            <PageFooter :page-number="1" />
          </div>


          <!-- ================= PAGE 2 ================= -->
          <div class="bmsc-report-page-render report-page relative flex flex-col justify-between bg-white text-slate-900 shadow-xl border border-slate-300 p-8 sm:p-12 w-[794px] min-h-[1123px] box-border">
            
            <div>
              <!-- Header Brand Banner (Official Image) -->
              <div class="flex justify-end mb-5">
                <img
                  src="/bmsc-header-banner.png"
                  alt="Mercantil Santa Cruz"
                  class="h-12 sm:h-14 w-auto object-contain rounded-xl select-none"
                />
              </div>

              <!-- Tables: PORTAL WEB, BANCA MOVIL, ACH -->
              <div class="space-y-5">
                <SystemReportTable :metrics="getSystemMetrics('PORTAL WEB')" title="PORTAL WEB" />
                <SystemReportTable :metrics="getSystemMetrics('BANCA MOVIL')" title="BANCA MOVIL" />
                <SystemReportTable :metrics="getSystemMetrics('ACH')" title="ACH" />
              </div>
            </div>

            <!-- Page 2 Footer -->
            <PageFooter :page-number="2" />
          </div>


          <!-- ================= PAGE 3 ================= -->
          <div class="bmsc-report-page-render report-page relative flex flex-col justify-between bg-white text-slate-900 shadow-xl border border-slate-300 p-8 sm:p-12 w-[794px] min-h-[1123px] box-border">
            
            <div>
              <!-- Header Brand Banner (Official Image) -->
              <div class="flex justify-end mb-5">
                <img
                  src="/bmsc-header-banner.png"
                  alt="Mercantil Santa Cruz"
                  class="h-12 sm:h-14 w-auto object-contain rounded-xl select-none"
                />
              </div>

              <!-- Tables: POSTILION, ONBASE, SWIFT -->
              <div class="space-y-5">
                <SystemReportTable :metrics="getSystemMetrics('POSTILION')" title="POSTILION" />
                <SystemReportTable :metrics="getSystemMetrics('ONBASE')" title="ONBASE" />
                <SystemReportTable :metrics="getSystemMetrics('SWIFT')" title="SWIFT" />
              </div>
            </div>

            <!-- Page 3 Footer -->
            <PageFooter :page-number="3" />
          </div>


          <!-- ================= PAGE 4 ================= -->
          <div class="bmsc-report-page-render report-page relative flex flex-col justify-between bg-white text-slate-900 shadow-xl border border-slate-300 p-8 sm:p-12 w-[794px] min-h-[1123px] box-border">
            
            <div>
              <!-- Header Brand Banner (Official Image) -->
              <div class="flex justify-end mb-5">
                <img
                  src="/bmsc-header-banner.png"
                  alt="Mercantil Santa Cruz"
                  class="h-12 sm:h-14 w-auto object-contain rounded-xl select-none"
                />
              </div>

              <!-- Resumen Final Table Title -->
              <h3 class="text-xs font-bold uppercase tracking-wide text-black mb-2">
                Resumen Final de UPTIME de Sistemas Críticos del BMSC
              </h3>

              <!-- Consolidated Table matching original BMSC format -->
              <div class="mb-8">
                <table class="w-full text-left text-[9px] border-collapse font-sans border border-black">
                  <thead>
                    <tr class="bg-black text-white font-bold">
                      <th class="border border-black px-3 py-1.5 text-center uppercase w-[22%]">SISTEMA</th>
                      <th class="border border-black px-2 py-1.5 text-center uppercase w-[15%]">{{ report.monthName }}</th>
                      <th class="border border-black px-2 py-1.5 text-center uppercase w-[15%]">IIBI-PROVEEDOR</th>
                      <th class="border border-black px-2 py-1.5 text-center uppercase w-[15%]">IIBI-PROGRAMADA</th>
                      <th class="border border-black px-2 py-1.5 text-center uppercase w-[15%]">IIBI-FALLAS</th>
                      <th class="border border-black px-2 py-1.5 text-center uppercase w-[18%]">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="sysName in officialSystemsOrder"
                      :key="sysName"
                      class="hover:bg-slate-50 transition"
                    >
                      <td class="border border-black px-3 py-1 font-bold uppercase text-black text-[9px]">
                        {{ sysName }}
                      </td>
                      <td class="border border-black px-2 py-1 text-center font-sans text-[9px]">
                        {{ getSystemMetrics(sysName).uptimePercentFormatted }}
                      </td>
                      <td class="border border-black px-2 py-1 text-center font-sans text-[9px]">
                        {{ getSystemMetrics(sysName).indicators.proveedor.formattedPercent }}
                      </td>
                      <td class="border border-black px-2 py-1 text-center font-sans text-[9px]">
                        {{ getSystemMetrics(sysName).indicators.programada.formattedPercent }}
                      </td>
                      <td class="border border-black px-2 py-1 text-center font-sans text-[9px]">
                        {{ getSystemMetrics(sysName).indicators.fallas.formattedPercent }}
                      </td>
                      <td class="border border-black px-2 py-1 text-center font-sans font-bold text-[9px]">
                        {{ getSystemMetrics(sysName).downtimePercentFormatted }}
                      </td>
                    </tr>

                    <!-- PROMEDIO FINAL -->
                    <tr class="font-bold text-black border-t-2 border-black">
                      <td class="border border-black px-3 py-1.5 uppercase font-bold text-[9.5px]">
                        PROMEDIO FINAL
                      </td>
                      <td class="border border-black px-2 py-1.5 text-center font-sans font-bold text-[9.5px]">
                        {{ report.summary.averageUptimeFormatted }}
                      </td>
                      <td class="border border-black px-2 py-1.5 text-center font-sans font-bold text-[9.5px]">
                        {{ report.summary.averageProveedorFormatted }}
                      </td>
                      <td class="border border-black px-2 py-1.5 text-center font-sans font-bold text-[9.5px]">
                        {{ report.summary.averageProgramadaFormatted }}
                      </td>
                      <td class="border border-black px-2 py-1.5 text-center font-sans font-bold text-[9.5px]">
                        {{ report.summary.averageFallasFormatted }}
                      </td>
                      <td class="border border-black px-2 py-1.5 text-center font-sans font-bold text-[9.5px]">
                        {{ report.summary.averageTotalDowntimeFormatted }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Sign-off Block -->
              <div class="mt-10 space-y-2 text-xs text-black font-sans">
                <p>Es todo cuanto tengo a bien informar.</p>
                <p class="pt-2">Atentamente,</p>

                <div class="pt-14 max-w-xs">
                  <div class="border-t border-black pt-1 text-xs">
                    <div class="font-bold text-black">{{ metadata.remitenteNombre }}</div>
                    <div class="font-bold text-slate-800">{{ metadata.remitenteCargo }}</div>
                    <div class="text-[11px] text-slate-600">Banco Mercantil Santa Cruz S.A.</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Page 4 Footer -->
            <PageFooter :page-number="4" />
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ConsolidatedReportV2, EventRecordV2, SystemMonthlyMetricsV2 } from '../types/uptime'
import {
  getDefaultOfficialReportMetadata,
  type OfficialReportMetadata
} from '../utils/reportFormatters'
import SystemReportTable from './SystemReportTable.vue'
import PageFooter from './PageFooter.vue'
import { exportOfficialReportToWord } from '../utils/wordExporter'
import {
  FileText,
  FileDown,
  Printer,
  Download,
  Settings2,
  X,
  Loader2
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  report: ConsolidatedReportV2
  events: EventRecordV2[]
  year: number
  month: number
}>()

defineEmits<{
  (e: 'close'): void
}>()

const showEditorDrawer = ref(false)
const isGeneratingPdf = ref(false)
const isGeneratingWord = ref(false)

const metadata = ref<OfficialReportMetadata>(getDefaultOfficialReportMetadata(props.year, props.month))

watch(
  () => [props.year, props.month],
  () => {
    metadata.value = getDefaultOfficialReportMetadata(props.year, props.month)
  }
)

function resetMetadata() {
  metadata.value = getDefaultOfficialReportMetadata(props.year, props.month)
}

const officialSystemsOrder = [
  'CORE T24',
  'FISA',
  'ICBANKING',
  'BANCA MOVIL',
  'PORTAL WEB',
  'POSTILION',
  'ACH',
  'ONBASE',
  'SWIFT'
]

function getSystemMetrics(systemName: string): SystemMonthlyMetricsV2 {
  const normalizedTarget = systemName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const found = props.report.systems.find(s =>
    s.sistema.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedTarget
  )
  if (found) return found

  return {
    sistema: systemName,
    events: [],
    hasEvents: false,
    totalDowntimeSeconds: 0,
    totalDowntimeMinutes: 0,
    totalDowntimeFormatted: '00:00:00',
    downtimePercent: 0,
    downtimePercentFormatted: '0,0000%',
    uptimePercent: 100,
    uptimePercentFormatted: '100,0000%',
    totalPercentFormatted: '100,0000%',
    declaredCount: 0,
    undeclaredCount: 0,
    indicators: {
      proveedor: { label: 'Proveedor', seconds: 0, minutes: 0, formattedTime: '00:00', percent: 0, formattedPercent: '0,0000%' },
      programada: { label: 'Programada', seconds: 0, minutes: 0, formattedTime: '00:00', percent: 0, formattedPercent: '0,0000%' },
      fallas: { label: 'Fallas', seconds: 0, minutes: 0, formattedTime: '00:00', percent: 0, formattedPercent: '0,0000%' }
    }
  }
}

function handlePrint() {
  window.print()
}

async function handleDownloadPdf() {
  if (isGeneratingPdf.value) return
  isGeneratingPdf.value = true

  try {
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    })

    const pageElements = document.querySelectorAll<HTMLElement>('.bmsc-report-page-render')
    for (let i = 0; i < pageElements.length; i++) {
      if (i > 0) {
        doc.addPage('a4', 'portrait')
      }
      const pageEl = pageElements[i]
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
    }

    const cleanCode = metadata.value.informeCode.replace(/[\/\\:]/g, '.')
    const filename = `${cleanCode}_Informe UPTIME_${props.report.monthName}_${props.year}.pdf`
    doc.save(filename)
  } catch (err) {
    console.error('Error al generar PDF institucional:', err)
    alert('Ocurrió un inconveniente al generar el PDF. Puedes usar la opción Imprimir / Guardar como PDF.')
  } finally {
    isGeneratingPdf.value = false
  }
}

async function handleDownloadWord() {
  if (isGeneratingWord.value) return
  isGeneratingWord.value = true

  try {
    await exportOfficialReportToWord(props.report, metadata.value, props.year)
  } catch (err) {
    console.error('Error al generar documento Word:', err)
    alert('Ocurrió un inconveniente al generar el archivo Word (.docx).')
  } finally {
    isGeneratingWord.value = false
  }
}
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #bmsc-official-report-content,
  #bmsc-official-report-content * {
    visibility: visible;
  }
  #bmsc-official-report-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm !important;
    gap: 0 !important;
  }
  .report-page {
    width: 210mm !important;
    min-height: 297mm !important;
    height: 297mm !important;
    page-break-after: always !important;
    break-after: page !important;
    box-shadow: none !important;
    border: none !important;
    padding: 15mm 15mm 15mm 15mm !important;
    margin: 0 !important;
  }
}
</style>
