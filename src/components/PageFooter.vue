<template>
  <div class="mt-auto pt-4 flex items-end justify-between border-t border-transparent">
    <!-- Official BMSC Social Networks & Agency QR Code Image -->
    <div class="flex items-center">
      <img
        src="/bmsc-footer-qr.png"
        alt="Para conocer dónde están nuestras agencias, escanea el QR"
        class="h-10 sm:h-12 w-auto object-contain select-none"
      />
    </div>

    <!-- Page Number on the bottom right -->
    <div class="text-xs font-serif font-bold text-black pr-2 pb-1">
      {{ pageNumber }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  pageNumber: number
}>()
</script>
