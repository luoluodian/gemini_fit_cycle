<script setup lang="ts">
interface Props {
  blur?: number;
  opacity?: number;
  border?: boolean;
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  radius?: "none" | "sm" | "md" | "lg" | "xl" | string;
  cardClass?: string;
  background?: string;
}

const props = withDefaults(defineProps<Props>(), {
  blur: 10,
  opacity: 0.95,
  border: true,
  shadow: "md",
  radius: "lg",
  cardClass: "",
  background: "",
});

const radiusMap = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
};

const shadowMap = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
};
</script>

<template>
  <view
    :class="[
      border ? 'border-[1rpx] border-solid border-emerald-300' : '',
      typeof radius === 'string' && radiusMap[radius] ? radiusMap[radius] : '',
      typeof shadow === 'string' && shadowMap[shadow] ? shadowMap[shadow] : '',
      cardClass,
    ]"
    :style="{
      borderRadius:
        typeof radius === 'string' && !radiusMap[radius]
          ? radius
          : undefined,
      backdropFilter: props.background ? 'none' : `blur(${blur}px)`,
      background: props.background || `rgba(255, 255, 255, ${opacity})`,
    }"
  >
    <slot></slot>
  </view>
</template>

<style scoped></style>