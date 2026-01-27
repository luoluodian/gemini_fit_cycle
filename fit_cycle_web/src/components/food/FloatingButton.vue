<template>
  <view
    class="floating-btn"
    @click="handleClick"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      ></path>
    </svg>
  </view>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  emit("click");
};
</script>

<style scoped>
.floating-btn {
  position: fixed;
  bottom: 96px;
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  box-shadow: 0 8px 25px rgba(249, 115, 22, 0.3);
  transition: all 0.3s ease;
  z-index: 10;
}

.floating-btn:active {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(249, 115, 22, 0.4);
}
</style>

