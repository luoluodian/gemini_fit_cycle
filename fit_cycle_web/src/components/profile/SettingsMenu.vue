<template>
  <GlassCard>
    <text class="text-lg font-semibold text-gray-800 mb-4 block">设置</text>
    <view class="space-y-1">
      <MenuItem 
        title="应用设置" 
        description="通知、隐私等设置"
        @click="$emit('settings')"
      >
        <template #icon>
          <image 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjNEI1NTYzIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTEwLjMyNSA0LjMxN2MuNDI2LTEuNzU2IDIuOTI0LTEuNzU2IDMuMzUgMGExLjcyNCAxLjcyNCAwIDAwMi41NzMgMS4wNjZjMS41NDMtLjk0IDMuMzEuODI2IDIuMzcgMi4zN2ExLjcyNCAxLjcyNCAwIDAwMS4wNjUgMi41NzJjMS43NTYuNDI2IDEuNzU2IDIuOTI0IDAgMy4zNWExLjcyNCAxLjcyNCAwIDAwLTEuMDY2IDIuNTczYy45NCAxLjU0My0uODI2IDMuMzEtMi4zNyAyLjM3YTEuNzI0IDEuNzI0IDAgMDAtMi41NzIgMS4wNjVjLS40MjYgMS43NTYtMi45MjQgMS43NTYtMy4zNSAwYTEuNzI0IDEuNzI0IDAgMDAtMi41NzMtMS4wNjZjLTEuNTQzLjk0LTMuMzEtLjgyNi0yLjM3LTIuMzdhMS43MjQgMS43MjQgMCAwMC0xLjA2NS0yLjU3MmMtMS43NTYtLjQyNi0xLjc1Ni0yLjkyNCAwLTMuMzVhMS43MjQgMS43MjQgMCAwMDEuMDY2LTIuNTczYy0uOTQtMS41NDMuODI2LTMuMzEgMi4zNy0yLjM3Ljk5Ni42MDggMi4yOTYuMDcgMi41NzItMS4wNjV6Ii8+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik0xNSAxMmEzIDMgMCAxMS02IDAgMyAzIDAgMDA2IDB6Ii8+PC9zdmc+"
            class="w-5 h-5"
          />
        </template>
      </MenuItem>
      
      <MenuItem 
        title="帮助与反馈" 
        description="使用帮助和意见反馈"
        icon-bg-class="bg-yellow-50"
        @click="$emit('help')"
      >
        <template #icon>
          <image 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjREI5NzBFIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTguMjI4IDljLjU0OS0xLjE2NSAyLjAzLTIgMy43NzItMiAyLjIxIDAgNCAxLjM0MyA0IDMgMCAxLjQtMS4yNzggMi41NzUtMy4wMDYgMi45MDctLjU0Mi4xMDQtLjk5NC41NC0uOTk0IDEuMDkzbeAwIDNoLjAxTTIxIDEyYTkgOSAwIDExLTE4IDAgOSA5IDAgMDExIDB6Ii8+PC9zdmc+"
            class="w-5 h-5"
          />
        </template>
      </MenuItem>
      
      <MenuItem 
        title="关于应用" 
        description="版本信息和更新日志"
        icon-bg-class="bg-indigo-50"
        @click="$emit('about')"
      >
        <template #icon>
          <image 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjNDMzOENBIj48cGF0aSBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTEzIDE2aC0xdi00aC0xbTEgLTRoLjAxTTIxIDEyYTkgOSAwIDExLTE4IDAgOSA5IDAgMDExIDB6Ii8+PC9zdmc+"
            class="w-5 h-5"
          />
        </template>
      </MenuItem>
    </view>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '../common/GlassCard.vue';
import MenuItem from '../common/MenuItem.vue';

defineEmits<{
  settings: [];
  help: [];
  about: [];
}>();
</script>

