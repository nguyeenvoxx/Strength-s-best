import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';

interface UseDataSyncOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  enableBackgroundSync?: boolean;
  cacheTime?: number; // milliseconds
  revalidateOnFocus?: boolean; // bỏ qua cache khi app active
  staleWhileRevalidate?: boolean; // trả cache ngay và revalidate nền
}

interface UseDataSyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useDataSync<T>(
  fetchFunction: (token: string) => Promise<T>,
  options: UseDataSyncOptions = {}
): UseDataSyncReturn<T> {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableBackgroundSync = true,
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
  const lastFetchRef = useRef<number>(0);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  const fetchFunctionRef = useRef(fetchFunction);

  // Update fetchFunction ref when it changes
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
      // Revalidate in background if enabled
      if (staleWhileRevalidate) {
        (async () => {
          try {
            isLoadingRef.current = true;
            const result = await fetchFunctionRef.current(token);
            setData(result);
            setLastUpdated(new Date());
            cacheRef.current = { data: result, timestamp: Date.now() };
          } catch (err) {
            // ignore background revalidate errors
          } finally {
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
      lastFetchRef.current = now;
      
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
    if (!enableBackgroundSync || !token) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (revalidateOnFocus) {
          // Force refresh to đảm bảo dữ liệu mới nhất
          fetchData(true);
        } else {
          const now = Date.now();
          const timeSinceLastFetch = now - lastFetchRef.current;
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
  }, [enableBackgroundSync, token, fetchData]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdated
  };
}
