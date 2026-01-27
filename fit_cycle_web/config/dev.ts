import type { UserConfigExport } from "@tarojs/cli";

export default {
  plugins: [],
  mini: {},
  h5: {
    devServer: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  },
} satisfies UserConfigExport<"vite">;