<template>
  <BaseModal
    :visible="modalVisible"
    :title="editingFood ? '编辑食材' : '创建自定义食材'"
    position="center"
    @close="handleClose"
    @update="(val) => modalVisible = val"
  >
    <view class="space-y-5 max-h-[70vh] overflow-y-auto px-1 scrollbar-hide">
      <!-- 食物名称和单位 -->
      <view class="flex gap-3">
        <view class="flex-1">
          <text class="block text-sm font-medium text-gray-700 mb-2">食物名称</text>
          <input
            v-model="formData.name"
            type="text"
            class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            placeholder="例如：自制沙拉"
          />
        </view>
        <view class="w-28">
          <text class="block text-sm font-medium text-gray-700 mb-2">单位</text>
          <picker
            :value="unitIndex"
            :range="unitLabels"
            @change="handleUnitChange"
          >
            <view class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
              <text class="text-sm text-gray-800">{{ unitLabels[unitIndex] }}</text>
              <image 
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTY5RkExIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTE5IDlsLTcgNy03LTciLz48L3N2Zz4="
                class="w-4 h-4 opacity-40"
              />
            </view>
          </picker>
        </view>
      </view>

      <!-- 图标选择 -->
      <view>
        <text class="block text-sm font-medium text-gray-700 mb-2">图标选择</text>
        <view class="flex flex-wrap gap-2">
          <view
            v-for="emoji in emojiOptions"
            :key="emoji"
            class="w-10 h-10 flex items-center justify-center rounded-lg border transition-all active:scale-90"
            :class="formData.imageUrl === emoji ? 'bg-emerald-100 border-emerald-500 ring-1 ring-emerald-500' : 'bg-gray-50 border-gray-100'"
            @click="formData.imageUrl = emoji"
          >
            <text class="text-xl">{{ emoji }}</text>
          </view>
        </view>
      </view>

      <!-- 分类标签 -->
      <view>
        <text class="block text-sm font-medium text-gray-700 mb-2">所属分类</text>
        <scroll-view scroll-x class="whitespace-nowrap pb-1 scrollbar-hide">
          <view class="flex gap-2">
            <view
              v-for="cat in categoryOptions"
              :key="cat.key"
              class="px-3 py-1.5 text-xs rounded-full border transition-all whitespace-nowrap"
              :class="formData.category === cat.key ? cat.activeClass : cat.normalClass"
              @click="formData.category = cat.key"
            >
              <text>{{ cat.emoji }} {{ cat.label }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 营养成分输入 -->
      <view class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
        <view class="flex items-center justify-center gap-2 mb-3">
          <view class="w-1.5 h-1.5 rounded-full bg-emerald-500"></view>
          <text class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">每100g/单位营养成分</text>
        </view>
        <view class="grid grid-cols-2 gap-3">
          <view class="bg-white rounded-lg p-2 border border-orange-100 shadow-sm">
            <text class="block text-[10px] text-orange-600 font-bold mb-1">🔥 热量 (kcal)</text>
            <input
              v-model="formData.calories"
              type="number"
              class="w-full px-1 py-0.5 text-sm font-semibold text-gray-800"
              placeholder="0"
            />
          </view>
          <view class="bg-white rounded-lg p-2 border border-rose-100 shadow-sm">
            <text class="block text-[10px] text-rose-600 font-bold mb-1">💪 蛋白质 (g)</text>
            <input
              v-model="formData.protein"
              type="number"
              class="w-full px-1 py-0.5 text-sm font-semibold text-gray-800"
              placeholder="0"
            />
          </view>
          <view class="bg-white rounded-lg p-2 border border-yellow-100 shadow-sm">
            <text class="block text-[10px] text-yellow-600 font-bold mb-1">🧈 脂肪 (g)</text>
            <input
              v-model="formData.fat"
              type="number"
              class="w-full px-1 py-0.5 text-sm font-semibold text-gray-800"
              placeholder="0"
            />
          </view>
          <view class="bg-white rounded-lg p-2 border border-amber-100 shadow-sm">
            <text class="block text-[10px] text-amber-600 font-bold mb-1">🌾 碳水 (g)</text>
            <input
              v-model="formData.carbs"
              type="number"
              class="w-full px-1 py-0.5 text-sm font-semibold text-gray-800"
              placeholder="0"
            />
          </view>
        </view>
      </view>

      <!-- 描述 -->
      <view>
        <text class="block text-sm font-medium text-gray-700 mb-2">描述 (可选)</text>
        <textarea
          v-model="formData.description"
          class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm min-h-[80px]"
          placeholder="简单描述这个食材..."
        ></textarea>
      </view>

      <!-- 公开食材 -->
      <view class="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
        <view class="flex items-center gap-3">
          <view class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-lg shadow-sm">
            🌐
          </view>
          <view>
            <text class="block text-sm font-bold text-gray-800">公开食材</text>
            <text class="text-[10px] text-gray-500">允许其他用户在食材库搜索到它</text>
          </view>
        </view>
        <switch 
          :checked="formData.isPublic" 
          color="#8b5cf6"
          @change="(e: any) => formData.isPublic = e.detail.value" 
        />
      </view>
    </view>

    <template #footer>
      <view class="flex space-x-3">
        <BaseButton 
          type="secondary" 
          class="flex-1 !rounded-xl !py-2.5"
          @click="handleClose"
        >
          取消
        </BaseButton>
        <BaseButton 
          type="primary" 
          class="flex-1 !rounded-xl !py-2.5 shadow-md"
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ editingFood ? '保存修改' : '立即创建' }}
        </BaseButton>
      </view>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import BaseModal from "../common/BaseModal.vue";
import BaseButton from "../common/BaseButton.vue";
import { FoodItem, FoodCategory, createFoodItem, updateFoodItem } from "@/services/modules/food";
import { showError, showSuccess } from "@/utils/toast";

const props = defineProps<{
  visible: boolean;
  editingFood?: FoodItem | null;
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
}>();

const submitting = ref(false);

const emojiOptions = ["🥗", "🥩", "🥦", "🍎", "🍚", "🥛", "🥜", "🍞", "🥚", "🥑", "🥕", "🥣"];

const unitLabels = ["克 (g)", "毫升 (ml)", "个/片", "杯", "勺"];
const units = ["g", "ml", "piece", "cup", "tbsp"];
const unitIndex = ref(0);

const categoryOptions = [
  { key: FoodCategory.PROTEIN, label: "蛋白质", emoji: "🥩", normalClass: "bg-rose-50 text-rose-600 border-rose-100", activeClass: "bg-rose-500 text-white border-rose-500 shadow-sm" },
  { key: FoodCategory.VEGETABLES, label: "蔬菜", emoji: "🥬", normalClass: "bg-green-50 text-green-600 border-green-100", activeClass: "bg-green-500 text-white border-green-500 shadow-sm" },
  { key: FoodCategory.FRUITS, label: "水果", emoji: "🍎", normalClass: "bg-amber-50 text-amber-600 border-amber-100", activeClass: "bg-amber-500 text-white border-amber-500 shadow-sm" },
  { key: FoodCategory.GRAINS, label: "谷物", emoji: "🌾", normalClass: "bg-yellow-50 text-yellow-700 border-yellow-100", activeClass: "bg-yellow-500 text-white border-yellow-500 shadow-sm" },
  { key: FoodCategory.DAIRY, label: "乳制品", emoji: "🥛", normalClass: "bg-blue-50 text-blue-600 border-blue-100", activeClass: "bg-blue-500 text-white border-blue-500 shadow-sm" },
  { key: FoodCategory.NUTS, label: "坚果", emoji: "🥜", normalClass: "bg-orange-50 text-orange-600 border-orange-100", activeClass: "bg-orange-500 text-white border-orange-500 shadow-sm" },
  { key: FoodCategory.SNACKS, label: "零食", emoji: "🍪", normalClass: "bg-pink-50 text-pink-600 border-pink-100", activeClass: "bg-pink-500 text-white border-pink-500 shadow-sm" },
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
  imageUrl: "🥗",
  category: FoodCategory.CUSTOM,
  calories: 0 as number | string,
  protein: 0 as number | string,
  fat: 0 as number | string,
  carbs: 0 as number | string,
  description: "",
  isPublic: false,
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.editingFood) {
      const f = props.editingFood;
      formData.value = {
        name: f.name,
        unit: f.unit,
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
    } else if (!newVal) {
      // Reset form
      formData.value = {
        name: "",
        unit: "g",
        imageUrl: "🥗",
        category: FoodCategory.CUSTOM,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        description: "",
        isPublic: false,
      };
      unitIndex.value = 0;
    }
  }
);

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
  if (!formData.value.calories && formData.value.calories !== 0) {
    showError("请输入热量");
    return;
  }

  try {
    submitting.value = true;
    const payload = {
      ...formData.value,
      calories: Number(formData.value.calories),
      protein: Number(formData.value.protein),
      fat: Number(formData.value.fat),
      carbs: Number(formData.value.carbs),
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