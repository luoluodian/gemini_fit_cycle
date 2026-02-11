<template>
  <GlassCard card-class="p-4 mb-6" shadow="lg">
    <view class="flex items-center justify-between mb-6">
      <text class="text-lg font-semibold text-gray-800">本周摄入趋势</text>
      <text class="text-sm text-emerald-600 font-medium active:opacity-60" @click="handleViewDetails">查看详情</text>
    </view>

    <!-- CSS 柱状图区域 -->
    <view class="chart-container flex items-end justify-between px-2 h-40">
      <view v-for="(item, index) in chartData" :key="index" class="flex flex-col items-center flex-1">
        <!-- 柱子 -->
        <view 
          class="bar-item w-6 rounded-t-lg transition-all duration-500 relative group"
          :style="{ 
            height: `${(item.value / maxIntake) * 100}%`,
            background: item.value >= targetIntake ? 'linear-gradient(to top, #10b981, #34d399)' : 'linear-gradient(to top, #f97316, #fb923c)'
          }"
        >
          <!-- 数值气泡 (简单模拟) -->
          <view class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap">
            {{ item.value }}
          </view>
        </view>
        <!-- X轴标签 -->
        <text class="text-[10px] text-gray-500 mt-2">{{ item.day }}</text>
      </view>
    </view>

    <!-- 底部统计 -->
    <view class="mt-6 grid grid-cols-3 gap-4 text-center text-sm border-t border-gray-100 pt-4">
      <view>
        <text class="font-semibold text-gray-800 block">平均摄入</text>
        <text class="text-emerald-600 font-bold block">{{ stats.averageIntake }}</text>
      </view>
      <view>
        <text class="font-semibold text-gray-800 block">达标天数</text>
        <text class="text-blue-600 font-bold block">{{ stats.daysMet }}/7</text>
      </view>
      <view>
        <text class="font-semibold text-gray-800 block">本周变化</text>
        <text class="text-orange-600 font-bold block">{{ stats.weeklyChange }}</text>
      </view>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '../common/GlassCard.vue';
/**
 * WeeklyProgressChart - 摄入趋势图组件 (跨端兼容版)
 */
interface WeeklyStats {
  averageIntake: string;
  daysMet: number;
  weeklyChange: string;
}

defineProps<{
  stats: WeeklyStats;
}>();

const emit = defineEmits<{
  viewDetails: [];
}>();

// 模拟图表数据
const chartData = [
  { day: '周一', value: 1650 },
  { day: '周二', value: 1820 },
  { day: '周三', value: 1580 },
  { day: '周四', value: 1750 },
  { day: '周五', value: 1680 },
  { day: '周六', value: 1920 },
  { day: '周日', value: 1650 },
];

const targetIntake = 1800; // 目标值
const maxIntake = 2200; // 用于计算高度比例的最大值

const handleViewDetails = () => {
  emit('viewDetails');
};
</script>

<style scoped lang="scss">
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.chart-container {
  border-bottom: 1px solid #f3f4f6;
}

.bar-item {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
  min-height: 4px; /* 哪怕是0也有个底线显示 */
}
</style>
