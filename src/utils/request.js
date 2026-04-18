import axios from 'axios';

const CACHE_DURATION = 5 * 60 * 1000;
const requestCache = new Map();

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

request.interceptors.request.use(
  (config) => {
    const cacheKey = `${config.method}-${config.url}-${JSON.stringify(config.params || config.data)}`;
    const cached = requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      config.__fromCache = true;
      config.__cachedData = cached.data;
    }
    
    config.__cacheKey = cacheKey;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    if (response.config.__fromCache) {
      return response.config.__cachedData;
    }
    
    const cacheKey = response.config.__cacheKey;
    if (cacheKey && response.config.method?.toLowerCase() === 'get') {
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    
    return response.data;
  },
  (error) => {
    const { response } = error;
    
    let errorMessage = '请求失败，请稍后重试';
    
    if (response) {
      switch (response.status) {
        case 400:
          errorMessage = '请求参数错误';
          break;
        case 401:
          errorMessage = '未授权，请重新登录';
          break;
        case 403:
          errorMessage = '拒绝访问';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        case 502:
          errorMessage = '网关错误';
          break;
        case 503:
          errorMessage = '服务不可用';
          break;
        case 504:
          errorMessage = '网关超时';
          break;
        default:
          errorMessage = `请求失败 (${response.status})`;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请检查网络连接';
    } else if (error.message === 'Network Error') {
      errorMessage = '网络错误，请检查网络连接';
    }
    
    console.error('API Error:', errorMessage, error);
    
    return Promise.reject(new Error(errorMessage));
  }
);

export function clearCache() {
  requestCache.clear();
}

export function clearCacheByKey(key) {
  for (const cacheKey of requestCache.keys()) {
    if (cacheKey.includes(key)) {
      requestCache.delete(cacheKey);
    }
  }
}

export default request;
