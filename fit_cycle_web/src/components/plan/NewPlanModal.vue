<template>
  <view
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 z-50"
    @click="handleClose"
  >
    <view
      class="flex items-center justify-center min-h-screen p-4"
      @click.stop
    >
      <view
        class="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
      >
        <view class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">创建新计划</h3>
          <view @click="handleClose" class="text-gray-400 hover:text-gray-600">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </view>
        </view>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <view>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >计划名称</label
            >
            <input
              v-model="formData.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="例如：我的减脂计划"
            />
          </view>

          <view>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >计划类型</label
            >
            <select
              v-model="formData.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="fat-loss">减脂</option>
              <option value="muscle-gain">增肌</option>
              <option value="maintenance">维持</option>
              <option value="custom">自定义</option>
            </select>
          </view>

          <view class="grid grid-cols-2 gap-4">
            <view>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >开始日期</label
              >
              <input
                v-model="formData.startDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </view>
            <view>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >结束日期</label
              >
              <input
                v-model="formData.endDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </view>
          </view>

          <view>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >每日热量目标 (kcal)</label
            >
            <input
              v-model.number="formData.dailyCalories"
              type="number"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="1800"
            />
          </view>

          <view class="grid grid-cols-3 gap-4">
            <view>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >蛋白质 (g)</label
              >
              <input
                v-model.number="formData.protein"
                type="number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="120"
              />
            </view>
            <view>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >脂肪 (g)</label
              >
              <input
                v-model.number="formData.fat"
                type="number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="50"
              />
            </view>
            <view>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >碳水 (g)</label
              >
              <input
                v-model.number="formData.carb"
                type="number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="180"
              />
            </view>
          </view>

          <view class="flex items-center">
            <input
              v-model="formData.setActive"
              type="checkbox"
              class="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label class="ml-2 text-sm text-gray-700"
              >创建后立即激活此计划</label
            >
          </view>

          <view class="flex space-x-3 pt-4">
            <view
              @click="handleClose"
              class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
            >
              取消
            </view>
            <button
              type="submit"
              class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              创建计划
            </button>
          </view>
        </form>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface FormData {
  name: string
  type: string
  startDate: string
  endDate: string
  dailyCalories: number | null
  protein: number | null
  fat: number | null
  carb: number | null
  setActive: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: FormData): void
}

const props = defineProps<{
  visible: boolean
  initialData?: Partial<FormData>
}>()

const emit = defineEmits<Emits>()

const formData = ref<FormData>({
  name: '',
  type: 'fat-loss',
  startDate: '',
  endDate: '',
  dailyCalories: null,
  protein: null,
  fat: null,
  carb: null,
  setActive: false
})

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      // 设置默认日期
      const today = new Date()
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
      
      // 如果有初始数据，使用初始数据，否则使用默认值
      if (props.initialData && Object.keys(props.initialData).length > 0) {
        formData.value = {
          name: props.initialData.name || '',
          type: props.initialData.type || 'fat-loss',
          startDate: props.initialData.startDate || today.toISOString().split('T')[0],
          endDate: props.initialData.endDate || nextMonth.toISOString().split('T')[0],
          dailyCalories: props.initialData.dailyCalories || null,
          protein: props.initialData.protein || null,
          fat: props.initialData.fat || null,
          carb: props.initialData.carb || null,
          setActive: props.initialData.setActive || false
        }
      } else {
        formData.value.startDate = today.toISOString().split('T')[0]
        formData.value.endDate = nextMonth.toISOString().split('T')[0]
      }
    } else {
      // 重置表单
      formData.value = {
        name: '',
        type: 'fat-loss',
        startDate: '',
        endDate: '',
        dailyCalories: null,
        protein: null,
        fat: null,
        carb: null,
        setActive: false
      }
    }
  }
)

const handleClose = () => {
  emit('close')
}

const handleSubmit = () => {
  emit('submit', formData.value)
  handleClose()
}
</script>

