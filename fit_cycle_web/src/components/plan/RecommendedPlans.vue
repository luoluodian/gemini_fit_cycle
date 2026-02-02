<template>
  <view class="glass-card rounded-lg p-4 mb-6 shadow-lg">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">推荐计划</h3>
    <view class="space-y-3">
      <view
        v-for="plan in recommendedPlans"
        :key="plan.type"
        :class="[
          'flex items-center p-3 rounded-lg border',
          plan.bgClass
        ]"
      >
        <view :class="['w-12 h-12 rounded-lg flex items-center justify-center mr-3', plan.iconBgClass]">
          <span class="text-xl">{{ plan.icon }}</span>
        </view>
        <view class="flex-1">
          <h4 class="font-medium text-gray-800">{{ plan.name }}</h4>
          <p class="text-sm text-gray-600">{{ plan.description }}</p>
        </view>
        <view
          @click="handleCreate(plan.type)"
          :class="[
            'text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors',
            plan.buttonClass
          ]"
        >
          创建
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface RecommendedPlan {
  type: string
  name: string
  description: string
  icon: string
  bgClass: string
  iconBgClass: string
  buttonClass: string
}

interface Emits {
  (e: 'create', type: string): void
}

const emit = defineEmits<Emits>()

const recommendedPlans: RecommendedPlan[] = [
  {
    type: 'fat-loss',
    name: '30天减脂挑战',
    description: '科学减脂，健康瘦身',
    icon: '🎯',
    bgClass: 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100',
    iconBgClass: 'bg-emerald-100',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700'
  },
  {
    type: 'muscle-gain',
    name: '增肌训练计划',
    description: '高蛋白饮食，助力增肌',
    icon: '💪',
    bgClass: 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100',
    iconBgClass: 'bg-blue-100',
    buttonClass: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    type: 'balanced',
    name: '均衡营养计划',
    description: '全面营养，健康生活',
    icon: '🥗',
    bgClass: 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100',
    iconBgClass: 'bg-purple-100',
    buttonClass: 'bg-purple-600 hover:bg-purple-700'
  }
]

const handleCreate = (type: string) => {
  emit('create', type)
}
</script>


