/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    XAI_API_KEY: process.env.XAI_API_KEY,
  },
  reactStrictMode: true,
  // 아래 옵션 추가
  output: 'standalone',  // 또는 'export' (정적 사이트일 경우)
  // basePath: '/novel-maker-local' // 필요시 사용

};

export default nextConfig; 