<template>
  <div class="rules-button" @click="$emit('click')">
    <i class="fas fa-book"></i>
    Steam转离线模式使用教程
  </div>
</template>

<script setup>
defineEmits(['click'])
</script>

<style scoped>
.rules-button {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: var(--primary-color);
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 100;
}

.rules-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.rules-button i {
  font-size: 16px;
}

@media (max-width: 768px) {
  .rules-button {
    right: 10px;
    bottom: 10px;
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style> 