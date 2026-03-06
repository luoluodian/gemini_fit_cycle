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
      <!-- 名称输入 -->
      <view class="flex items-center gap-2">
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

      <!-- 单位选择 -->
      <SelectableTags
        label="单位"
        v-model="formData.unit"
        :options="unitOptions"
        item-key="key"
        item-label="label"
        @change="
          (u) =>
            (formData.baseCount = ['g', 'ml'].includes(u.key) ? 100 : 1)
        "
      />

      <!-- 相似食材提醒 -->
      <view v-if="similarFoods.length > 0" class="px-2 animate-fade-in">
        <text class="text-[18rpx] text-gray-400 font-bold mb-1 block"
          >库中已有类似食材：</text
        >
        <view class="flex flex-wrap gap-2">
          <view
            v-for="sf in similarFoods"
            :key="sf.id"
            class="px-2 py-0.5 bg-gray-50 border border-solid border-gray-200 rounded-md flex items-center gap-1 active:bg-emerald-50"
            @click="$emit('select-similar', sf)"
          >
            <text class="text-[18rpx]">{{ sf.imageUrl || "🥗" }}</text>
            <text class="text-[18rpx] text-gray-600 font-bold">{{
              sf.name
            }}</text>
          </view>
        </view>
      </view>

      <!-- 分类选择 -->
      <SelectableTags
        label="分类"
        v-model="formData.category"
        :options="categoryOptions"
        item-key="key"
        item-label="label"
        item-emoji="emoji"
        @change="(cat) => (formData.imageUrl = cat.emoji)"
      />

      <!-- 营养成分输入 -->
      <view
        class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100"
      >
        <view class="flex items-center justify-center gap-1 mb-2">
          <view class="w-1.5 h-1.5 rounded-full bg-emerald-500"></view>
          <text class="text-[18rpx] font-medium text-emerald-700">每</text>
          <input
            v-model="formData.baseCount"
            type="digit"
            :cursor-spacing="50"
            class="w-12 h-5 border-[1rpx] border-solid border-emerald-300 rounded px-1 text-center text-[20rpx] text-emerald-700 font-bold bg-white"
            placeholder="100"
          />
          <text class="text-[18rpx] font-medium text-emerald-700"
            >{{ currentUnitLabel || displayUnit(formData.unit) }} 营养成分</text
          >
        </view>
        <view class="grid grid-cols-2 gap-2">
          <view class="bg-white rounded-lg p-1.5 border border-orange-100">
            <text class="block text-[18rpx] text-orange-600 font-medium mb-0.5"
              >🔥 热量 ({{ displayUnit("kcal") }})</text
            >
            <input
              v-model="formData.calories"
              type="digit"
              :cursor-spacing="50"
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
              type="digit"
              :cursor-spacing="50"
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
              type="digit"
              :cursor-spacing="50"
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
              type="digit"
              :cursor-spacing="50"
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
          :cursor-spacing="100"
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
import SelectableTags from "../common/SelectableTags.vue";
import { Heart, HeartFill, Del } from "@nutui/icons-vue-taro";
import {
  FoodCategory,
  createFoodItem,
  updateFoodItem,
  checkFoodSimilarity,
} from "@/services/modules/food";
import type { FoodItem } from "@/services/modules/food";
import { getDictByCategory, type DictItem } from "@/services/modules/dict";
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

const loadUnits = async () => {
  try {
    const res = await getDictByCategory("unit");
    dictUnits.value = res;
  } catch (e) {
    console.error("Failed to load units", e);
  }
};

/**
 * 标准化全量单位选项，确保字段名与 SelectableTags 预期一致
 */
const unitOptions = computed(() =>
  dictUnits.value.map((u) => ({
    key: u.code,
    label: u.text,
  })),
);

const currentUnitLabel = computed(() => {
  const unit = dictUnits.value.find((u) => u.code === formData.value.unit);
  return unit?.text || "";
});

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
  },
  {
    key: FoodCategory.VEGETABLES,
    label: "蔬菜",
    emoji: "🥬",
  },
  {
    key: FoodCategory.FRUITS,
    label: "水果",
    emoji: "🍎",
  },
  {
    key: FoodCategory.GRAINS,
    label: "谷物",
    emoji: "🌾",
  },
  {
    key: FoodCategory.DAIRY,
    label: "乳制品",
    emoji: "🥛",
  },
  {
    key: FoodCategory.NUTS,
    label: "坚果",
    emoji: "🥜",
  },
  {
    key: FoodCategory.SNACKS,
    label: "零食",
    emoji: "🍪",
  },
  {
    key: FoodCategory.CUSTOM,
    label: "其他",
    emoji: "🥢",
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
      } else {
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
      }
    }
  },
);

onMounted(() => {
  loadUnits();
});

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

  // 🚀 核心纠偏：根据单位计算物理重量上限
  let weightLimit = bc;
  const unit = formData.value.unit;

  if (["kg", "l"].includes(unit)) {
    weightLimit = bc * 1000; // 1kg/1L = 1000g/1000ml
  } else if (!["g", "ml"].includes(unit)) {
    // 对于“个”、“根”、“勺”等计数单位，物理重量不固定，跳过总量校验
    weightLimit = Infinity;
  }

  if (weightLimit !== Infinity && p + f + c > weightLimit) {
    showError(`营养素总和不能超过基准重量 (${weightLimit}g)`);
    return;
  }

  const expectedCalories = getTheoreticalCalories(p, f, c);

  let shouldRemind = false;
  if (inputCalories < expectedCalories) {
    shouldRemind = true;
  } else if (inputCalories > expectedCalories) {
    const diff = inputCalories - expectedCalories;
    if (diff > inputCalories * 0.1 && diff > 15) {
      shouldRemind = true;
    }
  }

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
    console.log("Submitting food item with data:", formData.value.unit);
    const payload = {
      name: formData.value.name,
      unit: formData.value.unit,
      baseCount: Number(formData.value.baseCount || 100),
      imageUrl: formData.value.imageUrl,
      category: formData.value.category,
      calories: inputCalories,
      protein: p,
      fat: f,
      carbs: c,
      description: formData.value.description,
      isPublic: formData.value.isPublic,
    };

    if (props.editingFood?.id) {
      await updateFoodItem(props.editingFood.id, payload);
      showSuccess("修改成功");
    } else {
      await createFoodItem(payload);
      showSuccess("创建成功");
    }

    emit("submit");
    setTimeout(handleClose, 50);
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
