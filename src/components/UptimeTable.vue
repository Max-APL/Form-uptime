<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
    
    <!-- Table Toolbar: Action Button, Search & Filters -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 p-3">
      
      <!-- Left: Primary Add Row Button + Search & Filters -->
      <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
        
        <!-- Primary "Agregar Fila" button -->
        <button
          type="button"
          @click="$emit('add-row-inline')"
          class="flex items-center gap-1.5 rounded-lg bg-[#D39F28] px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#BE8D1F] transition border border-[#B3831D] cursor-pointer"
          title="Inserta una fila vacía para editar directamente en la tabla"
        >
          <Plus class="h-3.5 w-3.5 text-slate-950" />
          <span>Agregar Fila</span>
        </button>

        <button
          type="button"
          @click="$emit('open-create-modal')"
          class="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          title="Abrir formulario guiado paso a paso"
        >
          <FileText class="h-3.5 w-3.5 text-[#004D2C]" />
          <span class="hidden sm:inline">Formulario Detallado</span>
        </button>

        <div class="h-4 w-[1px] bg-slate-300 mx-1 hidden sm:block"></div>

        <!-- Search box -->
        <div class="relative flex-1 min-w-[170px] max-w-xs">
          <Search class="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            v-model="filters.searchQuery"
            type="text"
            placeholder="Buscar en la tabla..."
            class="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#004D2C] focus:outline-none focus:ring-1 focus:ring-[#004D2C]"
          />
          <button
            v-if="filters.searchQuery"
            type="button"
            @click="filters.searchQuery = ''"
            class="absolute right-2 top-1.5 text-xs text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <!-- Filter Sistema -->
        <select
          v-model="filters.sistema"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#004D2C] focus:outline-none cursor-pointer"
        >
          <option value="">Todos los sistemas</option>
          <option v-for="sys in availableSystems" :key="sys" :value="sys">{{ sys }}</option>
        </select>

        <!-- Filter Indicador -->
        <select
          v-model="filters.indicador"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#004D2C] focus:outline-none cursor-pointer"
        >
          <option value="">Todos los indicadores</option>
          <option v-for="ind in allAvailableIndicators" :key="ind" :value="ind">{{ ind }}</option>
        </select>

        <!-- Filter Declarado -->
        <select
          v-model="filters.declarado"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#004D2C] focus:outline-none cursor-pointer"
        >
          <option value="ALL">Declarado: Todos</option>
          <option value="YES">Solo Declarados (Sí)</option>
          <option value="NO">Solo No Declarados (No)</option>
        </select>

        <!-- Filter Revisión -->
        <select
          v-model="filters.revision"
          class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#004D2C] focus:outline-none cursor-pointer"
        >
          <option value="ALL">Revisión: Todos</option>
          <option value="YES">Solo Revisados (Sí)</option>
          <option value="NO">Solo Pendientes (No)</option>
        </select>

        <button
          v-if="hasActiveFilters"
          type="button"
          @click="resetFilters"
          class="text-xs text-[#004D2C] hover:text-[#003B22] hover:underline px-1 font-medium"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Right: Custom Freeze Panes Popover + Segmented View Toggle (Cómoda / Compacta) & Count info -->
      <div class="flex items-center gap-2.5">
        <span class="text-xs text-slate-500">
          <strong class="text-slate-800">{{ filteredEvents.length }}</strong> filas
        </span>

        <!-- Dynamic Column Freezing Menu (Inmovilizar Columnas Personalizadas) -->
        <div class="relative" ref="freezeMenuRef">
          <button
            type="button"
            @click="isFreezeMenuOpen = !isFreezeMenuOpen"
            :class="[
              'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition cursor-pointer shadow-2xs',
              pinnedKeys.length > 0
                ? 'bg-[#004D2C]/10 border-[#004D2C]/40 text-[#004D2C] font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            ]"
            title="Personalizar qué columnas inmovilizar a la izquierda"
          >
            <Pin class="h-3.5 w-3.5 transition-transform" :class="pinnedKeys.length > 0 ? 'rotate-45 text-[#004D2C]' : 'text-slate-400'" />
            <span class="hidden sm:inline">Fijar Columnas</span>
            <span
              v-if="pinnedKeys.length > 0"
              class="rounded-full bg-[#004D2C] text-white text-[10px] px-1.5 py-0 font-bold ml-0.5"
            >
              {{ pinnedKeys.length }}
            </span>
            <ChevronDown class="h-3 w-3 opacity-60 ml-0.5" />
          </button>

          <!-- Popover Dropdown Panel -->
          <div
            v-if="isFreezeMenuOpen"
            class="absolute right-0 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
          >
            <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span class="font-bold text-slate-800">Inmovilizar Columnas</span>
              <button
                type="button"
                @click="isFreezeMenuOpen = false"
                class="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <p class="text-[11px] text-slate-500 mb-2">
              Elige qué columnas se mantendrán fijas a la izquierda al hacer scroll horizontal:
            </p>

            <!-- Column Checkbox List -->
            <div class="max-h-56 overflow-y-auto space-y-1 pr-1">
              <div class="flex items-center gap-2 text-slate-400 py-1 px-1.5 bg-slate-50 rounded text-[11px]">
                <Check class="h-3 w-3 text-slate-400" />
                <span># y Selección (Siempre fijos)</span>
              </div>
              <label
                v-for="col in ALL_COLUMNS"
                :key="col.key"
                class="flex items-center justify-between gap-2 py-1 px-1.5 rounded hover:bg-slate-50 cursor-pointer transition select-none"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :checked="isPinned(col.key)"
                    @change="togglePinColumn(col.key)"
                    class="rounded border-slate-300 text-[#004D2C] focus:ring-[#004D2C] cursor-pointer h-3.5 w-3.5"
                  />
                  <span :class="isPinned(col.key) ? 'font-bold text-slate-900' : 'text-slate-700'">
                    {{ col.label }}
                  </span>
                </div>
                <button
                  type="button"
                  @click.stop="pinUpToColumn(col.key)"
                  class="text-[10px] text-[#004D2C] hover:underline opacity-0 group-hover:opacity-100 font-medium"
                  title="Fijar desde el inicio hasta esta columna"
                >
                  Hasta aquí
                </button>
                <Pin v-if="isPinned(col.key)" class="h-3 w-3 text-[#004D2C] rotate-45 shrink-0" />
              </label>
            </div>

            <!-- Presets / Quick actions -->
            <div class="mt-3 border-t border-slate-100 pt-2 flex items-center justify-between text-[11px]">
              <button
                type="button"
                @click="resetPinnedToDefault"
                class="text-[#004D2C] hover:underline font-semibold cursor-pointer"
              >
                Por defecto
              </button>
              <button
                type="button"
                @click="pinUpToColumn('indicador')"
                class="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Hasta Indicador
              </button>
              <button
                type="button"
                @click="clearAllPinned"
                class="text-rose-600 hover:underline font-medium cursor-pointer"
              >
                Desfijar todas
              </button>
            </div>
          </div>
        </div>

        <!-- Segmented Control for View Mode -->
        <div class="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
          <button
            type="button"
            @click="isCompact = false"
            :class="[
              'rounded-md px-2.5 py-1 font-medium transition cursor-pointer',
              !isCompact ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            Cómoda
          </button>
          <button
            type="button"
            @click="isCompact = true"
            :class="[
              'rounded-md px-2.5 py-1 font-medium transition cursor-pointer',
              isCompact ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            Compacta
          </button>
        </div>
      </div>

    </div>

    <!-- The Editable Grid Table -->
    <div class="overflow-x-auto max-h-[660px]">
      <table
        class="w-full text-left border-collapse"
        :class="isCompact ? 'text-[11px]' : 'text-xs'"
      >
        <!-- Sticky Table Header -->
        <thead
          class="sticky top-0 z-20 bg-slate-100/95 backdrop-blur-md border-b border-slate-200 text-slate-700 shadow-xs select-none"
        >
          <tr>
            <!-- Col 0: Checkbox All (Always frozen left: 0) -->
            <th
              class="w-[36px] min-w-[36px] max-w-[36px] text-center sticky left-0 z-30 bg-slate-100"
              :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'"
            >
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleSelectAll"
                class="rounded border-slate-300 text-[#004D2C] focus:ring-[#004D2C] cursor-pointer"
                :class="isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'"
              />
            </th>

            <!-- Col 1: # Row Number (Always frozen left: 36px) -->
            <th
              class="w-[32px] min-w-[32px] max-w-[32px] text-center text-slate-400 font-mono sticky left-[36px] z-30 bg-slate-100"
              :class="[
                isCompact ? 'py-1.5 px-1' : 'py-2.5 px-2',
                pinnedKeys.length === 0 ? 'frozen-divider' : ''
              ]"
            >
              #
            </th>
            
            <!-- Dynamic Data Columns (Pinned or Scrollable) -->
            <th
              v-for="col in orderedColumns"
              :key="col.key"
              :style="columnLeftOffsets[col.key] !== null 
                ? { left: `${columnLeftOffsets[col.key]}px`, width: `${col.width}px`, minWidth: `${col.width}px`, maxWidth: `${col.width}px` } 
                : { width: `${col.width}px`, minWidth: `${col.width}px` }"
              :class="[
                'group/th font-semibold select-none transition-colors',
                isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3',
                columnLeftOffsets[col.key] !== null ? 'sticky z-30 bg-slate-100' : '',
                lastPinnedKey === col.key ? 'frozen-divider' : '',
                col.sortable ? 'cursor-pointer hover:text-slate-900' : ''
              ]"
              @click="col.sortable ? toggleSort(col.key as SortField) : undefined"
            >
              <div class="flex items-center justify-between gap-1">
                <div class="flex items-center gap-1 truncate">
                  <span>{{ col.label }}</span>
                  <span v-if="col.required" class="text-rose-600 font-bold ml-0.5">*</span>
                  <ArrowUpDown v-if="col.sortable" class="h-3 w-3 text-slate-400 shrink-0" />
                </div>

                <!-- Column Pin Button directly on header -->
                <button
                  type="button"
                  @click.stop="togglePinColumn(col.key)"
                  :title="isPinned(col.key) ? `Desfijar columna ${col.label}` : `Fijar columna ${col.label} (quedará inmovilizada)`"
                  class="rounded p-0.5 transition cursor-pointer shrink-0"
                  :class="isPinned(col.key) ? 'text-[#004D2C]' : 'opacity-0 group-hover/th:opacity-100 text-slate-400 hover:text-[#004D2C]'"
                >
                  <Pin class="h-3 w-3" :class="isPinned(col.key) ? 'rotate-45 fill-[#004D2C]/20 text-[#004D2C]' : ''" />
                </button>
              </div>
            </th>

            <!-- Col End: Acciones (Sticky Right) -->
            <th class="sticky right-0 z-30 w-20 bg-slate-100 text-center font-semibold border-l border-slate-200" :class="isCompact ? 'py-1.5 px-2' : 'py-2.5 px-3'">
              Acciones
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="(event, idx) in filteredEvents"
            :key="event.id"
            :class="[
              'group transition-colors duration-100',
              event.selected ? 'bg-[#004D2C]/5' : 'bg-white hover:bg-slate-50/80',
              isCompact ? 'h-7' : 'h-10'
            ]"
          >
            <!-- Col 0: Checkbox (Always sticky left: 0) -->
            <td
              class="w-[36px] min-w-[36px] max-w-[36px] text-center sticky left-0 z-10 transition-colors"
              :class="[
                isCompact ? 'py-0.5 px-2' : 'py-2 px-3',
                event.selected ? 'bg-emerald-50' : 'bg-white group-hover:bg-slate-50'
              ]"
            >
              <input
                type="checkbox"
                v-model="event.selected"
                class="rounded border-slate-300 text-[#004D2C] focus:ring-[#004D2C] cursor-pointer"
                :class="isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'"
              />
            </td>

            <!-- Col 1: Row index (Always sticky left: 36px) -->
            <td
              class="w-[32px] min-w-[32px] max-w-[32px] text-center font-mono text-slate-400 text-[10px] sticky left-[36px] z-10 transition-colors"
              :class="[
                isCompact ? 'py-0.5 px-1' : 'py-2 px-2',
                event.selected ? 'bg-emerald-50' : 'bg-white group-hover:bg-slate-50',
                pinnedKeys.length === 0 ? 'frozen-divider' : ''
              ]"
            >
              {{ idx + 1 }}
            </td>

            <!-- Dynamic Data Cells -->
            <td
              v-for="col in orderedColumns"
              :key="col.key"
              :style="columnLeftOffsets[col.key] !== null 
                ? { left: `${columnLeftOffsets[col.key]}px`, width: `${col.width}px`, minWidth: `${col.width}px`, maxWidth: `${col.width}px` } 
                : { width: `${col.width}px`, minWidth: `${col.width}px` }"
              :class="[
                isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2',
                columnLeftOffsets[col.key] !== null ? 'sticky z-10 transition-colors' : '',
                lastPinnedKey === col.key ? 'frozen-divider' : '',
                event.selected 
                  ? 'bg-emerald-50' 
                  : (columnLeftOffsets[col.key] !== null ? 'bg-white group-hover:bg-slate-50' : '')
              ]"
            >
              <!-- Sistema -->
              <input
                v-if="col.key === 'sistema'"
                v-model="event.sistema"
                @change="onRecordFieldChange(event)"
                class="table-cell-input font-semibold text-slate-900"
                :class="isCompact ? 'h-6 text-[11px] py-0 px-1.5' : 'h-8 text-xs py-1 px-2'"
                placeholder="Ej: CORE T24"
              />

              <!-- Componente -->
              <input
                v-else-if="col.key === 'componente'"
                v-model="event.componente"
                @change="onRecordFieldChange(event)"
                class="table-cell-input text-slate-700"
                :class="isCompact ? 'h-6 text-[11px] py-0 px-1.5' : 'h-8 text-xs py-1 px-2'"
                placeholder="Componente..."
              />

              <!-- Fecha -->
              <input
                v-else-if="col.key === 'fecha'"
                v-model="event.fecha"
                type="date"
                @change="onRecordFieldChange(event)"
                class="table-cell-input text-slate-700 font-mono"
                :class="isCompact ? 'h-6 text-[10px] py-0 px-1' : 'h-8 text-[11px] py-1 px-1.5'"
              />

              <!-- Hora Inicio -->
              <input
                v-else-if="col.key === 'horaInicio'"
                v-model="event.horaInicio"
                type="time"
                step="1"
                @change="onTimeChange(event)"
                class="table-cell-input text-slate-700 font-mono"
                :class="isCompact ? 'h-6 text-[10px] py-0 px-1' : 'h-8 text-[11px] py-1 px-1.5'"
              />

              <!-- Hora Fin -->
              <input
                v-else-if="col.key === 'horaFin'"
                v-model="event.horaFin"
                type="time"
                step="1"
                @change="onTimeChange(event)"
                class="table-cell-input text-slate-700 font-mono"
                :class="isCompact ? 'h-6 text-[10px] py-0 px-1' : 'h-8 text-[11px] py-1 px-1.5'"
              />

              <!-- Duración -->
              <div
                v-else-if="col.key === 'duracion'"
                class="flex items-center gap-1 font-mono font-semibold text-slate-800 bg-slate-100 rounded border border-slate-200"
                :class="isCompact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]'"
              >
                <Clock class="h-2.5 w-2.5 text-slate-400 shrink-0" />
                <span class="truncate">{{ event.tiempoServicioAbajo }}</span>
              </div>

              <!-- Indicador -->
              <div v-else-if="col.key === 'indicador'" class="relative flex items-center gap-0.5 w-full group/ind">
                <!-- Inline Custom Input Mode -->
                <div v-if="editingCustomIndicatorRowId === event.id" class="flex items-center gap-1 w-full">
                  <input
                    v-model="customIndicatorInput"
                    @keydown.enter.prevent="confirmCustomIndicator(event)"
                    @keydown.esc="cancelCustomIndicator"
                    placeholder="Ej: IBI-FALLAS"
                    class="table-cell-input font-bold uppercase text-slate-900 w-full"
                    :class="isCompact ? 'h-6 text-[10px] px-1' : 'h-8 text-[11px] px-1.5'"
                    autofocus
                  />
                  <button
                    type="button"
                    @click="confirmCustomIndicator(event)"
                    class="rounded p-1 bg-[#004D2C] text-white hover:bg-[#003B22] transition shrink-0 cursor-pointer"
                    title="Guardar código de indicador"
                  >
                    <Check class="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    @click="cancelCustomIndicator"
                    class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition shrink-0 cursor-pointer"
                    title="Cancelar"
                  >
                    ✕
                  </button>
                </div>

                <!-- Select Mode (with all dynamic options + custom trigger) -->
                <div v-else class="flex items-center gap-0.5 w-full">
                  <select
                    :value="event.indicador"
                    @change="handleIndicatorSelect(event, $event)"
                    :class="[
                      indicatorSelectClass(event.indicador),
                      isCompact ? 'h-6 text-[10px] py-0 px-1.5' : 'h-8 text-[11px] py-1 px-2'
                    ]"
                    class="rounded-md border font-bold focus:outline-none cursor-pointer w-full truncate"
                    title="Seleccionar indicador"
                  >
                    <option
                      v-for="ind in allAvailableIndicators"
                      :key="ind"
                      :value="ind"
                    >
                      {{ ind }}
                    </option>
                    <option disabled>──────────</option>
                    <option value="__CUSTOM_NEW__" class="text-[#004D2C] font-semibold">
                      ✏️ + Escribir personalizado...
                    </option>
                  </select>

                  <!-- Direct Pencil Button on Hover to write custom code -->
                  <button
                    type="button"
                    @click="startCustomIndicator(event)"
                    class="opacity-0 group-hover/ind:opacity-100 p-0.5 rounded text-slate-400 hover:text-[#004D2C] hover:bg-slate-100 transition cursor-pointer shrink-0"
                    title="Escribir indicador personalizado"
                  >
                    <Edit3 class="h-3 w-3" />
                  </button>
                </div>
              </div>

              <!-- Responsable -->
              <input
                v-else-if="col.key === 'responsable'"
                v-model="event.responsable"
                @change="onRecordFieldChange(event)"
                class="table-cell-input text-slate-700"
                :class="isCompact ? 'h-6 text-[11px] py-0 px-1.5' : 'h-8 text-xs py-1 px-2'"
                placeholder="Responsable..."
              />

              <!-- Origen -->
              <input
                v-else-if="col.key === 'origen'"
                v-model="event.origen"
                @change="onRecordFieldChange(event)"
                class="table-cell-input text-slate-700"
                :class="isCompact ? 'h-6 text-[11px] py-0 px-1.5' : 'h-8 text-xs py-1 px-2'"
                placeholder="Origen..."
              />

              <!-- Declarado -->
              <div v-else-if="col.key === 'declarado'" class="text-center">
                <button
                  type="button"
                  @click="toggleDeclarado(event)"
                  :class="[
                    'inline-flex items-center gap-1 rounded-full font-bold transition shadow-2xs cursor-pointer',
                    event.declarado ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-500 border border-slate-200',
                    isCompact ? 'px-2 py-0 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'
                  ]"
                  title="Clic para alternar estado de Declaración (0 o 1)"
                >
                  <Check v-if="event.declarado" class="h-2.5 w-2.5 text-emerald-600" />
                  <span>{{ event.declarado ? 'SÍ' : 'NO' }}</span>
                </button>
              </div>

              <!-- Revisión -->
              <div v-else-if="col.key === 'revision'" class="text-center">
                <button
                  type="button"
                  @click="toggleRevision(event)"
                  :class="[
                    'inline-flex items-center gap-1 rounded-full font-bold transition shadow-2xs cursor-pointer',
                    event.revision ? 'bg-blue-50 text-blue-700 border border-blue-300' : 'bg-slate-100 text-slate-500 border border-slate-200',
                    isCompact ? 'px-2 py-0 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'
                  ]"
                  title="Clic para alternar estado de Revisión (0 o 1)"
                >
                  <Check v-if="event.revision" class="h-2.5 w-2.5 text-blue-600" />
                  <span>{{ event.revision ? 'SÍ' : 'NO' }}</span>
                </button>
              </div>

              <!-- Bitácora (Registro de Hechos / Correos) -->
              <div v-else-if="col.key === 'bitacora'" class="flex items-center gap-1 group/expand">
                <input
                  v-model="event.bitacora"
                  @change="onRecordFieldChange(event)"
                  class="table-cell-input text-slate-700 truncate"
                  :class="isCompact ? 'h-6 text-[11px] py-0 px-1.5' : 'h-8 text-xs py-1 px-2'"
                  placeholder="Registro de hechos, correos, mensajes..."
                  title="Registro cronológico de hechos, correos y mensajes"
                />
                <button
                  type="button"
                  @click="$emit('open-detail-modal', event)"
                  class="opacity-0 group-hover/expand:opacity-100 text-slate-400 hover:text-[#004D2C] p-0.5 transition cursor-pointer"
                  title="Expandir y redactar registro completo de hechos"
                >
                  <Maximize2 class="h-3 w-3" />
                </button>
              </div>

              <!-- Motivo -->
              <div v-else-if="col.key === 'motivo'" class="flex items-center gap-1 group/expand">
                <input
                  v-model="event.motivo"
                  @change="onRecordFieldChange(event)"
                  class="table-cell-input text-slate-700 truncate"
                  :class="isCompact ? 'h-6 text-[11px] py-0 px-1.5' : 'h-8 text-xs py-1 px-2'"
                  placeholder="Motivo..."
                />
                <button
                  type="button"
                  @click="$emit('open-detail-modal', event)"
                  class="opacity-0 group-hover/expand:opacity-100 text-slate-400 hover:text-[#004D2C] p-0.5 transition cursor-pointer"
                  title="Expandir texto"
                >
                  <Maximize2 class="h-3 w-3" />
                </button>
              </div>

              <!-- Solución -->
              <div v-else-if="col.key === 'solucion'" class="flex items-center gap-1 group/expand">
                <input
                  v-model="event.solucion"
                  @change="onRecordFieldChange(event)"
                  class="table-cell-input text-slate-700 truncate"
                  :class="isCompact ? 'h-6 text-[11px] py-0 px-1.5' : 'h-8 text-xs py-1 px-2'"
                  placeholder="Solución..."
                />
                <button
                  type="button"
                  @click="$emit('open-detail-modal', event)"
                  class="opacity-0 group-hover/expand:opacity-100 text-slate-400 hover:text-[#004D2C] p-0.5 transition cursor-pointer"
                  title="Expandir texto"
                >
                  <Maximize2 class="h-3 w-3" />
                </button>
              </div>
            </td>

            <!-- Col End: Actions (Sticky right) -->
            <td
              class="sticky right-0 z-10 text-center border-l border-slate-100 transition-colors"
              :class="[
                isCompact ? 'py-0.5 px-1.5' : 'py-1.5 px-2',
                event.selected ? 'bg-emerald-50' : 'bg-white group-hover:bg-slate-50'
              ]"
            >
              <div class="flex items-center justify-center gap-0.5">
                <!-- Clone Row -->
                <button
                  type="button"
                  @click="cloneRecord(event)"
                  class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#004D2C] transition cursor-pointer"
                  title="Duplicar incidente"
                >
                  <Copy class="h-3.5 w-3.5" />
                </button>

                <!-- Edit Modal -->
                <button
                  type="button"
                  @click="$emit('open-detail-modal', event)"
                  class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#D39F28] transition cursor-pointer"
                  title="Editar en ventana amplia"
                >
                  <Edit3 class="h-3.5 w-3.5" />
                </button>

                <!-- Delete -->
                <button
                  type="button"
                  @click="deleteRecord(event.id)"
                  class="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                  title="Eliminar incidente"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </td>

          </tr>

          <!-- Quick inline Add Row button row at the bottom of the table -->
          <tr
            class="bg-slate-50/50 hover:bg-[#004D2C]/5 transition cursor-pointer"
            @click="$emit('add-row-inline')"
          >
            <td colspan="16" class="py-2.5 px-4 text-center">
              <div class="inline-flex items-center gap-2 text-xs font-semibold text-[#004D2C] hover:text-[#003B22]">
                <Plus class="h-3.5 w-3.5" />
                <span>+ Agregar nueva fila a la tabla</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty state -->
      <div v-if="filteredEvents.length === 0" class="py-16 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <Database class="h-5 w-5" />
        </div>
        <h4 class="text-sm font-bold text-slate-800">No hay incidentes registrados</h4>
        <p class="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Comienza agregando tu primera fila directamente o importa registros desde el portapapeles.
        </p>
        <div class="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            @click="$emit('add-row-inline')"
            class="rounded-lg bg-[#004D2C] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#003B22] shadow-xs cursor-pointer"
          >
            + Agregar Primer Incidente
          </button>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, onUnmounted } from 'vue'
import {
  Search,
  ArrowUpDown,
  Clock,
  Check,
  Maximize2,
  Copy,
  Edit3,
  Trash2,
  Database,
  Plus,
  FileText,
  Pin,
  ChevronDown
} from 'lucide-vue-next'
import type { EventRecordV2, StandardIndicator } from '../types/uptime'
import {
  calculateDurationFromTimes,
  formatSecondsToHHMMSS
} from '../utils/calculator'

export interface ColumnDef {
  key: string
  label: string
  width: number
  sortable?: boolean
  required?: boolean
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: 'sistema', label: 'Sistema', width: 150, sortable: true, required: true },
  { key: 'componente', label: 'Componente', width: 140 },
  { key: 'fecha', label: 'Fecha', width: 115, sortable: true, required: true },
  { key: 'horaInicio', label: 'Inicio', width: 90, required: true },
  { key: 'horaFin', label: 'Fin', width: 90, required: true },
  { key: 'duracion', label: 'Duración', width: 100, sortable: true },
  { key: 'indicador', label: 'Indicador', width: 135, required: true },
  { key: 'responsable', label: 'Responsable', width: 130 },
  { key: 'origen', label: 'Origen', width: 115 },
  { key: 'declarado', label: 'Declarado', width: 95 },
  { key: 'revision', label: 'Revisión', width: 95 },
  { key: 'bitacora', label: 'Bitácora / Hechos', width: 220 },
  { key: 'motivo', label: 'Motivo / Causa', width: 180 },
  { key: 'solucion', label: 'Solución', width: 170 }
]

const props = defineProps<{
  events: EventRecordV2[]
  availableSystems?: string[]
}>()

const emit = defineEmits<{
  (e: 'update-events', events: EventRecordV2[]): void
  (e: 'open-detail-modal', event: EventRecordV2): void
  (e: 'open-create-modal'): void
  (e: 'add-row-inline'): void
}>()

const isCompact = ref(false)

// Dynamic column pinning state
const defaultPinnedKeys = ['sistema', 'componente']
const pinnedKeys = ref<string[]>(loadPinnedKeys())
const isFreezeMenuOpen = ref(false)
const freezeMenuRef = ref<HTMLElement | null>(null)

function loadPinnedKeys(): string[] {
  try {
    const saved = localStorage.getItem('bmsc_uptime_pinned_cols')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    // fallback
  }
  return [...defaultPinnedKeys]
}

function savePinnedKeys() {
  try {
    localStorage.setItem('bmsc_uptime_pinned_cols', JSON.stringify(pinnedKeys.value))
  } catch (e) {
    // ignore
  }
}

function isPinned(key: string): boolean {
  return pinnedKeys.value.includes(key)
}

function togglePinColumn(key: string) {
  if (pinnedKeys.value.includes(key)) {
    pinnedKeys.value = pinnedKeys.value.filter(k => k !== key)
  } else {
    pinnedKeys.value.push(key)
  }
  savePinnedKeys()
}

function pinUpToColumn(key: string) {
  const index = ALL_COLUMNS.findIndex(c => c.key === key)
  if (index >= 0) {
    pinnedKeys.value = ALL_COLUMNS.slice(0, index + 1).map(c => c.key)
    savePinnedKeys()
  }
}

function resetPinnedToDefault() {
  pinnedKeys.value = [...defaultPinnedKeys]
  savePinnedKeys()
}

function clearAllPinned() {
  pinnedKeys.value = []
  savePinnedKeys()
}

// Click outside popover handler
function onDocumentClick(e: MouseEvent) {
  if (freezeMenuRef.value && !freezeMenuRef.value.contains(e.target as Node)) {
    isFreezeMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})

// Ordered columns: Pinned columns first (keeping ALL_COLUMNS relative order), followed by unpinned
const orderedColumns = computed(() => {
  const pinned = ALL_COLUMNS.filter(c => pinnedKeys.value.includes(c.key))
  const unpinned = ALL_COLUMNS.filter(c => !pinnedKeys.value.includes(c.key))
  return [...pinned, ...unpinned]
})

// Calculate sticky left offset for each pinned column
const columnLeftOffsets = computed(() => {
  const map: Record<string, number | null> = {}
  let currentLeft = 68 // 36px (checkbox) + 32px (#)
  for (const col of orderedColumns.value) {
    if (pinnedKeys.value.includes(col.key)) {
      map[col.key] = currentLeft
      currentLeft += col.width
    } else {
      map[col.key] = null
    }
  }
  return map
})

// The rightmost pinned column gets the frozen divider shadow
const lastPinnedKey = computed(() => {
  const pinned = orderedColumns.value.filter(c => pinnedKeys.value.includes(c.key))
  return pinned.length > 0 ? pinned[pinned.length - 1].key : null
})

const filters = reactive({
  searchQuery: '',
  sistema: '',
  indicador: '',
  declarado: 'ALL',
  revision: 'ALL'
})

const hasActiveFilters = computed(() => {
  return Boolean(filters.searchQuery || filters.sistema || filters.indicador || filters.declarado !== 'ALL' || filters.revision !== 'ALL')
})

function resetFilters() {
  filters.searchQuery = ''
  filters.sistema = ''
  filters.indicador = ''
  filters.declarado = 'ALL'
  filters.revision = 'ALL'
}

type SortField = 'sistema' | 'fecha' | 'duracion'
const sortField = ref<SortField>('fecha')
const sortOrder = ref<'asc' | 'desc'>('desc')

function toggleSort(field: SortField) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

const filteredEvents = computed(() => {
  let list = [...props.events]

  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim()
    list = list.filter(e => {
      return (
        (e.sistema || '').toLowerCase().includes(q) ||
        (e.componente || '').toLowerCase().includes(q) ||
        (e.motivo || '').toLowerCase().includes(q) ||
        (e.solucion || '').toLowerCase().includes(q) ||
        (e.responsable || '').toLowerCase().includes(q) ||
        (e.origen || '').toLowerCase().includes(q) ||
        (e.bitacora || '').toLowerCase().includes(q)
      )
    })
  }

  if (filters.sistema) {
    list = list.filter(e => (e.sistema || '').toUpperCase() === filters.sistema.toUpperCase())
  }

  if (filters.indicador) {
    list = list.filter(e => e.indicador === filters.indicador)
  }

  if (filters.declarado === 'YES') {
    list = list.filter(e => e.declarado === true)
  } else if (filters.declarado === 'NO') {
    list = list.filter(e => e.declarado === false)
  }

  if (filters.revision === 'YES') {
    list = list.filter(e => e.revision === true)
  } else if (filters.revision === 'NO') {
    list = list.filter(e => e.revision === false)
  }

  // Sorting
  list.sort((a, b) => {
    let cmp = 0
    if (sortField.value === 'sistema') {
      cmp = (a.sistema || '').localeCompare(b.sistema || '')
    } else if (sortField.value === 'fecha') {
      const dateA = `${a.fecha} ${a.horaInicio || '00:00:00'}`
      const dateB = `${b.fecha} ${b.horaInicio || '00:00:00'}`
      cmp = dateA.localeCompare(dateB)
    } else if (sortField.value === 'duracion') {
      cmp = (a.durationSeconds || 0) - (b.durationSeconds || 0)
    }
    return sortOrder.value === 'asc' ? cmp : -cmp
  })

  return list
})

const isAllSelected = computed(() => {
  return filteredEvents.value.length > 0 && filteredEvents.value.every(e => e.selected)
})

const isIndeterminate = computed(() => {
  const selectedCount = filteredEvents.value.filter(e => e.selected).length
  return selectedCount > 0 && selectedCount < filteredEvents.value.length
})

function toggleSelectAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  filteredEvents.value.forEach(item => {
    item.selected = checked
  })
}

function onTimeChange(event: EventRecordV2) {
  if (event.horaInicio && event.horaFin) {
    const sec = calculateDurationFromTimes(event.horaInicio, event.horaFin)
    event.durationSeconds = sec
    event.durationMinutes = Math.round((sec / 60) * 100) / 100
    event.tiempoServicioAbajo = formatSecondsToHHMMSS(sec)
  }
  onRecordFieldChange(event)
}

function toggleDeclarado(event: EventRecordV2) {
  event.declarado = !event.declarado
  onRecordFieldChange(event)
}

function toggleRevision(event: EventRecordV2) {
  event.revision = !event.revision
  onRecordFieldChange(event)
}

function onRecordFieldChange(event: EventRecordV2) {
  event.updatedAt = new Date().toISOString()
  emit('update-events', props.events)
}

function cloneRecord(record: EventRecordV2) {
  const clone: EventRecordV2 = {
    ...record,
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    selected: false,
    createdAt: new Date().toISOString()
  }
  const index = props.events.findIndex(e => e.id === record.id)
  const updated = [...props.events]
  if (index >= 0) {
    updated.splice(index + 1, 0, clone)
  } else {
    updated.push(clone)
  }
  emit('update-events', updated)
}

function deleteRecord(id: string) {
  const updated = props.events.filter(e => e.id !== id)
  emit('update-events', updated)
}

// Standard Default Indicators: Strictly only the 3 official 'II-' indicators
const DEFAULT_INDICATORS = [
  'II-FALLAS',
  'II-PROVEEDOR',
  'II-PROGRAMADA'
]

const editingCustomIndicatorRowId = ref<string | null>(null)
const customIndicatorInput = ref('')

// Computed: Standard II- indicators + any indicator actually present in the loaded month's data
const allAvailableIndicators = computed(() => {
  const set = new Set<string>(DEFAULT_INDICATORS)
  if (props.events) {
    props.events.forEach(e => {
      if (e.indicador && e.indicador.trim()) {
        set.add(e.indicador.trim().toUpperCase())
      }
    })
  }
  return Array.from(set)
})

function handleIndicatorSelect(event: EventRecordV2, e: Event) {
  const target = e.target as HTMLSelectElement
  const val = target.value
  if (val === '__CUSTOM_NEW__') {
    startCustomIndicator(event)
  } else {
    event.indicador = val
    onRecordFieldChange(event)
  }
}

function startCustomIndicator(event: EventRecordV2) {
  editingCustomIndicatorRowId.value = event.id
  customIndicatorInput.value = event.indicador || ''
}

function confirmCustomIndicator(event: EventRecordV2) {
  const clean = customIndicatorInput.value.trim().toUpperCase()
  if (clean) {
    event.indicador = clean
    onRecordFieldChange(event)
  }
  editingCustomIndicatorRowId.value = null
  customIndicatorInput.value = ''
}

function cancelCustomIndicator() {
  editingCustomIndicatorRowId.value = null
  customIndicatorInput.value = ''
}

function indicatorSelectClass(ind: StandardIndicator | string) {
  const upper = (ind || '').toUpperCase()
  if (upper.includes('FALLAS') || upper.includes('FALLA')) {
    return 'bg-rose-50 border-rose-200 text-rose-700'
  }
  if (upper.includes('PROVEEDOR') || upper.includes('PROV')) {
    return 'bg-amber-50 border-amber-200 text-amber-800'
  }
  if (upper.includes('PROGRAMADA') || upper.includes('PROG')) {
    return 'bg-blue-50 border-blue-200 text-blue-700'
  }
  return 'bg-slate-50 border-slate-300 text-slate-800'
}
</script>
