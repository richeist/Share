<template>
  <div class="loading-overlay" v-if="show">
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  message: {
    type: String,
    default: '加载中...'
  }
})
</script> 