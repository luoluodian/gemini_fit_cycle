<template>
  <view 
    class="meal-section-item bg-white/80 rounded-2xl p-4 border-[2rpx] border-solid border-gray-200 transition-all mb-3 shadow-sm"
  >
    <!-- 头部：餐次汇总信息 -->
    <view class="flex items-center justify-between mb-2">
      <!-- 左侧点击区域：直接进入详细配置 -->
      <view class="flex items-center flex-1 min-w-0 pr-2 active:opacity-60 transition-all" @tap="$emit('edit')">
        <text class="text-xl mr-2">{{ icon }}</text>
        <view class="flex-1 min-w-0 mr-2">
          <text class="text-sm font-black text-gray-800">{{ title }}</text>
          <text 
            :class="['text-[16rpx] font-bold block', foods.length > 0 ? 'text-emerald-600' : 'text-gray-400']"
          >
            {{ foods.length > 0 ? foods.length + ' 个食物' : '未配置' }}
          </text>
        </view>
      </view>

      <!-- 右侧操作区域 -->
      <view class="flex items-center space-x-3">
        <!-- 营养汇总 -->
        <view class="text-right active:opacity-60 transition-all" @tap="$emit('edit')">
          <view class="text-sm font-black text-gray-700 leading-tight">
            {{ Math.round(totalCalories || 0) }}<text class="text-[16rpx] text-gray-400 ml-0.5 font-bold">kcal</text>
          </view>
          <view class="flex items-center space-x-1.5 text-[16rpx] text-gray-400 font-bold mt-0.5">
            <text>碳{{ Math.round(totalCarbs || 0) }}</text>
            <text>蛋{{ Math.round(totalProtein || 0) }}</text>
            <text>脂{{ Math.round(totalFat || 0) }}</text>
          </view>
        </view>
        
        <!-- 精品白瓷操作胶囊 (Premium Capsule) -->
        <view class="flex items-center h-8 bg-white border border-solid border-gray-100 rounded-full px-1 shadow-sm">
          <!-- 1. 更多按钮 (⋮) -->
          <view 
            class="w-8 h-full flex items-center justify-center active:bg-gray-50 rounded-full transition-colors"
            @tap.stop="$emit('show-menu')"
          >
            <view class="flex flex-col space-y-0.5">
              <view class="w-1 h-1 rounded-full bg-gray-400"></view>
              <view class="w-1 h-1 rounded-full bg-gray-400"></view>
              <view class="w-1 h-1 rounded-full bg-gray-400"></view>
            </view>
          </view>

          <!-- 优雅分割线 -->
          <view v-if="foods.length > 0" class="w-[1rpx] h-4 bg-gray-100 mx-0.5"></view>

          <!-- 2. 展开/收起按钮 -->
          <view 
            v-if="foods.length > 0"
            class="w-8 h-full flex items-center justify-center active:bg-gray-50 rounded-full transition-colors"
            @tap.stop="toggleExpand"
          >
            <view :class="['transition-transform duration-300 flex items-center', isExpanded ? 'rotate-180' : '']">
              <ArrowDown font-size="14" :color="isExpanded ? '#10b981' : '#9ca3af'"></ArrowDown>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部：详细食物列表 (折叠抽屉) -->
    <view 
      v-if="foods.length > 0 && isExpanded" 
      class="space-y-1 mt-2 pt-3 border-t border-dashed border-gray-200 animate-slide-down"
    >
      <FoodItemCard
        v-for="(food, idx) in foods" 
        :key="idx" 
        :food="food"
        :quantity="food.quantity"
        show-delete
        @delete="$emit('delete-food', idx)"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ArrowDown } from "@nutui/icons-vue-taro";
import FoodItemCard from "../food/FoodItemCard.vue";

interface Food {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface Props {
  title: string;
  icon: string;
  foods: Food[];
  isExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isExpanded: false
});

const emit = defineEmits(["edit", "delete-food", "show-menu", "toggle"]);

// 当食物列表变动时（如新添加食物），通过事件通知父组件展开
watch(() => props.foods.length, (newVal, oldVal) => {
  if (newVal > oldVal) {
    emit('toggle');
  }
});

const toggleExpand = () => {
  if (props.foods.length > 0) {
    emit('toggle');
  } else {
    // 如果没有食物，点击左侧也直接进入配置
    emit('edit');
  }
};

const totalCalories = computed(() => props.foods.reduce((s, f) => s + (f.calories || 0), 0));
const totalProtein = computed(() => props.foods.reduce((s, f) => s + (f.protein || 0), 0));
const totalFat = computed(() => props.foods.reduce((s, f) => s + (f.fat || 0), 0));
const totalCarbs = computed(() => props.foods.reduce((s, f) => s + (f.carbs || 0), 0));
</script>

<style scoped lang="scss">
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-down {
  animation: slideDown 0.3s ease-out forwards;
}
.rotate-180 {
  transform: rotate(180deg);
}
</style>