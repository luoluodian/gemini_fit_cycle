<template>
  <view v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 z-50" @click="handleBackdropClick">
    <view class="flex items-center justify-center min-h-screen p-4" @click.stop>
      <view class="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <view class="flex items-center justify-between mb-4">
          <text class="text-lg font-semibold text-gray-800">BMR/TDEE 计算器</text>
          <view @click="handleClose" class="text-gray-400">
            <image 
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTZBRUIzIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTYgMThMMTggNk02IDZsMTIgMTIiLz48L3N2Zz4="
              class="w-6 h-6"
            />
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
import { showError, showSuccess } from '@/utils/toast';
import { useUserStore } from '@/stores/user';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const userStore = useUserStore();

const genderOptions = ['男性', '女性'];
const genderIndex = ref(0);
const age = ref('');
const height = ref('');
const weight = ref('');

const activityOptions = [
  { label: '久坐 (办公室工作)', value: 1.2, id: 1 },
  { label: '轻度活动 (每周1-3次运动)', value: 1.375, id: 2 },
  { label: '中度活动 (每周3-5次运动)', value: 1.55, id: 3 },
  { label: '高度活动 (每周6-7次运动)', value: 1.725, id: 4 },
  { label: '极高活动 (体力劳动者或专业运动员)', value: 1.9, id: 5 },
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

const handleCalculate = async () => {
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
  
  // 1. 前端先行计算 (Optimistic UI)
  const gender = genderIndex.value === 0 ? 'male' : 'female';
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
  } else {
    bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
  }
  
  const activityLevel = activityOptions[activityIndex.value].value;
  const tdee = bmr * activityLevel;
  
  bmrResult.value = Math.round(bmr).toString();
  tdeeResult.value = Math.round(tdee).toString();
  fatLossTarget.value = Math.round(tdee * 0.8).toString();
  maintenanceTarget.value = Math.round(tdee).toString();
  muscleGainTarget.value = Math.round(tdee * 1.2).toString();
  
  showResult.value = true;

  // 2. 同步到后端
  try {
    const birthday = `${new Date().getFullYear() - ageNum}-01-01`; // 估算生日
    await userStore.updateUserInfo({
      heightCm: heightNum,
      weightKg: weightNum,
      genderId: genderIndex.value + 1,
      activityLevelId: activityOptions[activityIndex.value].id,
      dateOfBirth: birthday
    });
    showSuccess('健康档案已更新');
  } catch (e) {
    console.error('Failed to sync health data:', e);
  }
};

watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 回显数据
    if (userStore.healthProfile) {
      const p = userStore.healthProfile;
      height.value = String(p.height || '');
      weight.value = String(p.weight || '');
      genderIndex.value = p.gender === 'male' ? 0 : 1;
      
      // 匹配活动水平索引
      const idx = activityOptions.findIndex(opt => Math.abs(opt.value - p.activityLevel) < 0.01);
      if (idx !== -1) activityIndex.value = idx;

      // 估算年龄
      if (p.birthday) {
        const birthYear = new Date(p.birthday).getFullYear();
        age.value = String(new Date().getFullYear() - birthYear);
      }
    }
  } else {
    showResult.value = false;
  }
});
</script>

