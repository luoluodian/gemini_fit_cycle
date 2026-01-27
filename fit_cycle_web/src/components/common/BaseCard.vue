<template>
  <view
    :class="[
      'bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-300',
      hoverEffect && 'hover:-translate-y-0.5 hover:shadow-lg',
      clickable && 'cursor-pointer',
      status === 'completed' && 'border-l-4 border-l-emerald-500',
      status === 'configured' && 'border-l-4 border-l-blue-500',
      status === 'active' && 'border-l-4 border-l-amber-500',
      cardClass,
    ]"
    @click="handleClick"
  >
    <view v-if="$slots.header" class="mb-3">
      <slot name="header"></slot>
    </view>
    <view class="flex-1">
      <slot></slot>
    </view>
    <view v-if="$slots.actions" class="mt-3 flex gap-2">
      <slot name="actions"></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  status?: "completed" | "configured" | "active" | "";
  hoverEffect?: boolean;
  clickable?: boolean;
  showBorder?: boolean;
  cardClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  status: "",
  hoverEffect: true,
  clickable: false,
  showBorder: true,
  cardClass: "",
});

const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  if (props.clickable) {
    emit("click");
  }
};
</script>


