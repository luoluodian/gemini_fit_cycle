<template>
  <view class="custom-tab-bar fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around z-50">
    <view
      v-for="(item, index) in list"
      :key="index"
      :class="[
        'nav-tab flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-300 cursor-pointer',
        selected === index ? 'active bg-emerald-500 text-white' : 'text-gray-600'
      ]"
      @click="switchTab(index, item.pagePath)"
    >
      <!-- Home Icon -->
      <svg v-if="index === 0" class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
      
      <!-- Plan Icon -->
      <svg v-if="index === 1" class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
      </svg>
      
      <!-- Food Icon -->
      <svg v-if="index === 2" class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
      </svg>
      
      <!-- User Icon -->
      <svg v-if="index === 3" class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
      </svg>

      <text class="text-xs">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Taro from '@tarojs/taro';
import { useNavigationStore } from '@/stores/navigation';

const navStore = useNavigationStore();
const selected = computed(() => navStore.activeTab);

const list = [
  { pagePath: '/pages/index/index', text: '记录' },
  { pagePath: '/pages/plan/index', text: '计划' },
  { pagePath: '/pages/food/index', text: '食材' },
  { pagePath: '/pages/profile/index', text: '我的' }
];

const switchTab = (index: number, url: string) => {
  navStore.setActiveTab(index);
  Taro.switchTab({ url });
};
</script>

<style lang="scss">
.nav-tab.active {
  background-color: #10b981; /* emerald-500 */
  color: white;
}
</style>
