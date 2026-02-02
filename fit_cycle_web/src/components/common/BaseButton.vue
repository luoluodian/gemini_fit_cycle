<template>
  <button
    :class="[
      'base-button transition-all duration-200 flex items-center justify-center font-semibold',
      block ? 'w-full' : '',
      round ? 'rounded-full' : 'rounded-lg',
      sizeClasses[size],
      typeClasses[type],
      loading || disabled
        ? 'opacity-60 pointer-events-none'
        : 'active:scale-95',
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <view
      v-if="loading"
      class="mr-2 animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
    ></view>
    <slot v-else name="icon"></slot>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
/**
 * BaseButton - 原子按钮组件
 * 统一处理项目中的按钮样式与交互
 */

interface Props {
  type?: "primary" | "secondary" | "wechat" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  round?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "primary",
  size: "md",
  loading: false,
  disabled: false,
  block: true,
  round: false,
});

defineEmits<{
  click: [event: any];
}>();

// 尺寸映射
const sizeClasses = {
  sm: "py-2 px-4 text-sm",
  md: "py-2.5 px-6 text-base",
  lg: "py-3.5 px-8 text-lg",
};

// 类型样式映射
const typeClasses = {
  primary:
    "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-100",
  secondary:
    "bg-transparent border border-gray-200 text-gray-400 active:bg-gray-50",
  wechat:
    "bg-[linear-gradient(135deg,#07c160_0%,#06ad56_100%)] text-white shadow-lg shadow-green-100/50",
  danger:
    "bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-100",
  ghost: "bg-transparent text-gray-500",
};
</script>

<style lang="scss">
.base-button {
  border: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &::after {
    display: none;
  }
}
</style>
