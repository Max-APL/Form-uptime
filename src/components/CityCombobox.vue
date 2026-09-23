<template>
  <div class="relative w-full" ref="containerRef">
    <!-- Input Trigger -->
    <div class="relative flex items-center w-full">
      <input
        ref="inputRef"
        type="text"
        :value="isOpen ? inputValue : modelValue"
        @input="onInput"
        @focus="onFocus"
        @keydown="onKeyDown"
        :placeholder="placeholder || 'Ciudad / Depto...'"
        class="w-full rounded border transition-colors bg-white px-2 py-1 pr-6 text-xs uppercase font-medium text-slate-800 placeholder-slate-400 focus:outline-none shadow-2xs"
        :class="isOpen ? 'border-[#004D2C] ring-1 ring-[#004D2C]' : 'border-slate-200 hover:border-slate-300'"
        autocomplete="off"
        spellcheck="false"
      />

      <!-- Right controls: Clear button & Chevron Toggle -->
      <div class="absolute right-1 flex items-center gap-0.5 text-slate-400">
        <button
          v-if="isOpen && inputValue"
          type="button"
          tabindex="-1"
          @mousedown.stop.prevent="clearInput"
          class="p-0.5 hover:text-slate-600 rounded transition cursor-pointer"
          title="Borrar texto"
        >
          <X class="h-3 w-3" />
        </button>
        <button
          type="button"
          tabindex="-1"
          @mousedown.stop.prevent="toggleDropdown"
          class="p-0.5 hover:text-slate-600 rounded transition cursor-pointer"
          title="Ver lista completa"
        >
          <ChevronDown
            class="h-3.5 w-3.5 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          />
        </button>
      </div>
    </div>

    <!-- Floating Dropdown Menu -->
    <div
      v-if="isOpen"
      ref="dropdownRef"
      class="absolute left-0 z-50 mt-1 w-full min-w-[210px] rounded-lg border border-slate-200 bg-white py-1 shadow-xl max-h-52 overflow-y-auto text-xs"
      tabindex="-1"
      @mousedown.prevent
    >
      <!-- Coincidencias encontradas -->
      <div
        v-for="(opt, idx) in filteredOptions"
        :key="opt"
        @mouseenter="highlightedIndex = idx"
        @click="selectOption(opt)"
        class="flex items-center justify-between px-2.5 py-1.5 cursor-pointer transition-colors"
        :class="[
          highlightedIndex === idx ? 'bg-[#004D2C]/10 text-[#004D2C] font-bold' : 'text-slate-700 hover:bg-slate-50',
          opt === modelValue ? 'font-bold text-[#004D2C]' : ''
        ]"
      >
        <span class="truncate">{{ opt }}</span>
        <Check v-if="opt === modelValue" class="h-3.5 w-3.5 text-[#004D2C] shrink-0 ml-1" />
      </div>

      <!-- Opción para agregar nueva ciudad si no existe en la lista -->
      <div
        v-if="showCustomAddOption"
        @mouseenter="highlightedIndex = filteredOptions.length"
        @click="selectOption(cleanedCustomInput)"
        class="border-t border-slate-100 px-2.5 py-2 cursor-pointer bg-emerald-50/50 hover:bg-emerald-50 text-[#004D2C] flex items-center gap-1.5 transition-colors"
        :class="{ 'bg-emerald-100 font-bold': highlightedIndex === filteredOptions.length }"
      >
        <Plus class="h-3.5 w-3.5 shrink-0" />
        <span class="truncate">
          Usar nueva: <strong>«{{ cleanedCustomInput }}»</strong>
        </span>
      </div>

      <!-- Estado vacío cuando no hay coincidencias -->
      <div v-if="filteredOptions.length === 0 && !showCustomAddOption" class="px-3 py-2 text-center text-slate-400 text-[11px]">
        No se encontraron coincidencias
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ChevronDown, Check, Plus, X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  options: string[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

const isOpen = ref(false)
const inputValue = ref('')
const highlightedIndex = ref(0)

const filteredOptions = computed(() => {
  const q = inputValue.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter(opt => opt.toLowerCase().includes(q))
})

const cleanedCustomInput = computed(() => {
  return inputValue.value.trim().toUpperCase()
})

const showCustomAddOption = computed(() => {
  const q = cleanedCustomInput.value
  if (!q) return false
  return !props.options.some(opt => opt.toUpperCase() === q)
})

function onFocus() {
  inputValue.value = props.modelValue || ''
  isOpen.value = true
  highlightedIndex.value = 0
}

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  inputValue.value = target.value
  isOpen.value = true
  highlightedIndex.value = 0
}

function toggleDropdown() {
  if (isOpen.value) {
    closeDropdown()
  } else {
    inputValue.value = ''
    isOpen.value = true
    highlightedIndex.value = 0
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

function clearInput() {
  inputValue.value = ''
  highlightedIndex.value = 0
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function selectOption(val: string) {
  const clean = val.trim().toUpperCase()
  if (clean) {
    emit('update:modelValue', clean)
  }
  closeDropdown()
}

function closeDropdown() {
  isOpen.value = false
  inputValue.value = props.modelValue || ''
}

function onKeyDown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
      e.preventDefault()
      onFocus()
    }
    return
  }

  const totalItems = filteredOptions.value.length + (showCustomAddOption.value ? 1 : 0)

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (totalItems > 0) {
      highlightedIndex.value = (highlightedIndex.value + 1) % totalItems
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (totalItems > 0) {
      highlightedIndex.value = (highlightedIndex.value - 1 + totalItems) % totalItems
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
      selectOption(filteredOptions.value[highlightedIndex.value])
    } else if (showCustomAddOption.value && highlightedIndex.value === filteredOptions.value.length) {
      selectOption(cleanedCustomInput.value)
    } else if (cleanedCustomInput.value) {
      selectOption(cleanedCustomInput.value)
    } else {
      closeDropdown()
    }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    closeDropdown()
  } else if (e.key === 'Tab') {
    // Commit current selection or typed value when tabbing to next column
    if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
      emit('update:modelValue', filteredOptions.value[highlightedIndex.value])
    } else if (cleanedCustomInput.value) {
      emit('update:modelValue', cleanedCustomInput.value)
    }
    isOpen.value = false
  }
}

function onDocumentClick(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    if (isOpen.value) {
      const q = cleanedCustomInput.value
      if (q && q !== props.modelValue) {
        emit('update:modelValue', q)
      }
      closeDropdown()
    }
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onDocumentClick)
})
</script>
