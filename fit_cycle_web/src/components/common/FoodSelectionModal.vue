<template>
  <BaseModal
    :visible="popupVisible"
    position="bottom"
    title="选择食物"
    :content-class="'bg-white rounded-t-3xl  py-6'"
    @close="handleClose"
    @update="(val) => (popupVisible = val)"
  >
    <view class="mb-4">
      <nut-searchbar
        v-model="searchText"
        placeholder="搜索食物..."
        shape="round"
        input-background="#f3f4f6"
        :clearable="true"
      />
    </view>
    <scroll-view
      scroll-y
      class="h-80"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="handleRefresh"
    >
      <view class="space-y-2" v-if="filteredFoods.length > 0">
        <view
          v-for="(food, index) in filteredFoods"
          :key="index"
          class="flex items-center justify-between p-3 border border-gray-200 border-solid rounded-lg cursor-pointer hover:bg-gray-50"
          @click="handleSelectFood(food)"
        >
          <view>
            <view class="font-medium text-gray-800">{{ food.foodName }}</view>
            <view class="text-xs text-gray-500">
              {{ food.carbs }}g·{{ food.protein }}g· {{ food.fat }}g（碳/蛋/脂）
              热量{{ food.calories }} kcal</view
            >
          </view>
          <view class="text-sm text-gray-600"
            >{{ food.baseCount }} {{ food.baseUnit }}</view
          >
        </view>
        <view class="text-center text-gray-400 text-sm py-4">
          没有更多了～
        </view>
      </view>
      <view
        v-else
        class="flex items-center justify-center h-full text-gray-500 text-sm"
      >
        暂无数据
      </view>
    </scroll-view>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "./BaseModal.vue";

interface Food {
  foodId: string;
  foodName: string;
  calories: number;
  baseUnit: string;
  protein: number;
  fat: number;
  carbs: number;
  baseCount: number;
}
interface Props {
  visible: boolean;
  foods?: Food[];
}

interface Emits {
  (e: "close"): void;
  (e: "select", food: Food): void;
}

const props = withDefaults(defineProps<Props>(), {
  foods: () => [],
});

const emit = defineEmits<Emits>();

const searchText = ref("");
const popupVisible = ref(props.visible);
const isRefreshing = ref(false);

const filteredFoods = computed(() => {
  if (!searchText.value) {
    return props.foods;
  }
  return props.foods.filter((food) =>
    food.foodName.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

const handleClose = () => {
  searchText.value = "";
  emit("close");
};

const handleSelectFood = (food: Food) => {
  emit("select", food);
};

const handleRefresh = () => {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
  }, 1000);
};

watch(
  () => props.visible,
  (newVal) => {
    popupVisible.value = newVal;
  }
);

watch(popupVisible, (newVal) => {
  if (!newVal) {
    handleClose();
  }
});
</script>
