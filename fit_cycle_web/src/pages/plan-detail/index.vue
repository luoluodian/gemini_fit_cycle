<template>
  <PageLayout
    v-if="plan"
    :title="plan.name"
    :subtitle="typeLabel + '计划 · 共 ' + totalDays + ' 天'"
  >
    <template #nav-right>
      <view
        @click="handleShowOptions"
        class="w-10 h-10 flex items-center justify-center rounded-xl active:bg-black/5 transition-colors"
      >
        <view class="flex flex-col space-y-0.5 items-center">
          <view class="w-1 h-1 rounded-full bg-gray-400"></view>
          <view class="w-1 h-1 rounded-full bg-gray-400"></view>
          <view class="w-1 h-1 rounded-full bg-gray-400"></view>
        </view>
      </view>
    </template>

    <!-- 2. Main Content -->
    <view class="space-y-6">
      <!-- 2.1 进度概览卡片 -->
      <view class="animate-fade-in-up">
        <GlassCard
          background="#ffffff"
          card-class="p-5 border-[1rpx] border-solid border-gray-200 shadow-lg"
          radius="2xl"
          :border="false"
        >
          <view class="flex items-center justify-between mb-4">
            <view
              :class="[
                'inline-flex items-center px-2.5 py-1 text-xs font-black rounded-full',
                statusStyles.bg,
                statusStyles.text,
              ]"
            >
              <view
                :class="['w-1.5 h-1.5 rounded-full mr-1.5', statusStyles.dot]"
              ></view>
              {{ statusStyles.label }}
            </view>
            <text class="text-2xl font-black text-emerald-600"
              >{{ progressPercent }}%</text
            >
          </view>

          <view class="flex items-end justify-between mb-5">
            <view>
              <view class="flex items-baseline">
                <text class="text-5xl font-black text-gray-800">{{
                  plan.completedDays || 0
                }}</text>
                <text class="text-xl text-gray-300 font-bold ml-1"
                  >/{{ totalDays }}天</text
                >
              </view>
              <text class="text-xs font-black text-gray-400 mt-1"
                >已完成天数</text
              >
            </view>
            <view class="text-right pb-1">
              <text class="text-sm font-black text-gray-600 block"
                >{{ typeLabel }}计划</text
              >
              <text class="text-[18rpx] text-gray-400 font-bold mt-0.5 block"
                >{{ plan.cycleDays }}天 × {{ plan.cycleCount }}周期</text
              >
            </view>
          </view>

          <view
            class="w-full bg-gray-50 rounded-full h-2.5 mb-5 overflow-hidden"
          >
            <view
              class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
              :style="{ width: progressPercent + '%' }"
            ></view>
          </view>

          <!-- 查看今日快捷按钮 -->
          <view
            v-if="plan.status === 'active'"
            class="mb-5 px-4 py-3 bg-emerald-600 rounded-2xl flex items-center justify-between active:opacity-80 transition-all shadow-md shadow-emerald-100"
            @click="handleViewToday"
          >
            <view class="flex items-center">
              <view
                class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3"
              >
                <text class="text-white text-sm">📅</text>
              </view>
              <view>
                <text class="text-white text-sm font-black block"
                  >查看今日任务</text
                >
                <text class="text-white/60 text-[18rpx] font-bold"
                  >点击进入第 {{ plan.completedDays + 1 }} 天配置</text
                >
              </view>
            </view>
            <svg
              class="w-5 h-5 text-white/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </view>

          <!-- 计划日程 (周期分组) -->
          <view
            class="bg-gray-50/80 rounded-2xl p-5 border border-solid border-gray-100"
          >
            <view class="flex items-center justify-between mb-4">
              <text class="text-sm font-black text-gray-700">计划日程</text>
              <text class="text-[18rpx] font-black text-emerald-600">{{
                remainingDaysText
              }}</text>
            </view>

            <view class="space-y-4 max-h-[600rpx] overflow-y-auto pr-1">
              <view
                v-for="c in plan.cycleCount"
                :key="c"
                class="bg-white rounded-xl p-4 border border-solid border-gray-100 shadow-sm"
              >
                <view class="flex items-center justify-between mb-2.5">
                  <text class="text-xs font-black text-gray-500"
                    >第 {{ c }} 周期</text
                  >
                  <text
                    :class="[
                      'text-[16rpx] font-black px-2 py-0.5 rounded',
                      getCycleStatus(c).class,
                    ]"
                  >
                    {{ getCycleStatus(c).label }}
                  </text>
                </view>
                <view class="grid grid-cols-7 gap-2">
                  <view
                    v-for="d in plan.cycleDays"
                    :key="d"
                    :class="[
                      'aspect-square rounded-lg flex items-center justify-center text-xs font-black relative transition-all active:scale-95',
                      getDayStyles(c, d).class,
                    ]"
                    @click="handleViewDay(c, d)"
                  >
                    {{ (c - 1) * plan.cycleDays + d }}
                    <!-- 碳循环小点 -->
                    <view
                      v-if="getDayPhaseColor(d)"
                      :class="[
                        'absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-solid border-white',
                        getDayPhaseColor(d),
                      ]"
                    ></view>
                  </view>
                </view>
              </view>
            </view>

            <!-- 图例 -->
            <view
              class="mt-4 pt-3 border-t border-solid border-gray-100 flex items-center justify-center space-x-4 text-[16rpx] font-black text-gray-400"
            >
              <view class="flex items-center"
                ><view class="w-2 h-2 rounded bg-emerald-500 mr-1"></view
                >已完成</view
              >
              <view class="flex items-center"
                ><view
                  class="w-2 h-2 rounded bg-white border border-solid border-emerald-500 mr-1"
                ></view
                >今天</view
              >
              <view class="flex items-center"
                ><view class="w-2 h-2 rounded bg-gray-200 mr-1"></view
                >未开始</view
              >
            </view>
          </view>
        </GlassCard>
      </view>

      <!-- 2.2 碳循环配置 (可选) -->
      <view
        v-if="plan.type === 'carb-cycle' && plan.carbCycleConfig"
        class="animate-fade-in-up delay-100"
      >
        <GlassCard
          background="#ffffff"
          card-class="p-5 border-[1rpx] border-solid border-gray-200 shadow-lg"
          radius="2xl"
          :border="false"
        >
          <view class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-black text-gray-800 flex items-center">
              <view class="w-1 h-4 bg-blue-500 rounded-full mr-2"></view>
              碳循环配置
            </h3>
            <text class="text-[18rpx] text-gray-400 font-bold">体重与配比</text>
          </view>

          <view
            class="bg-blue-50/30 rounded-2xl p-4 border border-solid border-blue-100 mb-4 text-center"
          >
            <text class="text-xs font-black text-blue-400 block mb-1"
              >当前体重</text
            >
            <view class="flex items-baseline justify-center">
              <text class="text-3xl font-black text-blue-700">{{
                plan.carbCycleConfig.weight
              }}</text>
              <text class="text-sm font-black text-blue-400 ml-1">kg</text>
            </view>
          </view>

          <view class="grid grid-cols-3 gap-3 mb-6">
            <view
              v-for="(val, key) in plan.carbCycleConfig.baseRatios"
              :key="key"
              class="text-center p-2.5 bg-gray-50 rounded-xl border border-solid border-gray-100"
            >
              <text class="text-[16rpx] text-gray-400 font-black block mb-1">{{
                getRatioLabel(key)
              }}</text>
              <text class="text-sm font-black text-gray-700"
                >{{ val
                }}<text class="text-[14rpx] ml-0.5 text-gray-400"
                  >g/kg</text
                ></text
              >
            </view>
          </view>

          <!-- 阶段列表 -->
          <view class="space-y-3">
            <view
              v-for="(config, phase) in plan.carbCycleConfig.phases"
              :key="phase"
              :class="[
                'p-4 rounded-2xl border border-solid shadow-sm',
                getPhaseStyles(phase).bg,
                getPhaseStyles(phase).border,
              ]"
            >
              <view class="flex items-center justify-between mb-3">
                <view class="flex items-center">
                  <view
                    :class="[
                      'w-8 h-8 rounded-lg flex items-center justify-center mr-3 shadow-sm',
                      getPhaseStyles(phase).iconBg,
                    ]"
                  >
                    <text class="text-lg">{{
                      getPhaseStyles(phase).icon
                    }}</text>
                  </view>
                  <view>
                    <text class="text-sm font-black text-gray-800">{{
                      getPhaseStyles(phase).name
                    }}</text>
                    <text
                      :class="[
                        'text-[16rpx] font-bold block',
                        getPhaseStyles(phase).text,
                      ]"
                      >{{ getPhaseStyles(phase).desc }}</text
                    >
                  </view>
                </view>
                <text class="text-xs font-black text-gray-500"
                  >{{ config.days }} 天/周期</text
                >
              </view>
              <view
                class="bg-white/60 rounded-xl p-2.5 grid grid-cols-3 gap-2 text-center"
              >
                <view>
                  <text class="text-[16rpx] text-gray-400 font-black block"
                    >蛋白质</text
                  >
                  <text class="text-xs font-black text-blue-600"
                    >{{ phaseDetailResults?.[phase]?.protein }}g</text
                  >
                </view>
                <view>
                  <text class="text-[16rpx] text-gray-400 font-black block"
                    >碳水</text
                  >
                  <text class="text-xs font-black text-emerald-600"
                    >{{ phaseDetailResults?.[phase]?.carbs }}g</text
                  >
                </view>
                <view>
                  <text class="text-[16rpx] text-gray-400 font-black block"
                    >脂肪</text
                  >
                  <text class="text-xs font-black text-red-600"
                    >{{ phaseDetailResults?.[phase]?.fat }}g</text
                  >
                </view>
              </view>
            </view>
          </view>
        </GlassCard>
      </view>
    </view>

    <template #footer v-if="plan">
      <view class="flex space-x-3 w-full">
        <BaseButton class="flex-1" type="secondary" @click="handleBack"
          >返回上一页</BaseButton
        >

        <BaseButton
          v-if="plan.status !== 'active'"
          class="flex-[2]"
          type="primary"
          @click="handleActivate"
          >激活此计划</BaseButton
        >
      </view>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Taro, { useRouter } from "@tarojs/taro";
import PageLayout from "@/components/common/PageLayout.vue";
import GlassCard from "@/components/common/GlassCard.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import { planService } from "@/services";
import { usePlanStore } from "@/stores/plan";
import { calculateCarbCycle } from "@/utils/carb-cycle-algo";
import { showSuccess, showError, showLoading, hideToast } from "@/utils/toast";

const router = useRouter();
const planId = Number(router.params.id);
const _planStore = usePlanStore();

const plan = ref<any>(null);

onMounted(() => {
  // 延迟加载以防阻塞页面进入动画
  setTimeout(() => {
    fetchDetail();
  }, 100);
});

const fetchDetail = async () => {
  if (!planId) return;
  try {
    showLoading("加载中...");
    const res: any = await planService.getPlanDetail(planId);
    // 兼容后端结构并确保响应式
    const data = res.data || res;
    if (data) {
      plan.value = data;
    } else {
      showError("未找到计划数据");
    }
  } catch (e) {
    console.error("Fetch Plan Detail Error:", e);
    showError("获取详情失败");
  } finally {
    hideToast();
  }
};

const totalDays = computed(() => {
  if (!plan.value) return 0;
  return (
    (Number(plan.value.cycleDays) || 0) * (Number(plan.value.cycleCount) || 0)
  );
});

const progressPercent = computed(() => {
  if (!plan.value || !totalDays.value) return 0;
  return Math.min(
    100,
    Math.round(
      ((Number(plan.value.completedDays) || 0) / totalDays.value) * 100,
    ),
  );
});

const remainingDaysText = computed(() => {
  if (!plan.value) return "加载中...";
  const remaining = totalDays.value - (Number(plan.value.completedDays) || 0);
  return `还剩 ${Math.max(0, remaining)} 天`;
});

const statusStyles = computed(() => {
  const map: any = {
    active: {
      label: "进行中",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    paused: {
      label: "已暂停",
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      dot: "bg-yellow-500",
    },
    completed: {
      label: "已完成",
      bg: "bg-gray-100",
      text: "text-gray-500",
      dot: "bg-gray-400",
    },
    draft: {
      label: "草稿",
      bg: "bg-blue-50",
      text: "text-blue-700",
      dot: "bg-blue-500",
    },
  };
  return map[plan.value?.status] || map.draft;
});

const typeLabel = computed(() => {
  const map: any = {
    "carb-cycle": "碳循环",
    custom: "常规",
    "fat-loss": "减脂",
    "muscle-gain": "增肌",
  };
  return map[plan.value?.type] || "常规";
});

const getCycleStatus = (c: number) => {
  const completed = plan.value?.completedDays || 0;
  const cycleDays = plan.value?.cycleDays || 0;
  if (completed >= c * cycleDays)
    return { label: "已完成", class: "bg-emerald-100 text-emerald-700" };
  if (completed >= (c - 1) * cycleDays)
    return { label: "进行中", class: "bg-blue-100 text-blue-700" };
  return { label: "待开始", class: "bg-gray-100 text-gray-400" };
};

const getDayStyles = (c: number, d: number) => {
  const currentDay = (c - 1) * (plan.value?.cycleDays || 0) + d;
  const completed = plan.value?.completedDays || 0;
  if (currentDay <= completed) return { class: "bg-emerald-500 text-white" };
  if (currentDay === completed + 1 && plan.value?.status === "active") {
    return {
      class:
        "bg-white text-emerald-600 border-[2rpx] border-solid border-emerald-500 shadow-[0_0_10rpx_rgba(16,185,129,0.2)]",
    };
  }
  return { class: "bg-gray-100 text-gray-400" };
};

const getDayPhaseColor = (d: number) => {
  if (plan.value?.type !== "carb-cycle" || !plan.value?.planDays) return null;
  // 查找对应天模板的类型
  const dayInCycle = d; // 1-7
  const template = plan.value.planDays.find(
    (pd: any) => pd.dayNumber === dayInCycle,
  );
  if (!template) return null;
  const colors: any = {
    high: "bg-yellow-400",
    medium: "bg-emerald-400",
    low: "bg-blue-400",
  };
  return colors[template.carbType];
};

const getRatioLabel = (key: string) => {
  const map: any = { protein: "蛋白质", carbs: "碳水", fat: "脂肪" };
  return map[key] || key;
};

const getPhaseStyles = (phase: string) => {
  const map: any = {
    high: {
      name: "高碳日",
      desc: "增加碳水摄入",
      icon: "🔥",
      bg: "bg-yellow-50/50",
      border: "border-yellow-100",
      iconBg: "bg-yellow-100",
      text: "text-yellow-600",
    },
    medium: {
      name: "中碳日",
      desc: "基准比例配置",
      icon: "⚖️",
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
      iconBg: "bg-emerald-100",
      text: "text-emerald-600",
    },
    low: {
      name: "低碳日",
      desc: "严格控制碳水",
      icon: "❄️",
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      iconBg: "bg-blue-100",
      text: "text-blue-600",
    },
  };
  return map[phase];
};

const phaseDetailResults = computed(() => {
  if (plan.value?.type !== "carb-cycle" || !plan.value?.carbCycleConfig)
    return null;
  return calculateCarbCycle({
    weight: plan.value.carbCycleConfig.weight,
    cycleDays: plan.value.cycleDays,
    baseRatios: plan.value.carbCycleConfig.baseRatios,
    phases: plan.value.carbCycleConfig.phases,
  }).phaseResults;
});

const handleShowOptions = () => {
  const options = ["编辑计划", "暂停计划", "分享计划", "导出数据", "删除计划"];
  if (plan.value?.status === "paused") options[1] = "激活计划";

  Taro.showActionSheet({
    itemList: options,
    confirmColor: "#10b981",
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          handleEditPlan();
          break;
        case 1:
          plan.value?.status === "paused" ? handleActivate() : handlePause();
          break;
        case 2:
          handleShare();
          break;
        case 3:
          showError("导出功能开发中");
          break;
        case 4:
          handleDelete();
          break;
      }
    },
  });
};

const handleShare = async () => {
  try {
    showLoading("生成分享码...");
    const res = await planService.sharePlan(planId);
    hideToast();

    Taro.showModal({
      title: "计划分享",
      content: `分享码：${res.code}\n\n有效期至：${new Date(res.expireAt).toLocaleDateString()}\n\n已为您自动复制分享码。`,
      confirmText: "我知道了",
      showCancel: false,
    });

    Taro.setClipboardData({
      data: res.code,
      success: () => {
        // Taro 会自动弹出系统 Toast
      },
    });
  } catch (e) {
    showError("生成失败");
  }
};

const handleEditPlan = () => {
  if (!plan.value) return;
  // 直接跳转到 plan-templates 页，复用配置流程
  Taro.navigateTo({ url: `/pages/plan-templates/index?id=${planId}` });
};

const handleActivate = async () => {
  try {
    showLoading("正在激活...");
    await planService.activatePlan(planId);
    showSuccess("计划已激活");
    fetchDetail();
  } catch (e) {
    showError("激活失败");
  }
};

const handlePause = async () => {
  try {
    showLoading("正在暂停...");
    await planService.pausePlan(planId);
    showSuccess("计划已暂停");
    fetchDetail();
  } catch (e) {
    showError("暂停失败");
  }
};

const handleBack = () => Taro.navigateBack();

const handleDelete = () => {
  Taro.showModal({
    title: "确认删除",
    content: "删除后计划及其所有记录将无法恢复，确定吗？",
    confirmColor: "#ef4444",
    success: async (res) => {
      if (res.confirm) {
        try {
          await planService.deletePlan(planId);
          showSuccess("已删除");
          setTimeout(() => Taro.navigateBack(), 1000);
        } catch (e) {
          showError("删除失败");
        }
      }
    },
  });
};

const handleViewDay = (c: number, d: number) => {
  // 根据周期和日序号计算绝对 dayNumber (后端存储的 dayNumber 通常是 1-cycleDays)
  // 如果 planDays 存储的是 1 到 cycleDays 的模板，则直接查找 d
  // 如果 planDays 展开了所有周期 (例如 1-28)，则需要 (c-1)*cycleDays + d
  // 根据 V7 设计，planDays 只存储一个周期的模板 (1-cycleDays)
  const dayInCycle = d;
  const day = plan.value.planDays?.find(
    (pd: any) => pd.dayNumber === dayInCycle,
  );

  if (day) {
    Taro.navigateTo({
      url: `/pages/edit-template/index?planId=${planId}&dayId=${day.id}&mode=edit`,
    });
  } else {
    showError("未找到该天数据");
  }
};

const handleViewToday = () => {
  const todayDayNumber = (plan.value?.completedDays || 0) + 1;
  Taro.navigateTo({
    url: `/pages/daily-plan/index?planId=${planId}&day=${todayDayNumber}`,
  });
};
</script>

<style scoped lang="scss">
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}
.delay-200 {
  animation-delay: 0.2s;
}
</style>
