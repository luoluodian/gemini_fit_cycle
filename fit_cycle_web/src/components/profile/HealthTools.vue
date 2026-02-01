<template>
  <GlassCard card-class="p-4 shadow-lg">
    <text class="text-lg font-semibold text-gray-800 mb-4 block">健康工具</text>
    <view class="space-y-1">
      <MenuItem 
        title="BMR/TDEE 计算器" 
        description="计算基础代谢率和每日消耗"
        icon-bg-class="bg-blue-50"
        @click="$emit('bmrCalculator')"
      >
        <template #icon>
          <image 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjMjU2M0VCIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTkgN2g2bTAgMTB2LTNtLTMgM2guMDFNOSAxN2guMDFNOSAxNGguMDFNMTIgMTRoLjAxTTE1IDExaC4wMU0xMiAxMWguMDFNOSAxMWguMDFNNyAyMWgxMGEyIDIgMCAwMDItMlY1YTIgMiAwIDAwLTItMkg3YTIgMiAwIDAwLTIgMnYxNGEyIDIgMCAwMDIgMnoiLz48L3N2Zz4="
            class="w-5 h-5"
          />
        </template>
      </MenuItem>
      
      <MenuItem 
        title="体重记录" 
        description="追踪体重变化趋势"
        icon-bg-class="bg-emerald-50"
        @click="$emit('weightTracker')"
      >
        <template #icon>
          <image 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjMDU5NjY5Ij48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTMgNmwzIDFtMDAgbC0zIDlhNS4wMDIgNS4wMDIgMCAwMDYuMDAxIDBNNiA3bDMgOU02IDdsNi0ybTYgMmwzLTFtLTMgMWwtMyA5YTUuMDAyIDUuMDAyIDAgMDA2LjAwMSAwwTTE4IDdsMyA5bS0zLTlsLTYtMm0wLTJ2Mm0wIDE2VjVtMCAxNkg5bTMgMGgzIi8+PC9zdmc+"
            class="w-5 h-5"
          />
        </template>
      </MenuItem>
      
      <MenuItem 
        title="营养指南" 
        description="学习健康饮食知识"
        icon-bg-class="bg-purple-50"
        @click="$emit('nutritionGuide')"
      >
        <template #icon>
          <image 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjN0MzQUVEIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTEyIDYuMjUzdjEzbTAtMTNDMTAuODMyIDUuNDc3IDkuMjQ2IDUgNy41IDVTNC4xNjggNS40NzcgMyA2LjI1M3YxM0M0LjE2OCAxOC40NzcgNS43NTQgMTggNy41IDE4czMuMzMyLjQ3NyA0LjUgMS4yNTNtMC0xM0MxMy4xNjggNS40NzcgMTQuNzU0IDUgMTYuNSA1YzEuNzQ2IDAgMy4zMzIuNDc3IDQuNSAxLjI1M3YxM0MxOS44MzIgMTguNDc3IDE4LjI0NiAxOCAxNi41IDE4Yy0xLjc0NiAwLTMuMzMyLjQ3Ny00LjUgMS4yNTMiLz48L3N2Zz4="
            class="w-5 h-5"
          />
        </template>
      </MenuItem>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '../common/GlassCard.vue';
import MenuItem from '../common/MenuItem.vue';

defineEmits<{
  bmrCalculator: [];
  weightTracker: [];
  nutritionGuide: [];
}>();
</script>

