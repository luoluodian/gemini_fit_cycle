<template>
  <BaseModal
    :visible="modalVisible"
    :show-header="false"
    position="center"
    @close="handleClose"
    @update="(val) => (modalVisible = val)"
    style="width: 90vw"
  >
    <!-- 标题栏 (增加删除与收藏) -->
    <view class="flex items-center justify-between mb-3 relative">
      <view class="w-10">
        <view
          v-if="props.editingFood"
          class="p-1 text-red-400 active:opacity-60"
          @click="$emit('delete', props.editingFood)"
        >
          <Del :size="22"></Del>
        </view>
      </view>

      <text class="text-lg font-semibold text-gray-800">{{
        props.editingFood ? "编辑食材" : "创建食材"
      }}</text>

      <view class="w-10 flex justify-end">
        <view
          v-if="props.editingFood"
          class="p-1 transition-all active:scale-95"
          @click="$emit('toggleFavorite', props.editingFood)"
        >
          <HeartFill
            v-if="props.editingFood.isFavorite"
            :size="22"
            color="#ef4444"
          ></HeartFill>
          <Heart v-else :size="22" color="#d1d5db"></Heart>
        </view>
      </view>
    </view>

    <view class="space-y-3">
      <!-- 名称和单位在一行展示 -->
      <view class="flex items-center gap-3">
        <view class="flex flex-1 items-center gap-2">
          <text class="text-sm font-medium text-gray-700 whitespace-nowrap"
            >名称</text
          >
          <input
            v-model="formData.name"
            type="text"
            class="flex-1 px-3 py-1.5 border-[1rpx] border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
            placeholder="例如：自制沙拉"
            @input="(e: any) => handleNameInput(e.detail.value)"
          />
        </view>
        <view class="flex items-center gap-2 w-32">
          <text class="text-sm font-medium text-gray-700 whitespace-nowrap"
            >单位</text
          >
          <picker
            :value="unitIndex"
            :range="unitLabels"
            @change="handleUnitChange"
            class="flex-1"
          >
            <view
              class="py-1.5 border-[1rpx] border-solid border-gray-300 rounded-lg flex items-center justify-between bg-white px-2"
            >
              <text class="text-xs text-gray-800">{{
                unitLabels[unitIndex]
              }}</text>
              <image
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTY5RkExIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTE5IDlsLTcgNy03LTciLz48L3N2Zz4="
                class="w-3 h-3 opacity-40 ml-1"
              />
            </view>
          </picker>
        </view>
      </view>

      <!-- 相似食材提醒 -->
      <view v-if="similarFoods.length > 0" class="px-2 animate-fade-in">
        <text class="text-[18rpx] text-gray-400 font-bold mb-1 block">库中已有类似食材：</text>
        <view class="flex flex-wrap gap-2">
          <view 
            v-for="sf in similarFoods" 
            :key="sf.id"
            class="px-2 py-0.5 bg-gray-50 border border-solid border-gray-200 rounded-md flex items-center gap-1 active:bg-emerald-50"
            @click="$emit('select-similar', sf)"
          >
            <text class="text-[18rpx]">{{ sf.imageUrl || '🥗' }}</text>
            <text class="text-[18rpx] text-gray-600 font-bold">{{ sf.name }}</text>
          </view>
        </view>
      </view>

      <!-- 分类标签在一行展示 -->
      <view class="flex items-center gap-2 py-1 overflow-hidden">
        <text class="text-sm font-medium text-gray-700 whitespace-nowrap"
          >标签</text
        >
        <view class="flex-1" style="min-width: 0">
          <BaseScrollView
            :scroll-x="true"
            :scroll-y="false"
            height="70rpx"
            content-class="items-center gap-2 pr-4"
          >
            <view
              v-for="cat in categoryOptions"
              :key="cat.key"
              class="px-3 py-1 text-[22rpx] rounded-lg border border-solid transition-all whitespace-nowrap inline-flex items-center flex-shrink-0"
              :style="
                formData.category === cat.key
                  ? 'background-color: #10b981; color: #fff; border-color: #10b981;'
                  : 'background-color: #fff; color: #6b7280; border-color: #e5e7eb;'
              "
              @click="
                formData.category = cat.key;
                formData.imageUrl = cat.emoji;
              "
            >
              <text class="mr-1">{{ cat.emoji }}</text>
              <text>{{ cat.label }}</text>
            </view>
          </BaseScrollView>
        </view>
      </view>

      <!-- 营养成分输入 -->
      <view
        class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100"
      >
        <view class="flex items-center justify-center gap-1 mb-2">
          <view class="w-1.5 h-1.5 rounded-full bg-emerald-500"></view>
          <text class="text-[18rpx] font-medium text-emerald-700">每</text>
          <input
            v-model="formData.baseCount"
            type="number"
            class="w-12 h-5 border-[1rpx] border-solid border-emerald-300 rounded px-1 text-center text-[20rpx] text-emerald-700 font-bold bg-white"
            placeholder="100"
          />
          <text class="text-[18rpx] font-medium text-emerald-700"
            >{{ displayUnit(formData.unit) }} 营养成分</text
          >
        </view>
        <view class="grid grid-cols-2 gap-2">
          <view class="bg-white rounded-lg p-1.5 border border-orange-100">
            <text class="block text-[18rpx] text-orange-600 font-medium mb-0.5"
              >🔥 热量 ({{ displayUnit("kcal") }})</text
            >
            <input
              v-model="formData.calories"
              type="number"
              class="px-1 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-400 text-xs bg-gray-50"
              placeholder="0"
            />
          </view>
          <view class="bg-white rounded-lg p-1.5 border border-rose-100">
            <text class="block text-[18rpx] text-rose-600 font-medium mb-0.5"
              >💪 蛋白质 ({{ displayUnit("g") }})</text
            >
            <input
              v-model="formData.protein"
              type="number"
              class="px-1 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-rose-400 text-xs bg-gray-50"
              placeholder="0"
            />
          </view>
          <view class="bg-white rounded-lg p-1.5 border border-yellow-100">
            <text class="block text-[18rpx] text-yellow-600 font-medium mb-0.5"
              >🧈 脂肪 ({{ displayUnit("g") }})</text
            >
            <input
              v-model="formData.fat"
              type="number"
              class="px-1 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-yellow-400 text-xs bg-gray-50"
              placeholder="0"
            />
          </view>
          <view class="bg-white rounded-lg p-1.5 border border-amber-100">
            <text class="block text-[18rpx] text-amber-600 font-medium mb-0.5"
              >🌾 碳水 ({{ displayUnit("g") }})</text
            >
            <input
              v-model="formData.carbs"
              type="number"
              class="px-1 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-amber-400 text-xs bg-gray-50"
              placeholder="0"
            />
          </view>
        </view>
      </view>

      <!-- 描述 -->
      <view class="w-full">
        <textarea
          v-model="formData.description"
          class="w-full py-1.5 px-3 border-[1rpx] border-solid border-gray-300 rounded-lg text-sm h-12 focus:ring-2 focus:ring-emerald-500"
          style="box-sizing: border-box"
          placeholder="简单描述这个食材...（可选）"
        ></textarea>
      </view>

      <!-- 公开食材 -->
      <view
        class="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-2 border border-purple-100"
      >
        <view class="flex items-center gap-2">
          <view
            class="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm"
          >
            <text>🌐</text>
          </view>
          <view>
            <text class="block text-xs font-medium text-gray-800"
              >公开食材</text
            >
            <text class="text-[18rpx] text-gray-500">允许其他用户使用</text>
          </view>
        </view>
        <switch
          :checked="formData.isPublic"
          color="#8b5cf6"
          style="transform: scale(0.6)"
          @change="(e: any) => (formData.isPublic = e.detail.value)"
        />
      </view>

      <!-- Buttons -->
      <view class="flex space-x-3 pt-1">
        <view
          class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center text-sm"
          @click="handleClose"
        >
          取消
        </view>
        <view
          class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-center flex items-center justify-center text-sm"
          @click="handleSubmit"
        >
          <text v-if="submitting">提交中...</text>
          <text v-else>{{ editingFood ? "保存" : "创建" }}</text>
        </view>
      </view>
    </view>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import Taro from "@tarojs/taro";
import BaseModal from "../common/BaseModal.vue";
import { Heart, HeartFill, Del } from "@nutui/icons-vue-taro";
import {
  FoodCategory,
  createFoodItem,
  updateFoodItem,
  checkFoodSimilarity,
} from "@/services/modules/food";
import type { FoodItem } from "@/services/modules/food";
import {
  getDictByCategory,
  type DictItem,
} from "@/services/modules/dict";
import { showError, showSuccess } from "@/utils/toast";
import { displayUnit } from "@/utils";
import { getTheoreticalCalories } from "@/utils/nutrition";
import { debounce } from "lodash-es";

const props = defineProps<{
  visible: boolean;
  editingFood?: FoodItem | null;
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
  delete: [food: FoodItem];
  toggleFavorite: [food: FoodItem];
}>();

const submitting = ref(false);
const similarFoods = ref<FoodItem[]>([]);
const dictUnits = ref<DictItem[]>([]);

const loadUnits = async () => {
  try {
    const res = await getDictByCategory("unit");
    dictUnits.value = res;
  } catch (e) {
    console.error("Failed to load units", e);
  }
};

/**
 * 🚀 审计修复：维度锁定逻辑
 * 若正在编辑已有食材，锁定单位列表，仅显示同维度单位（如重量类只能选 g/kg）
 */
const filteredUnits = computed(() => {
  if (!props.editingFood || dictUnits.value.length === 0) return dictUnits.value;
  
  const currentUnit = dictUnits.value.find(u => u.code === props.editingFood?.unit);
  const currentDim = currentUnit?.extInfo?.dimension;
  
  if (!currentDim) return dictUnits.value;
  
  return dictUnits.value.filter(u => u.extInfo?.dimension === currentDim);
});

const unitLabels = computed(() => filteredUnits.value.map(u => u.text));
const units = computed(() => filteredUnits.value.map(u => u.code));
const unitIndex = ref(0);

const handleNameInput = debounce(async (val: string) => {
  if (!val || props.editingFood) {
    similarFoods.value = [];
    return;
  }
  try {
    similarFoods.value = await checkFoodSimilarity(val);
  } catch (e) {
    console.error("Similarity check failed", e);
  }
}, 500);

const categoryOptions = [
  {
    key: FoodCategory.PROTEIN,
    label: "蛋白质",
    emoji: "🥩",
    normalClass: "bg-rose-50 text-rose-600 border border-rose-200",
    activeClass:
      "bg-rose-100 text-rose-700 border-rose-300 ring-1 ring-rose-300",
  },
  {
    key: FoodCategory.VEGETABLES,
    label: "蔬菜",
    emoji: "🥬",
    normalClass: "bg-green-50 text-green-600 border border-green-200",
    activeClass:
      "bg-green-100 text-green-700 border-green-300 ring-1 ring-green-300",
  },
  {
    key: FoodCategory.FRUITS,
    label: "水果",
    emoji: "🍎",
    normalClass: "bg-amber-50 text-amber-600 border border-amber-200",
    activeClass:
      "bg-amber-100 text-amber-700 border-amber-300 ring-1 ring-amber-300",
  },
  {
    key: FoodCategory.GRAINS,
    label: "谷物",
    emoji: "🌾",
    normalClass: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    activeClass:
      "bg-yellow-100 text-yellow-800 border-yellow-300 ring-1 ring-yellow-300",
  },
  {
    key: FoodCategory.DAIRY,
    label: "乳制品",
    emoji: "🥛",
    normalClass: "bg-blue-50 text-blue-600 border border-blue-200",
    activeClass:
      "bg-blue-100 text-blue-700 border-blue-300 ring-1 ring-blue-300",
  },
  {
    key: FoodCategory.NUTS,
    label: "坚果",
    emoji: "🥜",
    normalClass: "bg-orange-50 text-orange-600 border border-orange-200",
    activeClass:
      "bg-orange-100 text-orange-700 border-orange-300 ring-1 ring-orange-300",
  },
  {
    key: FoodCategory.SNACKS,
    label: "零食",
    emoji: "🍪",
    normalClass: "bg-pink-50 text-pink-600 border border-pink-200",
    activeClass:
      "bg-pink-100 text-pink-700 border-pink-300 ring-1 ring-pink-300",
  },
  {
    key: FoodCategory.CUSTOM,
    label: "其他",
    emoji: "🥢",
    normalClass: "bg-gray-50 text-gray-600 border border-gray-200",
    activeClass:
      "bg-gray-100 text-gray-700 border-gray-300 ring-1 ring-gray-300",
  },
];

const modalVisible = computed({
  get: () => props.visible,
  set: (val) => {
    if (!val) {
      emit("close");
    }
  },
});

const formData = ref({
  name: "",
  unit: "g",
  baseCount: 100 as string | number,
  imageUrl: "🥩",
  category: FoodCategory.PROTEIN,
  calories: "" as string | number,
  protein: "" as string | number,
  fat: "" as string | number,
  carbs: "" as string | number,
  description: "",
  isPublic: false,
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.editingFood) {
        const f = props.editingFood;
        formData.value = {
          name: f.name,
          unit: f.unit,
          baseCount: f.baseCount || 100,
          imageUrl: f.imageUrl || "🥗",
          category: f.category,
          calories: f.calories,
          protein: f.protein,
          fat: f.fat,
          carbs: f.carbs,
          description: f.description || "",
          isPublic: f.isPublic,
        };
        unitIndex.value = units.indexOf(f.unit);
      } else {
        // 创建模式：重置表单
        formData.value = {
          name: "",
          unit: "g",
          baseCount: 100,
          imageUrl: "🥩",
          category: FoodCategory.PROTEIN,
          calories: "",
          protein: "",
          fat: "",
          carbs: "",
          description: "",
          isPublic: false,
        };
        unitIndex.value = 0;
      }
    }
  },
);

onMounted(() => {
  loadUnits();
});

const handleUnitChange = (e: any) => {
  const index = e.detail.value;
  unitIndex.value = index;
  formData.value.unit = units[index];
};

const handleClose = () => {
  emit("close");
};

const handleSubmit = async () => {
  if (!formData.value.name?.trim()) {
    showError("请输入食材名称");
    return;
  }

  if (formData.value.calories === "") {
    showError("请输入热量");
    return;
  }

  const inputCalories = Number(formData.value.calories);
  const p = Number(formData.value.protein || 0);
  const f = Number(formData.value.fat || 0);
  const c = Number(formData.value.carbs || 0);
  const bc = Number(formData.value.baseCount || 100);

  /**
   * 审计点 1：物理平衡校验 (Physics Balance)
   * 逻辑：蛋白质+脂肪+碳水的总重量不能超过基数总量 (通常为100g)
   * 若不通过，直接拦截，因为该数据违反物理定律。
   */
  if (p + f + c > bc) {
    showError("营养素总和不能超过基准重量");
    return;
  }

  /**
   * 审计点 2：热量平衡校验 (Thermal Validation)
   * 使用 NutritionUtil 计算理论热量
   */
  const expectedCalories = getTheoreticalCalories(p, f, c);

  let shouldRemind = false;
  if (inputCalories < expectedCalories) {
    // 物理拦截：输入热量小于三大营养素最低理论热量
    shouldRemind = true;
  } else if (inputCalories > expectedCalories) {
    // 弹性提醒：输入热量大于理论热量（可能含有酒精或其他热量源）
    // 策略：差异超过 10% 且 绝对值超过 15kcal 时触发提醒
    const diff = inputCalories - expectedCalories;
    if (diff > inputCalories * 0.1 && diff > 15) {
      shouldRemind = true;
    }
  }

  // 提醒逻辑：仅作 UI 提示，允许用户强行保存（针对特殊添加剂或算法尾差）
  if (inputCalories > 0 && shouldRemind) {
    const res = await Taro.showModal({
      title: "数据校验提醒",
      content: `检测到热量(${inputCalories}kcal)与三大营养素计算结果(${expectedCalories}kcal)不符，是否确定保存？`,
      confirmText: "确定保存",
      cancelText: "返回修改",
    });
    if (!res.confirm) return;
  }

  try {
    submitting.value = true;
    const payload = {
      ...formData.value,
      baseCount: Number(formData.value.baseCount || 100),
      calories: inputCalories,
      protein: p,
      fat: f,
      carbs: c,
    };

    if (props.editingFood?.id) {
      await updateFoodItem(props.editingFood.id, payload);
      showSuccess("修改成功");
    } else {
      await createFoodItem(payload);
      showSuccess("创建成功");
    }

    emit("submit");
    handleClose();
  } catch (e: any) {
    showError(e.message || "操作失败");
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.scrollbar-hide {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
