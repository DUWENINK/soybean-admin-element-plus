import { ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchGetSelectList } from '@/service/api';

export const useEnumStore = defineStore('enum-store', () => {
  // 缓存枚举数据
  const enumCache = ref<Record<string, CommonType.Option[]>>({});
  // 正在请求中的枚举，避免并发请求
  const pendingRequests = ref<Record<string, Promise<any> | null>>({});

  /**
   * 获取枚举数据（带缓存）
   * @param enumName 枚举名称
   */
  async function getEnumOptions(enumName: string): Promise<CommonType.Option[]> {
    // 1. 如果已有缓存，直接返回
    if (enumCache.value[enumName]) {
      return enumCache.value[enumName];
    }

    // 2. 如果正在请求中，复用该 Promise
    if (pendingRequests.value[enumName]) {
      return pendingRequests.value[enumName];
    }

    // 3. 发起新请求
    const requestPromise = (async () => {
      try {
        const data = await fetchGetSelectList(enumName);
        if (data) {
          enumCache.value[enumName] = data;
          return data;
        }
        return [];
      } catch (e) {
        console.error(`Failed to fetch enum: ${enumName}`, e);
        return [];
      } finally {
        // 请求完成后清除 pending 状态
        pendingRequests.value[enumName] = null;
      }
    })();

    pendingRequests.value[enumName] = requestPromise;
    return requestPromise;
  }

  return {
    getEnumOptions
  };
});
