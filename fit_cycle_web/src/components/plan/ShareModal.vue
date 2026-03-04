<template>
  <BaseModal
    :visible="visible"
    position="center"
    :show-header="false"
    content-class="w-[85vw] !rounded-3xl overflow-hidden"
    body-class="p-0"
    @close="$emit('close')"
  >
    <!-- Content -->
    <view class="bg-white p-6">
      <view class="flex items-center justify-between mb-8">
        <text class="text-xl font-black text-gray-800">分享计划</text>
        <view class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" @click="$emit('close')">
          <text class="text-gray-400 text-sm">✕</text>
        </view>
      </view>

      <view class="grid grid-cols-2 gap-4">
        <!-- 微信好友 -->
        <button 
          open-type="share" 
          class="flex flex-col items-center justify-center p-6 bg-emerald-50 rounded-3xl border border-solid border-emerald-100 active:scale-95 transition-all m-0 leading-normal"
          @click="$emit('close')"
        >
          <view class="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-200">
            <text class="text-white text-2xl">💬</text>
          </view>
          <text class="text-sm font-black text-emerald-700">发送给好友</text>
        </button>

        <!-- 复制分享码 -->
        <view 
          class="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-3xl border border-solid border-blue-100 active:scale-95 transition-all"
          @click="handleCopyCode"
        >
          <view class="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-200">
            <text class="text-white text-2xl">🔗</text>
          </view>
          <text class="text-sm font-black text-blue-700">复制分享码</text>
        </view>
      </view>

      <!-- 小程序码预览 -->
      <view v-if="qrCodeUrl" class="mt-6 flex flex-col items-center animate-fade-in">
        <view class="p-2 bg-white rounded-2xl border border-solid border-gray-100 shadow-sm mb-3">
          <image :src="qrCodeUrl" class="w-32 h-32" @click="handlePreviewImage" />
        </view>
        <view class="text-[18rpx] text-gray-400 font-black mb-4">扫码快速导入计划</view>
        <view 
          class="w-full py-3 bg-gray-800 text-white rounded-2xl text-sm font-black flex items-center justify-center active:bg-gray-700 transition-colors"
          @click="handleSaveQRCode"
        >
          <text class="mr-2">📥</text> 保存小程序码
        </view>
      </view>

      <!-- 分享码显示 -->
      <view v-if="shareCode && !qrCodeUrl" class="mt-6 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-between">
        <view class="min-w-0 flex-1 mr-2">
          <text class="text-[18rpx] text-gray-400 font-bold block">分享码</text>
          <text class="text-base font-black text-gray-700 font-mono tracking-wider truncate block">{{ shareCode }}</text>
        </view>
        <view class="bg-white px-3 py-1.5 rounded-xl border border-solid border-gray-200 text-xs font-black text-gray-600 whitespace-nowrap" @click="handleCopyCode">复制</view>
      </view>

      <view class="mt-8 text-center">
        <text class="text-[18rpx] text-gray-400 font-bold italic">“分享你的健康饮食灵感”</text>
      </view>
    </view>
  </BaseModal>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import BaseModal from "@/components/common/BaseModal.vue";

const props = defineProps<{
  visible: boolean;
  shareCode: string;
  qrCodeUrl?: string; // 新增：Base64 格式的小程序码
}>();

const emit = defineEmits(['close']);

const handleCopyCode = () => {
  if (!props.shareCode) return;
  Taro.setClipboardData({
    data: props.shareCode,
    success: () => {
      emit('close');
    }
  });
};

const handlePreviewImage = () => {
  if (!props.qrCodeUrl) return;
  Taro.previewImage({
    urls: [props.qrCodeUrl],
    current: props.qrCodeUrl
  });
};

const handleSaveQRCode = async () => {
  if (!props.qrCodeUrl) return;

  try {
    Taro.showLoading({ title: '保存中...' });
    
    // 1. 将 Base64 转为临时文件路径 (仅 H5 之外的环境)
    const fs = Taro.getFileSystemManager();
    const fileName = `${Taro.env.USER_DATA_PATH}/share_qr_${Date.now()}.png`;
    const base64Data = props.qrCodeUrl.replace(/^data:image\/\w+;base64,/, "");
    
    fs.writeFileSync(fileName, base64Data, 'base64');

    // 2. 保存到相册
    await Taro.saveImageToPhotosAlbum({
      filePath: fileName
    });
    
    // 3. 🚀 核心纠偏：清理临时文件
    try {
      fs.unlinkSync(fileName);
    } catch (e) {
      console.warn('清理临时文件失败:', e);
    }
    
    Taro.hideLoading();
    Taro.showToast({ title: '已保存到相册', icon: 'success' });
  } catch (err) {
    Taro.hideLoading();
    console.error('保存失败:', err);
    
    // 适配权限拒绝情况
    if (err.errMsg?.includes('auth deny')) {
      Taro.showModal({
        title: '提示',
        content: '需要您的相册授权才能保存小程序码',
        success: (res) => {
          if (res.confirm) Taro.openSetting();
        }
      });
    } else {
      Taro.showToast({ title: '保存失败', icon: 'error' });
    }
  }
};
</script>

<style scoped lang="scss">
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

/* BaseModal 内置了 nut-popup 的居中动画，无需额外 slideUp */
</style>
