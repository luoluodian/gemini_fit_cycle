<template>
  <view v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 z-50" @click="handleBackdropClick">
    <view class="flex items-center justify-center min-h-screen p-4" @click.stop>
      <view class="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <view class="flex items-center justify-between mb-4">
          <text class="text-lg font-semibold text-gray-800">BMR/TDEE 计算器</text>
          <view @click="handleClose" class="text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </view>
        </view>
        
        <view class="space-y-4">
          <view class="grid grid-cols-2 gap-4">
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-2">性别</text>
              <picker :value="genderIndex" :range="genderOptions" @change="handleGenderChange">
                <view class="w-full px-4 py-2 border border-gray-300 rounded-lg">{{ genderOptions[genderIndex] }}</view>
              </picker>
            </view>
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-2">年龄</text>
              <input 
                v-model="age" 
                type="number" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                placeholder="25"
              />
            </view>
          </view>
          
          <view class="grid grid-cols-2 gap-4">
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-2">身高 (cm)</text>
              <input 
                v-model="height" 
                type="number" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                placeholder="170"
              />
            </view>
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-2">体重 (kg)</text>
              <input 
                v-model="weight" 
                type="number" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                placeholder="65"
              />
            </view>
          </view>
          
          <view>
            <text class="block text-sm font-medium text-gray-700 mb-2">活动水平</text>
            <picker :value="activityIndex" :range="activityOptions" range-key="label" @change="handleActivityChange">
              <view class="w-full px-4 py-2 border border-gray-300 rounded-lg">{{ activityOptions[activityIndex].label }}</view>
            </picker>
          </view>
          
          <view class="flex space-x-3 pt-4">
            <view class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium text-center" @click="handleClose">
              取消
            </view>
            <view class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium text-center" @click="handleCalculate">
              计算
            </view>
          </view>
        </view>
        
        <view v-if="showResult" class="mt-6 p-4 bg-emerald-50 rounded-lg">
          <text class="font-semibold text-gray-800 mb-3 block">计算结果</text>
          <view class="grid grid-cols-2 gap-4 text-sm">
            <view class="text-center">
              <text class="font-bold text-emerald-600 block">{{ bmrResult }} kcal</text>
              <text class="text-gray-600 block">基础代谢 (BMR)</text>
            </view>
            <view class="text-center">
              <text class="font-bold text-blue-600 block">{{ tdeeResult }} kcal</text>
              <text class="text-gray-600 block">每日消耗 (TDEE)</text>
            </view>
          </view>
          <view class="mt-4 p-3 bg-white rounded-lg">
            <text class="font-medium text-gray-800 mb-2 block">目标建议</text>
            <view class="text-sm space-y-1">
              <view class="flex justify-between">
                <text>减脂:</text>
                <text class="font-medium">{{ fatLossTarget }} kcal</text>
              </view>
              <view class="flex justify-between">
                <text>维持:</text>
                <text class="font-medium">{{ maintenanceTarget }} kcal</text>
              </view>
              <view class="flex justify-between">
                <text>增肌:</text>
                <text class="font-medium">{{ muscleGainTarget }} kcal</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { showError } from '@/utils/toast';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const genderOptions = ['男性', '女性'];
const genderIndex = ref(0);
const age = ref('');
const height = ref('');
const weight = ref('');

const activityOptions = [
  { label: '久坐 (办公室工作)', value: 1.2 },
  { label: '轻度活动 (每周1-3次运动)', value: 1.375 },
  { label: '中度活动 (每周3-5次运动)', value: 1.55 },
  { label: '高度活动 (每周6-7次运动)', value: 1.725 },
  { label: '极高活动 (体力劳动者或专业运动员)', value: 1.9 },
];
const activityIndex = ref(0);

const showResult = ref(false);
const bmrResult = ref('0');
const tdeeResult = ref('0');
const fatLossTarget = ref('0');
const maintenanceTarget = ref('0');
const muscleGainTarget = ref('0');

const handleGenderChange = (e: any) => {
  genderIndex.value = e.detail.value;
};

const handleActivityChange = (e: any) => {
  activityIndex.value = e.detail.value;
};

const handleClose = () => {
  showResult.value = false;
  emit('close');
};

const handleBackdropClick = (e: any) => {
  if (e.target === e.currentTarget) {
    handleClose();
  }
};

const handleCalculate = () => {
  const ageNum = parseFloat(age.value);
  const heightNum = parseFloat(height.value);
  const weightNum = parseFloat(weight.value);
  
  if (!ageNum || !heightNum || !weightNum) {
    showError('请填写完整信息');
    return;
  }
  
  if (ageNum < 10 || ageNum > 100 || heightNum < 100 || heightNum > 250 || weightNum < 30 || weightNum > 200) {
    showError('请输入合理的数值范围');
    return;
  }
  
  // 计算BMR (Mifflin-St Jeor公式)
  const gender = genderIndex.value === 0 ? 'male' : 'female';
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
  } else {
    bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
  }
  
  // 计算TDEE
  const activityLevel = activityOptions[activityIndex.value].value;
  const tdee = bmr * activityLevel;
  
  // 显示结果
  bmrResult.value = Math.round(bmr).toString();
  tdeeResult.value = Math.round(tdee).toString();
  fatLossTarget.value = Math.round(tdee * 0.8).toString();
  maintenanceTarget.value = Math.round(tdee).toString();
  muscleGainTarget.value = Math.round(tdee * 1.2).toString();
  
  showResult.value = true;
};

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    showResult.value = false;
    age.value = '';
    height.value = '';
    weight.value = '';
    genderIndex.value = 0;
    activityIndex.value = 0;
  }
});
</script>

