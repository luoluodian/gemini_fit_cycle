<template>
  <view class="template-management-step h-full flex flex-col min-h-0">
    <!-- 1. 模式：Header (计划摘要与进度) -->
    <template v-if="mode === 'header'">
      <GlassCard
        background="#ffffff"
        card-class="p-6 border-[1rpx] border-solid border-gray-200"
        radius="xl"
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

        <!-- 碳循环阶段摘要 -->
        <view v-if="isCarbCycle" class="border-t border-gray-50 border-solid mt-4 pt-4">
          <view class="flex items-center justify-around">
            <view class="flex flex-col items-center">
              <view
                class="w-2.5 h-2.5 rounded-full bg-yellow-400 mb-1.5 shadow-sm"
              ></view>
              <text class="text-[20rpx] font-black text-gray-500"
                >高碳 {{ highDays }}天</text
              >
            </view>
            <view class="flex flex-col items-center">
              <view
                class="w-2.5 h-2.5 rounded-full bg-emerald-400 mb-1.5 shadow-sm"
              ></view>
              <text class="text-[20rpx] font-black text-gray-500"
                >中碳 {{ mediumDays }}天</text
              >
            </view>
            <view class="flex flex-col items-center">
              <view
                class="w-2.5 h-2.5 rounded-full bg-blue-400 mb-1.5 shadow-sm"
              ></view>
              <text class="text-[20rpx] font-black text-gray-500"
                >低碳 {{ lowDays }}天</text
              >
            </view>
          </view>
        </view>

        <!-- 操作提示集成 -->
        <view
          class="mt-5 p-3 bg-blue-50/50 rounded-xl border border-solid border-blue-100 flex items-center space-x-3"
        >
          <view
            class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <text class="text-[18rpx]">💡</text>
          </view>
          <text
            class="text-[20rpx] text-blue-600 font-black leading-tight flex-1"
          >
            点击日模板右侧菜单，可灵活调整顺序、复制或删除天数。
          </text>
        </view>
      </GlassCard>
    </template>

    <!-- 2. 模式：List (日模板列表) -->
    <template v-else-if="mode === 'list'">
      <GlassCard
        background="#ffffff"
        card-class="p-6 border-[1rpx] border-solid border-gray-200 flex-1 flex flex-col min-h-0 h-full"
        radius="2xl"
        :border="false"
      >
        <view class="flex items-center justify-between mb-6 flex-shrink-0">
          <h3 class="text-lg font-black text-gray-800 flex items-center">
            <view class="w-1 h-4 bg-emerald-500 rounded-full mr-2"></view>
            日模板列表
          </h3>
        </view>

        <BaseScrollView
          :flex="true"
          scroll-view-class="flex-1 min-h-0"
          content-class="space-y-4 pb-4"
        >
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

            <!-- 内容 -->
            <view class="flex-1 min-w-0 px-1">
              <view class="flex items-center justify-between mb-1.5">
                <view class="flex items-center space-x-2">
                  <text class="font-black text-gray-800 text-base"
                    >第 {{ index + 1 }} 天</text
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
                <text class="text-[18rpx] text-gray-300 font-black"
                  >第 {{ Math.floor(index / 7) + 1 }} 周期</text
                >
              </view>

              <view class="truncate">
                <text
                  v-if="template.name"
                  class="text-sm text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded border border-solid border-emerald-100"
                  >{{ template.name }}</text
                >
                <text
                  v-else-if="!template.isConfigured && !isCarbCycle"
                  class="text-sm text-gray-400 font-medium"
                  >未配置</text
                >
                <view
                  v-else
                  class="flex items-center space-x-2 text-[20rpx] text-gray-400 font-bold"
                >
                  <view class="flex items-center text-gray-600">
                    <text class="mr-0.5 opacity-50">⚡</text>
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

            <!-- 操作菜单按钮 (⋮) -->
            <view
              class="w-10 h-10 flex items-center justify-center rounded-xl active:bg-black/5 transition-colors ml-2"
              @tap.stop="$emit('long-press', index)"
            >
              <view class="flex flex-col space-y-0.5 items-center">
                <view class="w-1 h-1 rounded-full bg-gray-300"></view>
                <view class="w-1 h-1 rounded-full bg-gray-300"></view>
                <view class="w-1 h-1 rounded-full bg-gray-300"></view>
              </view>
            </view>
          </view>

          <!-- 新增按钮 -->
          <view
            v-if="templates.length < cycleDays"
            class="w-full mt-2 flex items-center justify-center p-5 border-[1rpx] border-solid border-emerald-200 bg-emerald-50/20 rounded-2xl active:bg-emerald-50 transition-all shadow-sm"
            @tap="handleAddTemplate"
          >
            <text class="text-sm font-black text-emerald-600"
              >+ 新增日模板 ({{ templates.length }}/{{ cycleDays }})</text
            >
          </view>
        </BaseScrollView>
      </GlassCard>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GlassCard from "../common/GlassCard.vue";
import BaseScrollView from "../common/BaseScrollView.vue";

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
  mode?: "header" | "list";
}

const props = withDefaults(defineProps<Props>(), {
  mode: "list",
});
const emit = defineEmits([
  "update:templates",
  "edit",
  "add",
  "auto-fill",
  "copy",
  "delete",
  "move",
  "long-press",
]);

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
</script>
