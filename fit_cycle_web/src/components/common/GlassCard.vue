<template>
  <view
    :class="[
      'border border-white/20 shadow-sm',
      radius === 'sm' && 'rounded-lg',
      radius === 'md' && 'rounded-xl',
      radius === 'lg' && 'rounded-2xl',
      radius === 'xl' && 'rounded-3xl',
      cardClass,
    ]"
    :style="{
      borderRadius:
        typeof radius === 'string' && !['sm', 'md', 'lg', 'xl'].includes(radius)
          ? radius
          : undefined,
      backdropFilter: `blur(${blur}px)`,
      background: `rgba(255, 255, 255, ${opacity})`,
    }"
  >
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
interface Props {
  blur?: number;
  opacity?: number;
  border?: boolean;
  radius?: "sm" | "md" | "lg" | "xl" | string;
  cardClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  blur: 10,
  opacity: 0.95,
  border: true,
  radius: "xl",
  cardClass: "",
});
</script>
<style scoped></style>
