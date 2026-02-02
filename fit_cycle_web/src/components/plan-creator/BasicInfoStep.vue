<template>
  <view class="glass-card rounded-lg p-4 shadow-lg">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">基础信息</h3>

    <view class="space-y-4">
      <view>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >计划名称 *</label
        >
        <input
          type="text"
          :value="formData.name"
          @input="handleNameChange"
          class="w-auto px-3 pt-2 pb-3 border border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="例如：21天减脂计划"
        />
      </view>

      <view>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >计划类型</label
        >
        <view class="grid grid-cols-2 gap-2">
          <view
            v-for="type in planTypes"
            :key="type.value"
            :class="[
              'plan-type-btn px-4 py-2 border rounded-lg text-sm font-medium transition-colors text-center cursor-pointer',
              formData.type === type.value
                ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                : 'border-gray-300 hover:bg-gray-50 border-gray-100  border-solid border',
            ]"
            @click="handleTypeChange(type.value)"
          >
            {{ type.label }}
          </view>
        </view>
      </view>

      <view>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >计划开始日期</label
        >
        <view
          class="w-auto px-4 py-2 border border-solid border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
          @click="showDatePicker = true"
        >
          <text v-if="formData.startDate">{{
            formatDate(formData.startDate)
          }}</text>
          <text v-else class="text-gray-400">请选择开始日期</text>
        </view>
      </view>

      <view class="flex items-center">
        <view
          class="custom-checkbox flex items-center cursor-pointer"
          @click="handleActiveChange(!formData.setActive)"
        >
          <view
            :class="[
              'w-4 h-4 border-2 rounded mr-2 flex items-center justify-center border border-solid border-gray-100',
              formData.setActive
                ? 'bg-emerald-600 border-emerald-600'
                : 'bg-white border-gray-300 hover:border-emerald-500',
            ]"
          >
            <text v-if="formData.setActive" class="text-white text-xs">✓</text>
          </view>
          <text class="text-sm text-gray-700">创建后立即激活此计划</text>
        </view>
      </view>
    </view>
    <nut-popup v-model:visible="showDatePicker" round position="bottom">
      <nut-date-picker
        v-model="pickerDate"
        :min-date="minDate"
        :three-dimensional="false"
        @confirm="handleDateConfirm"
        @cancel="showDatePicker = false"
      ></nut-date-picker>
    </nut-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface PlanData {
  name: string;
  type: string;
  startDate: string;
  setActive: boolean;
}

interface Props {
  formData: PlanData;
}

interface Emits {
  (e: "update:formData", value: Partial<PlanData>): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showDatePicker = ref(false);
const pickerDate = ref(
  computed(() => {
    return props.formData.startDate
      ? new Date(props.formData.startDate)
      : new Date();
  })
);

// 监听表单数据变化
import { watch } from "vue";
watch(
  () => props.formData.startDate,
  (newVal) => {
    console.log("Start date changed to:", newVal);
  }
);

const planTypes = [
  { value: "fat-loss", label: "减脂" },
  { value: "muscle-gain", label: "增肌" },
  { value: "maintenance", label: "维持" },
  { value: "custom", label: "自定义" },
];

// 计算最小日期（今天）
const minDate = computed(() => {
  return new Date();
});

const handleNameChange = (e: any) => {
  const value = e.detail?.value ?? e.target?.value ?? "";
  emit("update:formData", { name: value });
};

const handleTypeChange = (type: string) => {
  emit("update:formData", { type });
};

const handleDateConfirm = ({ selectedValue }: any) => {
  console.log("Date confirm detail:", selectedValue);
  const selectedDate = selectedValue;
  console.log("Selected date:", selectedDate);
  if (selectedDate && selectedDate.length >= 3) {
    const [year, month, day] = selectedDate;
    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    console.log("Formatted date string:", dateString);
    emit("update:formData", { startDate: dateString });
  }
  showDatePicker.value = false;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const handleActiveChange = (value: boolean) => {
  console.log("Checkbox changed to:", value);
  emit("update:formData", { setActive: value });
};
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.custom-checkbox {
  transition: all 0.2s ease;
}

.custom-checkbox:hover {
  opacity: 0.8;
}

.custom-checkbox .w-4.h-4 {
  transition: all 0.2s ease;
}
</style>
