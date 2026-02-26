<template>
  <PageLayout v-if="planData" title="配置日模板" :use-scroll-view="false">
    <!-- 1. 顶部固定区：计划摘要与进度 (Sticky) -->
    <template #fixed-top>
      <view class="px-4 pt-4">
        <TemplateManagementStep
          :templates="planData.planDays"
          :basic-info="planData"
          :cycle-info="planData"
          mode="header"
        />
      </view>
    </template>

    <!-- 2. 中间内容区：日模板列表 (Flex-1 + Scroll) -->
    <view class="flex-1 min-h-0 flex flex-col pt-0 px-0 pb-4 h-full">
      <TemplateManagementStep
        :templates="planData.planDays"
        :basic-info="planData"
        :cycle-info="planData"
        mode="list"
        @edit="handleEditTemplate"
        @add="handleAddTemplate"
        @copy="handleCopyTemplate"
        @delete="handleDeleteTemplate"
        @move="handleMoveTemplate"
        @long-press="handleLongPress"
      />
    </view>

    <template #footer>
      <view class="flex space-x-3">
        <view
          @click="handleBack"
          class="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-black active:bg-gray-200 transition-colors text-center"
        >
          上一步
        </view>
        <view
          @click="handleSave"
          class="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-black active:bg-emerald-700 transition-colors text-center shadow-sm"
        >
          确认计划
        </view>
      </view>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import Taro, { useRouter, useDidShow } from "@tarojs/taro";
import { ref } from "vue";
import { navigateTo, navigateBack, switchTab, ROUTES } from "@/router";
import PageLayout from "@/components/common/PageLayout.vue";
import TemplateManagementStep from "@/components/plan-creator/TemplateManagementStep.vue";
import { usePlanStore } from "@/stores/plan";
import { planService } from "@/services";
import { showSuccess, showError, showLoading, hideToast } from "@/utils/toast";

const planStore = usePlanStore();
const router = useRouter();
const planId = Number(router.params.id || router.params.planId);

const planData = ref<any>(null);

useDidShow(() => {
  loadData();
});

const loadData = async () => {
  if (!planId) return;
  try {
    showLoading("加载中...");
    const res: any = await planService.getPlanDetail(planId);
    planData.value = res.data || res;
  } catch (e) {
    showError("加载失败");
  } finally {
    hideToast();
  }
};

const handleBack = () => navigateBack();

const handleEditTemplate = (index: number) => {
  const day = planData.value.planDays[index];
  if (!day) return;
  navigateTo(ROUTES.EDIT_TEMPLATE, { 
    dayId: String(day.id), 
    planId: String(planId) 
  });
};

const handleAddTemplate = async () => {
  if (planData.value.planDays.length >= planData.value.cycleDays) {
    Taro.showToast({ title: "已达到周期天数上限", icon: "none" });
    return;
  }

  try {
    showLoading("正在添加...");
    await planService.createPlanDay(planId, {
      dayNumber: planData.value.planDays.length + 1,
    });
    loadData();
  } catch (e) {
    showError("添加失败");
  }
};

const handleCopyTemplate = async (index: number) => {
  if (planData.value.planDays.length >= planData.value.cycleDays) {
    Taro.showToast({ title: "已达到周期天数上限", icon: "none" });
    return;
  }

  const sourceDay = planData.value.planDays[index];
  if (!sourceDay) return;

  try {
    // 构造复制后的列表
    const newList = [...planData.value.planDays];
    const copiedDay = JSON.parse(JSON.stringify(sourceDay));
    // 插入到当前项之后
    newList.splice(index + 1, 0, copiedDay);
    
    await convertAndSave(newList);
    showSuccess("复制成功");
  } catch (e) {
    showError("复制失败");
  }
};

const handleDeleteTemplate = async (index: number) => {
  const day = planData.value.planDays[index];
  if (!day) return;

  if (planData.value.planDays.length <= 1) {
    Taro.showToast({ title: "至少保留一天", icon: "none" });
    return;
  }

  Taro.showModal({
    title: '确认删除',
    content: `确定要删除第 ${index + 1} 天的模板吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          showLoading("正在删除...");
          await planService.removePlanDay(day.id);
          loadData();
        } catch (e) {
          showError("删除失败");
        }
      }
    }
  });
};

const handleMoveTemplate = async (fromIndex: number, direction: 'up' | 'down') => {
  const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
  if (toIndex < 0 || toIndex >= planData.value.planDays.length) return;

  try {
    const newList = [...planData.value.planDays];
    const item = newList.splice(fromIndex, 1)[0];
    newList.splice(toIndex, 0, item);
    
    await convertAndSave(newList);
    showSuccess("移动成功");
  } catch (e) {
    showError("移动失败");
  }
};

const convertAndSave = async (newList: any[]) => {
  // 转换 DTO 格式并重新编号
  const templates = newList.map((day, i) => ({
    dayNumber: i + 1,
    carbType: day.carbType,
    targetCalories: day.targetCalories || 0,
    targetProtein: day.targetProtein || 0,
    targetFat: day.targetFat || 0,
    targetCarbs: day.targetCarbs || 0,
    meals: day.planMeals?.map((meal: any) => ({
      mealTypeId: meal.mealType?.id || meal.mealTypeId,
      scheduledTime: meal.scheduledTime,
      note: meal.note,
      items: meal.mealItems?.map((item: any) => ({
        foodItemId: item.foodItemId,
        customName: item.customName,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        fat: item.fat,
        carbs: item.carbs,
        fiber: item.fiber,
        sortOrder: item.sortOrder
      })) || []
    })) || []
  }));

  showLoading("同步配置...");
  await planService.savePlanTemplates(planId, { templates });
  await loadData();
};

const handleLongPress = (index: number) => {
  const total = planData.value.planDays.length;
  const options = ["复制该天"];
  
  if (index > 0) options.push("向上移动");
  if (index < total - 1) options.push("向下移动");
  options.push("删除该天");

  Taro.showActionSheet({
    itemList: options,
    success: (res) => {
      const selected = options[res.tapIndex];
      if (selected === "复制该天") handleCopyTemplate(index);
      else if (selected === "向上移动") handleMoveTemplate(index, 'up');
      else if (selected === "向下移动") handleMoveTemplate(index, 'down');
      else if (selected === "删除该天") handleDeleteTemplate(index);
    },
    fail: () => {},
  }).catch(() => {});
};

const handleSave = async () => {
  try {
    showLoading("正在提交...");
    await planService.updatePlan(planId, {
      status: "configured" as any,
    });
    showSuccess("计划配置完成！");
    planStore.resetDraft();
    setTimeout(() => {
      switchTab(ROUTES.PLAN_OVERVIEW);
    }, 1500);
  } catch (e: any) {
    showError(e.message || "提交失败");
  } finally {
    hideToast();
  }
};
</script>

<style scoped>
.hero-title {
  font-family: "Noto Serif SC", serif;
}
</style>
