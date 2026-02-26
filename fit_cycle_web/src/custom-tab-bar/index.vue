<template>
  <view class="custom-tab-bar fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around z-50">
    <view
      v-for="(item, index) in list"
      :key="index"
      :class="[
        'nav-tab flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-300 cursor-pointer',
        selected === index ? 'active bg-emerald-500 text-white' : 'text-gray-600'
      ]"
      @click="switchTabAction(index, item.pagePath)"
    >
      <!-- Home Icon -->
      <Home v-if="index === 0" font-size="20" class="mb-1" />
      
      <!-- Plan Icon -->
      <Horizontal v-if="index === 1" font-size="20" class="mb-1" />
      
      <!-- Food Icon -->
      <Category v-if="index === 2" font-size="20" class="mb-1" />
      
      <!-- User Icon -->
      <People v-if="index === 3" font-size="20" class="mb-1" />

      <text class="text-xs">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { switchTab, ROUTES } from '@/router';
import { useNavigationStore } from '@/stores/navigation';
import { Home, Horizontal, Category, People } from '@nutui/icons-vue-taro';

const navStore = useNavigationStore();
const selected = computed(() => navStore.activeTab);

const list = [
  { pagePath: ROUTES.HOME, text: '记录' },
  { pagePath: ROUTES.PLAN_OVERVIEW, text: '计划' },
  { pagePath: ROUTES.FOOD_LIBRARY, text: '食材' },
  { pagePath: ROUTES.PROFILE, text: '我的' }
];

const switchTabAction = (index: number, url: string) => {
  navStore.setActiveTab(index);
  switchTab(url as any);
};
</script>

<style lang="scss">
.nav-tab.active {
  background-color: #10b981; /* emerald-500 */
  color: white;
}
</style>
