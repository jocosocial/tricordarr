import {getInitialState, SessionAction, sessionReducer, SessionState} from '#src/Context/State/SessionState';
import {createLogger} from '#src/Libraries/Logger';
import {persistSessionState} from '#src/Libraries/Storage/SessionPersistence';

const logger = createLogger('SessionStore.ts');

// Module-level so code outside React (the push providers) can wait for the session pointer and
// tokens to land in storage before it reads them.
let writeQueue: Promise<void> = Promise.resolve();

/**
 * Resolves once every session write queued so far has finished. Background code reads the current
 * session from storage (LAST_SESSION_ID), so anything that starts it right after a switch waits
 * here first.
 */
export const flushSessionWrites = (): Promise<void> => writeQueue;

/**
 * SessionStore manages session state using a reducer pattern.
 * Provides synchronous state access and subscription-based updates for React.
 *
 * Persistence happens inside dispatch, before listeners are notified, rather than in an effect
 * after render. Writes are chained so they land in dispatch order, and a second dispatch in the
 * same tick can never observe state that was not handed to storage first.
 *
 * Based on Bluesky's SessionStore implementation:
 * https://github.com/bluesky-social/social-app/blob/55806f10870128f7702714b5968c64a0e908281e/src/state/session/index.tsx
 */
export class SessionStore {
  private state: SessionState = getInitialState();
  private listeners = new Set<() => void>();

  /**
   * Get current state synchronously.
   */
  getState(): SessionState {
    return this.state;
  }

  /**
   * Subscribe to state changes.
   * Returns unsubscribe function.
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Dispatch an action to update state. State updates are synchronous and atomic; the storage
   * writes they imply are queued behind earlier ones. A `loaded` action does not write unless
   * it says `persist` (the migration), since it only reflects what storage already holds.
   */
  dispatch(action: SessionAction): void {
    const prev = this.state;
    const next = sessionReducer(prev, action);
    if (next === prev) {
      return;
    }
    this.state = next;
    if (action.type !== 'loaded' || action.persist) {
      const base = action.type === 'loaded' ? null : prev;
      writeQueue = writeQueue
        .then(() => persistSessionState(base, next))
        .catch(error => logger.error('Error persisting session state:', error));
    }
    // Notify all listeners synchronously
    this.listeners.forEach(listener => listener());
  }

  /**
   * Resolves once every write queued so far has finished. Lets callers (and tests) wait for storage.
   */
  flush(): Promise<void> {
    return flushSessionWrites();
  }
}
