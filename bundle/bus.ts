type Listener = (...args: unknown[]) => void;
const registry = new Map<string, Set<Listener>>();

export const bus = {
  emit(event: string, ...args: unknown[]): void {
    const set = registry.get(event);
    if (!set) return;
    for (const fn of set) {
      try { fn(...args); } catch (e) { console.error("[Bus:" + event + "]", e); }
    }
  },

  on(event: string, callback: Listener): void {
    if (!registry.has(event)) registry.set(event, new Set());
    registry.get(event)!.add(callback);
  },

  off(event: string, callback: Listener): void {
    registry.get(event)?.delete(callback);
  },
};
