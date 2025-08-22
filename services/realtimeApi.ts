
import { API_CONFIG } from '../constants/config';

// Event types cho real-time updates
export interface RealtimeEvent {
  type: 'admin_reply' | 'order_status' | 'notification';
  data: any;
  timestamp: number;
}

// Simple callback manager cho real-time updates
class CallbackManager {
  private listeners: Map<string, ((event: RealtimeEvent) => void)[]> = new Map();

  // Subscribe to real-time events
  subscribe(eventType: string, listener: (event: RealtimeEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Unsubscribe from events
  unsubscribe(eventType: string, listener: (event: RealtimeEvent) => void) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Trigger event manually (for testing or manual updates)
  triggerEvent(event: RealtimeEvent) {
    console.log('📡 Triggering real-time event:', event);
    
    const listeners = this.listeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in real-time event listener:', error);
      }
    });
  }

  // Clear all listeners
  clear() {
    this.listeners.clear();
  }
}

// Singleton instance
export const callbackManager = new CallbackManager();

// Hook để sử dụng real-time updates
export const useRealtimeUpdates = () => {
  const subscribe = (eventType: string, listener: (event: RealtimeEvent) => void) => {
    return callbackManager.subscribe(eventType, listener);
  };

  const unsubscribe = (eventType: string, listener: (event: RealtimeEvent) => void) => {
    callbackManager.unsubscribe(eventType, listener);
  };

  const triggerEvent = (event: RealtimeEvent) => {
    callbackManager.triggerEvent(event);
  };

  return {
    subscribe,
    unsubscribe,
    triggerEvent
  };
};

// Helper function để tạo admin reply event
export const createAdminReplyEvent = (reviewId: string, productId: string, content: string) => ({
  type: 'admin_reply' as const,
  data: {
    reviewId,
    productId,
    content
  },
  timestamp: Date.now()
});
