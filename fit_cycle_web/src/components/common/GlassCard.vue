<script setup lang="ts">
interface Props {
  blur?: number;
  opacity?: number;
  border?: boolean;
  borderColor?: string;
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | string;
  cardClass?: string;
  background?: string;
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  blur: 10,
  opacity: 0.95,
  border: true,
  borderColor: "border-emerald-300/50",
  shadow: "lg",
  radius: "lg",
  cardClass: "",
  background: "",
  clickable: false,
});

const radiusMap = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

const shadowMap = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
};
</script>

<template>
  <view
    :class="[
      'transition-all duration-300 p-4',
      border ? `border-[1rpx] border-solid ${borderColor}` : '',
      radiusMap[radius] || '',
      shadowMap[shadow] || '',
      clickable ? 'active:scale-[0.98] active:opacity-90 cursor-pointer' : '',
      cardClass,
    ]"
    :style="{
      borderRadius: !radiusMap[radius] ? radius : undefined,
      backdropFilter: props.background ? 'none' : `blur(${blur}px)`,
      background: props.background || `rgba(255, 255, 255, ${opacity})`,
    }"
  >
    <slot></slot>
  </view>
</template>

<style scoped></style>