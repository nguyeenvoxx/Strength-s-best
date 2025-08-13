import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';

interface UseSimpleDataSyncOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  cacheTime?: number; // milliseconds
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
    cacheTime = 60000 // 1 minute
  } = options;

  const { token } = useAuthStore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);
  const isLoadingRef = useRef<boolean>(false);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!token || isLoadingRef.current) return;

    const now = Date.now();
    const cacheAge = now - (cacheRef.current?.timestamp || 0);
    
    // Use cache if available and not expired
    if (!forceRefresh && cacheRef.current && cacheAge < cacheTime) {
      setData(cacheRef.current.data);
      setLastUpdated(new Date(cacheRef.current.timestamp));
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction(token);
      
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
  }, [token, fetchFunction, cacheTime]);

  // Initial load
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

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
  }, [autoRefresh, token, refreshInterval]);

  // Background sync when app becomes active
  useEffect(() => {
    if (!token) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const now = Date.now();
        const lastFetch = cacheRef.current?.timestamp || 0;
        const timeSinceLastFetch = now - lastFetch;
        
        // Refresh if more than 1 minute has passed
        if (timeSinceLastFetch > 60000) {
          fetchData();
        }
      }
    };

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [token]);

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

