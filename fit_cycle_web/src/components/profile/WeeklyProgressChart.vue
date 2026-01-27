<template>
  <view class="glass-card rounded-2xl p-4 mb-6 shadow-lg">
    <view class="flex items-center justify-between mb-4">
      <text class="text-lg font-semibold text-gray-800">本周摄入趋势</text>
      <text class="text-sm text-emerald-600 font-medium" @click="handleViewDetails">查看详情</text>
    </view>
    <view class="chart-container" :id="chartId"></view>
    <view class="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
      <view>
        <text class="font-semibold text-gray-800 block">平均摄入</text>
        <text class="text-emerald-600 font-bold block">{{ stats.averageIntake }} kcal</text>
      </view>
      <view>
        <text class="font-semibold text-gray-800 block">达标天数</text>
        <text class="text-blue-600 font-bold block">{{ stats.daysMet }}/7 天</text>
      </view>
      <view>
        <text class="font-semibold text-gray-800 block">本周变化</text>
        <text class="text-orange-600 font-bold block">{{ stats.weeklyChange }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface WeeklyStats {
  averageIntake: string;
  daysMet: number;
  weeklyChange: string;
}

const props = defineProps<{
  stats: WeeklyStats;
}>();

const emit = defineEmits<{
  viewDetails: [];
}>();

const chartId = ref(`weekly-chart-${Date.now()}`);
let chartInstance: any = null;

const handleViewDetails = () => {
  emit('viewDetails');
};

onMounted(() => {
  // 初始化图表 - 使用写死的数据
  // 注意：在 Taro 中，echarts 可能需要特殊处理，这里先保持简单实现
  if (typeof window !== 'undefined' && (window as any).echarts) {
    const chartDom = document.getElementById(chartId.value);
    if (chartDom) {
      try {
        chartInstance = (window as any).echarts.init(chartDom);
      
      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          textStyle: {
            color: '#374151'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          axisLine: {
            lineStyle: {
              color: '#e5e7eb'
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#6b7280',
            fontSize: 12
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#6b7280',
            fontSize: 12,
            formatter: '{value} kcal'
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6'
            }
          }
        },
        series: [
          {
            name: '目标热量',
            type: 'line',
            data: [1800, 1800, 1800, 1800, 1800, 1800, 1800],
            lineStyle: {
              color: '#10b981',
              type: 'dashed',
              width: 2
            },
            itemStyle: {
              color: '#10b981'
            },
            symbol: 'none'
          },
          {
            name: '实际摄入',
            type: 'line',
            data: [1650, 1820, 1580, 1750, 1680, 1920, 1650],
            lineStyle: {
              color: '#f97316',
              width: 3
            },
            itemStyle: {
              color: '#f97316'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(249, 115, 22, 0.3)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(249, 115, 22, 0.05)'
                  }
                ]
              }
            }
          }
        ]
      };
      
        chartInstance.setOption(option);
        
        // 响应式处理
        const handleResize = () => {
          if (chartInstance) {
            chartInstance.resize();
          }
        };
        window.addEventListener('resize', handleResize);
      } catch (error) {
        console.warn('ECharts 初始化失败:', error);
      }
    }
  }
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.chart-container {
  height: 200px;
}
</style>

