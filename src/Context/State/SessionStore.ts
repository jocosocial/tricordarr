import {getInitialState, SessionAction, sessionReducer, SessionState} from '#src/Context/State/SessionState';

/**
 * SessionStore manages session state using a reducer pattern.
 * Provides synchronous state access and subscription-based updates for React.
 *
 * Based on Bluesky's SessionStore implementation:
 * https://github.com/bluesky-social/social-app/blob/55806f10870128f7702714b5968c64a0e908281e/src/state/session/index.tsx
 */
export class SessionStore {
  private state: SessionState;
  private listeners = new Set<() => void>();

  constructor(initialSessions: SessionState['sessions'] = [], lastSessionID: string | null = null) {
    this.state = getInitialState(initialSessions, lastSessionID);
  }

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
   * Dispatch an action to update state.
   * State updates are synchronous and atomic.
   */
  dispatch(action: SessionAction): void {
    const nextState = sessionReducer(this.state, action);
    this.state = nextState;

    // Notify all listeners synchronously
    this.listeners.forEach(listener => listener());
  }

  /**
   * Check if state needs persistence.
   */
  needsPersist(): boolean {
    return this.state.needsPersist;
  }
}
