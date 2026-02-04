/** @type {import('tailwindcss').Config} */
module.exports = {
  // 这里给出了一份 uni-app /taro 通用示例，具体要根据你自己项目的目录结构进行配置
  // 不在 content 包括的文件内，你编写的 class，是不会生成对应的css工具类的
  content: ["./public/index.html", "./src/**/*.{html,js,ts,jsx,tsx,vue}"],
  theme: {
    extend: {
      boxShadow: {
        sm: "0 2rpx 4rpx 0 rgba(0, 0, 0, 0.05)",
        md: "0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06)",
        lg: "0 10rpx 15rpx -3rpx rgba(0, 0, 0, 0.1), 0 4rpx 6rpx -2rpx rgba(0, 0, 0, 0.05)",
        xl: "0 20rpx 25rpx -5rpx rgba(0, 0, 0, 0.1), 0 10rpx 10rpx -5rpx rgba(0, 0, 0, 0.04)",
      },
    },
  },
  // 其他配置项
  // ...
  corePlugins: {
    // 小程序不需要 preflight，因为这主要是给 h5 的，如果你要同时开发小程序和 h5 端，你应该使用环境变量来控制它
    preflight: false,
  },
};
