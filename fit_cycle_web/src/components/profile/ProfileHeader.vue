<template>
  <view class="profile-card text-white">
    <view class="px-4 py-8">
      <view class="flex items-center mb-6">
        <!-- 头像区域 -->
        <view class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4 overflow-hidden border-2 border-white/30 box-border">
          <image 
            v-if="userData.avatarUrl" 
            :src="userData.avatarUrl" 
            mode="aspectFill" 
            class="w-full h-full"
          />
          <image 
            v-else 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJ3aGl0ZSI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSIgZD0iTTE2IDdhNCA0IDAgMTEtOCAwIDQgNCAwIDAxOCAwek0xMiAxNGE3IDcgMCAwMC03IDdoMTRhNyA3IDAgMDAtNy03eiIvPjwvc3ZnPg=="
            class="w-8 h-8 opacity-90"
          />
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

