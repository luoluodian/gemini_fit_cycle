<script setup lang="ts">
interface Props {
  blur?: number;
  opacity?: number;
  border?: boolean;
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  radius?: "sm" | "md" | "lg" | "xl" | string;
  cardClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  blur: 10,
  opacity: 0.95,
  border: true,
  shadow: "sm",
  radius: "lg",
  cardClass: "",
});
</script>

<template>
  <view
    :class="[
      border ? 'border border-white/20' : '',
      shadow === 'sm' && 'shadow-sm',
      shadow === 'md' && 'shadow-md',
      shadow === 'lg' && 'shadow-lg',
      shadow === 'xl' && 'shadow-xl',
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

<style scoped></style>