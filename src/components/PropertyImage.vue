<template>
  <img 
    :src="imageSrc" 
    :alt="alt"
    @error="handleError"
    class="property-image"
  />
</template>

<script setup lang="ts">
/* eslint-disable no-undef */
import { ref, computed } from 'vue';

const props = defineProps<{
  src?: string;
  alt?: string;
}>();

const imageError = ref(false);

const imageSrc = computed(() => {
  if (imageError.value || !props.src) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23999'%3E📷 Sin Imagen%3C/text%3E%3C/svg%3E";
  }
  return props.src;
});

const handleError = () => {
  imageError.value = true;
};
</script>