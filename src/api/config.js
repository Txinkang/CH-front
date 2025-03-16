// API 配置
export const API_CONFIG = {
  // 基础URL，可以根据环境变量设置
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // 超时时间
  timeout: 30000,
  // 其他配置...
}

export const TEST_API_CONFIG = {
  // 基础URL，可以根据环境变量设置
  baseURL: import.meta.env.VITE_TEST_API_BASE_URL,
  // 超时时间
  timeout: 30000,
  // 其他配置...
}
