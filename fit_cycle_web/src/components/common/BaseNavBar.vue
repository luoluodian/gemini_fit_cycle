<template>
  <view 
    class="base-nav-bar-wrapper" 
    :style="{ height: navBarHeight + 'px' }"
  >
    <view 
      class="base-nav-bar fixed top-0 left-0 right-0 z-[9999]"
      :class="[transparent ? '' : 'bg-white/80 backdrop-blur-xl border-b border-white/20']"
      :style="{ 
        height: navBarHeight + 'px',
        background: customBackground
      }"
    >
      <!-- 状态栏占位 -->
      <view :style="{ height: statusBarHeight + 'px' }"></view>
      
      <!-- 内容区 -->
      <view 
        class="nav-content relative flex items-center px-4"
        :style="{ height: titleBarHeight + 'px' }"
      >
        <!-- 左侧操作区 -->
        <view class="nav-left flex items-center min-w-[80rpx]" @click="handleBack" v-if="showBack">
          <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </view>

        <!-- 标题区 -->
        <view class="nav-title absolute left-1/2 -translate-x-1/2 max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap">
          <text class="text-lg font-bold text-gray-900">{{ title }}</text>
        </view>

        <!-- 右侧插槽 -->
        <view class="nav-right ml-auto">
          <slot name="right"></slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'

interface Props {
  title?: string
  showBack?: boolean
  transparent?: boolean
  customBackground?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showBack: false,
  transparent: false,
  customBackground: ''
})

const statusBarHeight = ref(20)
const titleBarHeight = ref(44)
const navBarHeight = ref(64)

onMounted(() => {
  const systemInfo = Taro.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  
  // 获取胶囊按钮位置
  try {
    const menuButton = Taro.getMenuButtonBoundingClientRect()
    // 计算公式：(胶囊顶部距离 - 状态栏高度) * 2 + 胶囊高度
    titleBarHeight.value = (menuButton.top - statusBarHeight.value) * 2 + menuButton.height
  } catch (e) {
    titleBarHeight.value = 44
  }
  
  navBarHeight.value = statusBarHeight.value + titleBarHeight.value
})

const handleBack = () => {
  const pages = Taro.getCurrentPages()
  if (pages.length > 1) {
    Taro.navigateBack()
  } else {
    Taro.reLaunch({ url: '/pages/index/index' })
  }
}
</script>

<style lang="scss">
.base-nav-bar-wrapper {
  width: 100%;
}

.base-nav-bar {
  transition: background 0.3s ease;
}
</style>
