import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // 자동 업데이트 설정
      devOptions: {
        enabled: true, // 개발 환경에서도 PWA 작동하게 설정
      },
      includeAssets: [
        "favicon.svg",
        "robots.txt",
        "apple-touch-icon.png",
        "assets/icons/*",
        "icons/*",
        "screenshots/*",
      ], // 캐싱할 자산 목록

      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB 이하 파일 캐싱
      },
    }),
  ],
});
