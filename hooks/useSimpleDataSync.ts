import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';

interface UseSimpleDataSyncOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  cacheTime?: number; // milliseconds
  revalidateOnFocus?: boolean;
  staleWhileRevalidate?: boolean;
}

interface UseSimpleDataSyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useSimpleDataSync<T>(
  fetchFunction: (token: string) => Promise<T>,
  options: UseSimpleDataSyncOptions = {}
): UseSimpleDataSyncReturn<T> {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    cacheTime = 60000, // 1 minute
    revalidateOnFocus = true,
    staleWhileRevalidate = true
  } = options;

  const { token } = useAuthStore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  // Keep a stable reference to fetchFunction to avoid re-creating callbacks on each render
  const fetchFunctionRef = useRef(fetchFunction);
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!token || isLoadingRef.current) return;

    const now = Date.now();
    const cacheAge = now - (cacheRef.current?.timestamp || 0);
    
    // Use cache if available and not expired
    if (!forceRefresh && cacheRef.current && cacheAge < cacheTime) {
      setData(cacheRef.current.data);
      setLastUpdated(new Date(cacheRef.current.timestamp));
      if (staleWhileRevalidate) {
        (async () => {
          try {
            isLoadingRef.current = true;
            const result = await fetchFunctionRef.current(token);
            setData(result);
            setLastUpdated(new Date());
            cacheRef.current = { data: result, timestamp: Date.now() };
          } catch {}
          finally {
            isLoadingRef.current = false;
          }
        })();
      }
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const result = await fetchFunctionRef.current(token);
      
      setData(result);
      setLastUpdated(new Date());
      
      // Update cache
      cacheRef.current = {
        data: result,
        timestamp: now
      };
      
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
      console.error('Data sync error:', err);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [token, cacheTime]);

  // Initial load
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !token) return;

    intervalRef.current = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, token, refreshInterval, fetchData]);

  // Background sync when app becomes active
  useEffect(() => {
    if (!token) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (revalidateOnFocus) {
          fetchData(true);
        } else {
          const now = Date.now();
          const lastFetch = cacheRef.current?.timestamp || 0;
          const timeSinceLastFetch = now - lastFetch;
          if (timeSinceLastFetch > 60000) {
            fetchData();
          }
        }
      }
    };

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [token, fetchData]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Optimistic update helper: cho phép UI cập nhật tức thời trước khi server trả về
  // Dùng khi địa chỉ/thẻ vừa thêm xong để phản ánh UI mượt mà
  // Lưu ý: chỉ nên gọi ngay sau khi API trả 200 và bạn có object mới
  const optimisticUpdate = useCallback((updater: (prev: T | null) => T) => {
    setData(prev => {
      const next = updater(prev);
      cacheRef.current = { data: next, timestamp: Date.now() };
      setLastUpdated(new Date());
      return next;
    });
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdated
  };
}


