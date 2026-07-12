/**
 * Simple, typed Event Bus for decoupling domain events and side-effects.
 * Supports synchronous or asynchronous event listeners.
 */

type EventCallback = (payload: any) => void | Promise<void>;

class EventBusClass {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to a system event
   */
  public subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Publish an event asynchronously, triggering all registered subscribers.
   */
  public async emit(event: string, payload: any): Promise<void> {
    const callbacks = this.listeners.get(event);
    if (!callbacks || callbacks.size === 0) return;

    // Fire all callbacks concurrently, tracking failures gracefully
    const promises = Array.from(callbacks).map(async (callback) => {
      try {
        await callback(payload);
      } catch (err) {
        console.error(`[EventBus] Error executing callback for event "${event}":`, err);
      }
    });

    await Promise.all(promises);
  }
}

// Global Singleton (ensures single instance across Next.js dev reloads)
const globalForEventBus = globalThis as unknown as {
  eventBusInstance: EventBusClass | undefined;
};

export const EventBus = globalForEventBus.eventBusInstance ?? new EventBusClass();

if (process.env.NODE_ENV !== 'production') {
  globalForEventBus.eventBusInstance = EventBus;
}
