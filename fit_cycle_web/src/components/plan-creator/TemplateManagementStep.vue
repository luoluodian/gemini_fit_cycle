<template>
  <view class="template-management-step space-y-6">
    <!-- 1. 计划摘要卡片 -->
    <GlassCard
      background="#ffffff"
      card-class="p-6 border-[1rpx] border-solid border-gray-200"
      radius="lg"
      :border="false"
    >
      <view class="flex items-center justify-between">
        <view class="flex-1 min-w-0">
          <text class="text-lg font-bold text-gray-800 block truncate">{{
            basicInfo.name || "新饮食计划"
          }}</text>
          <view class="flex items-center mt-1 space-x-2">
            <text
              class="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-solid border-gray-100 font-medium"
              >{{ typeLabel }}</text
            >
            <text class="text-xs text-gray-400 font-medium"
              >{{ cycleDays }}天 × {{ cycleCount }}周期</text
            >
          </view>
        </view>
        <view class="text-right ml-4 flex-shrink-0">
          <text
            class="text-[20rpx] text-gray-400 block mb-1 font-bold uppercase tracking-wider"
            >配置进度</text
          >
          <view class="flex items-baseline justify-end">
            <text class="text-2xl font-black text-emerald-600 leading-none">{{
              configuredCount
            }}</text>
            <text class="text-xs font-bold text-gray-300 mx-1">/</text>
            <text class="text-sm font-bold text-gray-400">{{ cycleDays }}</text>
          </view>
        </view>
      </view>

      <!-- 碳循环阶段摘要 (仅碳循环类型显示) -->
      <view
        v-if="isCarbCycle"
        class="mt-6 pt-6 border-t border-gray-50 border-solid"
      >
        <view class="flex items-center justify-around">
          <view class="flex flex-col items-center">
            <view
              class="w-2.5 h-2.5 rounded-full bg-yellow-400 mb-1.5 shadow-sm shadow-yellow-100"
            ></view>
            <text class="text-[20rpx] font-black text-gray-500"
              >高碳 {{ highDays }}天</text
            >
          </view>
          <view class="flex flex-col items-center">
            <view
              class="w-2.5 h-2.5 rounded-full bg-emerald-400 mb-1.5 shadow-sm shadow-emerald-100"
            ></view>
            <text class="text-[20rpx] font-black text-gray-500"
              >中碳 {{ mediumDays }}天</text
            >
          </view>
          <view class="flex flex-col items-center">
            <view
              class="w-2.5 h-2.5 rounded-full bg-blue-400 mb-1.5 shadow-sm shadow-blue-100"
            ></view>
            <text class="text-[20rpx] font-black text-gray-500"
              >低碳 {{ lowDays }}天</text
            >
          </view>
        </view>
      </view>
    </GlassCard>

    <!-- 2. 日模板列表容器 -->
    <GlassCard
      background="#ffffff"
      card-class="p-6 border-[1rpx] border-solid border-gray-200"
      radius="2xl"
      :border="false"
    >
      <view class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-black text-gray-800 flex items-center">
          <view class="w-1 h-4 bg-emerald-500 rounded-full mr-2"></view>
          日模板列表
        </h3>
        <view
          class="px-3 py-1 bg-emerald-50 text-emerald-600 text-[20rpx] font-black rounded-lg border border-solid border-emerald-100 active:scale-95 transition-all"
          @tap="handleAutoFill"
        >
          自动填充
        </view>
      </view>

      <view class="space-y-4">
        <view
          v-for="(template, index) in templates"
          :key="template.tempId"
          :class="[
            'template-card relative flex items-center p-4 rounded-2xl border-[1rpx] border-solid transition-all active:scale-[0.98] shadow-sm',
            getPhaseStyles(template).border,
            getPhaseStyles(template).bg,
          ]"
          @tap="handleEdit(index)"
        >
          <!-- 侧边色条 -->
          <view
            v-if="isCarbCycle"
            :class="[
              'absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl',
              getPhaseStyles(template).bar,
            ]"
          ></view>

          <!-- 拖拽手柄 -->
          <view class="drag-handle p-2 -ml-1 text-gray-300" @tap.stop>
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 8h16M4 16h16"
              ></path>
            </svg>
          </view>

          <!-- 内容 -->
          <view class="flex-1 min-w-0 px-3">
            <view class="flex items-center justify-between mb-1.5">
              <view class="flex items-center space-x-2">
                <text class="font-black text-gray-800 text-base"
                  >Day {{ index + 1 }}</text
                >
                <view
                  v-if="isCarbCycle"
                  :class="[
                    'px-2 py-0.5 rounded-full text-[18rpx] font-black uppercase tracking-tighter',
                    getPhaseStyles(template).labelBg,
                    getPhaseStyles(template).labelColor,
                  ]"
                >
                  {{ getPhaseStyles(template).icon }}
                  {{ getPhaseStyles(template).text }}
                </view>
              </view>
              <text
                class="text-[18rpx] text-gray-300 font-black uppercase tracking-widest"
                >Cycle {{ Math.floor(index / 7) + 1 }}</text
              >
            </view>

            <view class="truncate">
              <text
                v-if="template.name"
                class="text-sm text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded border border-solid border-emerald-100"
                >{{ template.name }}</text
              >
              <view
                v-else
                class="flex items-center space-x-3 text-[20rpx] text-gray-400 font-bold"
              >
                <view class="flex items-center text-gray-600">
                  <text class="mr-1 opacity-50">⚡</text>
                  <text>{{ template.targetCalories }}</text>
                  <text class="ml-0.5 opacity-50">kcal</text>
                </view>
                <text class="opacity-20 text-gray-200">|</text>
                <text>蛋 {{ template.protein }}g</text>
                <text>脂 {{ template.fat }}g</text>
                <text>碳 {{ template.carbs }}g</text>
              </view>
            </view>
          </view>

          <!-- 操作 -->
          <view class="flex items-center space-x-1 ml-2">
            <view
              class="p-2 active:bg-emerald-50 rounded-xl transition-colors border border-solid border-transparent"
              @tap.stop="handleCopy(index)"
            >
              <svg
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                ></path>
              </svg>
            </view>
            <view
              class="p-2 active:bg-red-50 rounded-xl transition-colors border border-solid border-transparent"
              @tap.stop="handleDelete(index)"
            >
              <svg
                class="w-4 h-4 text-red-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </view>
          </view>
        </view>

        <!-- 新增按钮 -->
        <view
          v-if="templates.length < cycleDays"
          class="w-full mt-6 flex items-center justify-center p-5 border-2 border-dashed border-gray-200 rounded-2xl active:bg-gray-50 transition-all"
          @tap="handleAddTemplate"
        >
          <text class="text-sm font-black text-gray-400"
            >+ 新增日模板 ({{ templates.length }}/{{ cycleDays }})</text
          >
        </view>
      </view>
    </GlassCard>

    <!-- 3. 提示卡片 -->
    <view
      class="bg-blue-50/50 rounded-2xl p-5 border-[1rpx] border-solid border-blue-100 flex items-start space-x-4 shadow-sm"
    >
      <view
        class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0"
      >
        <svg
          class="w-6 h-6 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </view>
      <view class="flex-1">
        <text class="text-sm font-black text-gray-800 block mb-1"
          >如何高效配置？</text
        >
        <text class="text-xs text-gray-500 leading-relaxed font-bold"
          >配置好一个典型日期后，点击右侧克隆按钮即可快速复制。在保存前，您可以随意拖动调整每天的执行顺序。</text
        >
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Taro from "@tarojs/taro";
import GlassCard from "../common/GlassCard.vue";

interface Template {
  tempId: string;
  name?: string;
  targetCalories: number;
  protein: number;
  fat: number;
  carbs: number;
  isConfigured: boolean;
  carbType?: "high" | "medium" | "low";
}

interface Props {
  basicInfo: any;
  cycleInfo: any;
  templates: Template[];
}

const props = defineProps<Props>();
const emit = defineEmits(["update:templates", "edit", "add", "auto-fill"]);

const totalDays = computed(
  () => (props.cycleInfo.cycleDays || 0) * (props.cycleInfo.cycleCount || 0),
);
const cycleDays = computed(() => props.cycleInfo.cycleDays || 0);
const cycleCount = computed(() => props.cycleInfo.cycleCount || 0);
const isCarbCycle = computed(() => props.basicInfo.type === "carb-cycle");

const configuredCount = computed(
  () => props.templates.filter((t) => t.isConfigured).length,
);

const typeLabel = computed(() => {
  const map: Record<string, string> = {
    "fat-loss": "减脂",
    "muscle-gain": "增肌",
    maintenance: "维持",
    custom: "常规",
    "carb-cycle": "碳循环",
  };
  return map[props.basicInfo.type] || "常规";
});

const highDays = computed(
  () => props.templates.filter((t) => t.carbType === "high").length,
);
const mediumDays = computed(
  () => props.templates.filter((t) => t.carbType === "medium").length,
);
const lowDays = computed(
  () => props.templates.filter((t) => t.carbType === "low").length,
);

const getPhaseStyles = (template: Template) => {
  if (!isCarbCycle.value)
    return {
      bg: "bg-white",
      border: "border-gray-100",
      text: "",
      bar: "hidden",
    };
  const styles = {
    high: {
      text: "高碳",
      icon: "🔥",
      bg: "bg-yellow-50/30",
      border: "border-yellow-100",
      bar: "bg-yellow-400",
      labelBg: "bg-yellow-100",
      labelColor: "text-yellow-700",
    },
    medium: {
      text: "中碳",
      icon: "⚖️",
      bg: "bg-emerald-50/30",
      border: "border-emerald-100",
      bar: "bg-emerald-400",
      labelBg: "bg-emerald-100",
      labelColor: "text-emerald-700",
    },
    low: {
      text: "低碳",
      icon: "❄️",
      bg: "bg-blue-50/30",
      border: "border-blue-100",
      bar: "bg-blue-400",
      labelBg: "bg-blue-100",
      labelColor: "text-blue-700",
    },
  };
  return styles[template.carbType || "medium"];
};

const handleEdit = (index: number) => emit("edit", index);
const handleAddTemplate = () => emit("add");
const handleAutoFill = () => emit("auto-fill");

const handleCopy = (index: number) => {
  const newList = [...props.templates];
  const source = JSON.parse(JSON.stringify(newList[index]));
  source.tempId = "temp_" + Date.now();
  source.name = (source.name || `Day ${index + 1}`) + " (复制)";
  newList.push(source);
  emit("update:templates", newList);
  Taro.showToast({ title: "已复制", icon: "none" });
};

const handleDelete = (index: number) => {
  Taro.showModal({
    title: "确认删除",
    content: `确定要删除 Day ${index + 1} 吗？`,
    success: (res) => {
      if (res.confirm) {
        const newList = [...props.templates];
        newList.splice(index, 1);
        emit("update:templates", newList);
      }
    },
  });
};
</script>

<style scoped>
.drag-handle {
  user-select: none;
}
</style>
