<template>
  <view class="profile-card text-white">
    <view class="px-4 py-8">
      <view class="flex items-center mb-6">
        <!-- 头像区域 -->
        <view class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4 overflow-hidden border-2 border-white/30">
          <image 
            v-if="userData.avatarUrl" 
            :src="userData.avatarUrl" 
            mode="aspectFill" 
            class="w-full h-full"
          />
          <svg v-else class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </view>

        <!-- 昵称区域 -->
        <view>
          <text class="hero-title text-2xl font-bold block">{{ userData.nickname || '未登录' }}</text>
          <text class="text-white/80 text-sm block">坚持健康饮食 {{ userData.totalDays || 0 }} 天</text>
        </view>
      </view>
      
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * ProfileHeader - 个人中心页头部组件
 */
interface UserData {
  nickname: string;
  avatarUrl?: string;
  totalDays?: number;
}

defineProps<{
  userData: UserData;
}>();
</script>

<style scoped lang="scss">
.profile-card {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
.hero-title {
  font-family: 'Noto Serif SC', serif;
}
</style>

