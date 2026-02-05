<template>
  <GlassCard
    card-class="p-6 border-[1rpx] border-solid border-gray-200"
    radius="xl"
    :border="false"
  >
    <h3 class="text-lg font-semibold text-gray-800 mb-4">基础信息</h3>
    <view class="space-y-4">
      <!-- 计划名称 -->
      <view>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >计划名称 *</label
        >
        <input
          type="text"
          :value="formData.name"
          @input="(e) => emit('update:formData', { name: e.detail.value })"
          class="px-4 border-[1rpx] border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white h-10"
          placeholder="计划名称  例如：三周减脂训练营"
        />
      </view>

      <!-- 计划类型 -->
      <view>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >计划类型</label
        >
        <view class="space-y-3">
          <!-- 普通组 -->
          <view>
            <text class="text-xs text-gray-500 mb-2 block">普通</text>
            <view
              class="plan-type-btn w-full px-4 py-3 border-[1rpx] border-solid rounded-lg text-sm font-medium transition-colors text-left"
              :class="
                formData.type === 'custom'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                  : 'border-gray-300 bg-white text-gray-700'
              "
              @tap="emit('update:formData', { type: 'custom' })"
            >
              常规
            </view>
          </view>
          <!-- 进阶组 -->
          <view>
            <text class="text-xs text-gray-500 mb-2 block">进阶</text>
            <view
              class="plan-type-btn w-full px-4 py-3 border-[1rpx] border-solid rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between"
              :class="
                formData.type === 'carb-cycle'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                  : 'border-gray-300 bg-white text-gray-700'
              "
              @tap="emit('update:formData', { type: 'carb-cycle' })"
            >
              <text>碳循环</text>
              <text
                class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded"
                >进阶</text
              >
            </view>
          </view>
        </view>
      </view>

      <!-- 激活开关 -->
      <view class="flex items-center">
        <checkbox
          id="setActive"
          :checked="formData.setActive"
          @change="
            (e) => emit('update:formData', { setActive: e.detail.value })
          "
          color="#10b981"
          style="transform: scale(0.8)"
        />
        <label for="setActive" class="ml-2 text-sm text-gray-700"
          >保存后设为当前激活计划</label
        >
      </view>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from "../common/GlassCard.vue";

interface Props {
  formData: {
    name: string;
    type: string;
    setActive: boolean;
  };
}
defineProps<Props>();
const emit = defineEmits(["update:formData"]);
</script>

<style scoped>
.plan-type-btn {
  box-sizing: border-box;
}
</style>
