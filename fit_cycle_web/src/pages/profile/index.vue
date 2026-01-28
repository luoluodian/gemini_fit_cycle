<template>
  <view class="min-h-screen">
    <!-- Header -->
    <ProfileHeader :user-data="userData">
      <CurrentPlanCard :current-plan="currentPlan" @view-plan="handleViewPlan" @edit-plan="handleEditPlan" />
    </ProfileHeader>

    <!-- Main Content -->
    <view class="px-4 py-6 pb-20">
      <!-- Quick Stats -->
      <QuickStats :total-days="userData.totalDays" :completed-plans="userData.completedPlans" />

      <!-- Weekly Progress Chart -->
      <WeeklyProgressChart :stats="weeklyStats" @view-details="handleViewFullStats" />

      <!-- Menu Items -->
      <view class="space-y-4">
        <!-- Health Tools -->
        <HealthTools
          @bmr-calculator="handleOpenBMRCalculator"
          @weight-tracker="handleWeightTracker"
          @nutrition-guide="handleNutritionGuide"
        />

        <!-- Settings -->
        <SettingsMenu
          @settings="handleSettings"
          @help="handleHelp"
          @about="handleAbout"
        />

        <!-- Import Plan -->
        <ImportPlanCard @import="handleShowImportPlan" />
      </view>
    </view>

    <!-- Modals -->
    <BMRCalculatorModal :visible="bmrModalVisible" @close="handleCloseBMRModal" />
    <AboutModal :visible="aboutModalVisible" @close="handleCloseAboutModal" />
    <ImportPlanModal :visible="importPlanModalVisible" @close="handleCloseImportPlanModal" @import="handleImportPlan" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { navigateTo } from '@/router';
import { showSuccess } from '@/utils/toast';
import { useUserStore } from '@/stores/user';
import ProfileHeader from '@/components/profile/ProfileHeader.vue';
import CurrentPlanCard from '@/components/profile/CurrentPlanCard.vue';
import QuickStats from '@/components/profile/QuickStats.vue';
import WeeklyProgressChart from '@/components/profile/WeeklyProgressChart.vue';
import HealthTools from '@/components/profile/HealthTools.vue';
import SettingsMenu from '@/components/profile/SettingsMenu.vue';
import ImportPlanCard from '@/components/profile/ImportPlanCard.vue';
import BMRCalculatorModal from '@/components/profile/BMRCalculatorModal.vue';
import AboutModal from '@/components/profile/AboutModal.vue';
import ImportPlanModal from '@/components/profile/ImportPlanModal.vue';
import './index.scss';

const userStore = useUserStore();

// 绑定 Store 数据
const userData = computed(() => ({
  nickname: userStore.userInfo?.nickname || '微信用户',
  avatarUrl: userStore.userInfo?.avatarUrl,
  totalDays: 128, // 暂时写死，后续接口补充
  completedPlans: 5,
}));

const currentPlan = ref({
  name: '6周减脂计划',
  week: 3,
  remainingDays: 18,
});

const weeklyStats = ref({
  averageIntake: '1,650',
  daysMet: 5,
  weeklyChange: '-0.5kg',
});

// 模态框状态
const bmrModalVisible = ref(false);
const aboutModalVisible = ref(false);
const importPlanModalVisible = ref(false);

// 事件处理
const handleViewPlan = async () => {
  await showSuccess('正在跳转到计划详情...');
  setTimeout(() => {
    navigateTo('/pages/plan/index');
  }, 1500);
};

const handleEditPlan = async () => {
  await showSuccess('编辑计划功能开发中...');
};

const handleViewFullStats = async () => {
  await showSuccess('完整统计功能开发中...');
};

const handleOpenBMRCalculator = () => {
  bmrModalVisible.value = true;
};

const handleCloseBMRModal = () => {
  bmrModalVisible.value = false;
};

const handleWeightTracker = async () => {
  await showSuccess('体重记录功能开发中...');
};

const handleNutritionGuide = async () => {
  await showSuccess('营养指南功能开发中...');
};

const handleSettings = async () => {
  await showSuccess('设置功能开发中...');
};

const handleHelp = async () => {
  await showSuccess('帮助功能开发中...');
};

const handleAbout = () => {
  aboutModalVisible.value = true;
};

const handleCloseAboutModal = () => {
  aboutModalVisible.value = false;
};

const handleShowImportPlan = () => {
  importPlanModalVisible.value = true;
};

const handleCloseImportPlanModal = () => {
  importPlanModalVisible.value = false;
};

const handleImportPlan = async (code: string) => {
  await showSuccess('计划导入成功！');
  setTimeout(() => {
    navigateTo('/pages/plan/index');
  }, 2000);
};
</script>

