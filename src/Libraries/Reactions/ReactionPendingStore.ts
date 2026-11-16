/**
 * Which reaction request is in flight for each post, readable from anywhere that shows the post.
 *
 * A reaction can be sent from the action menu's picker or from a badge, and both need to know when
 * the other is busy. This lives outside React state so the picker, the badges and the list row all
 * see the same answer, and only the rows whose post changed re-render (via useSyncExternalStore).
 */
export interface ReactionPendingStore {
  /** Marks a post busy. Returns false, changing nothing, if it already has a request in flight. */
  begin: (key: string, reaction: string) => boolean;
  end: (key: string) => void;
  get: (key: string) => string | undefined;
  subscribe: (listener: () => void) => () => void;
}

export const createReactionPendingStore = (): ReactionPendingStore => {
  const pending = new Map<string, string>();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach(listener => listener());

  return {
    begin: (key, reaction) => {
      if (pending.has(key)) {
        return false;
      }
      pending.set(key, reaction);
      notify();
      return true;
    },
    end: key => {
      if (pending.delete(key)) {
        notify();
      }
    },
    get: key => pending.get(key),
    subscribe: listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};
