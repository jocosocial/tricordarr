import {useCallback, useRef} from 'react';

/**
 * Hook that ensures only one async task runs at a time.
 * Cancels the previous task when a new one starts.
 *
 * Returns a function that cancels any pending task and provides
 * an AbortSignal for the new task to check.
 *
 * Based on Bluesky's useOneTaskAtATime hook:
 * https://github.com/bluesky-social/social-app/blob/55806f10870128f7702714b5968c64a0e908281e/src/state/session/index.tsx
 *
 * @returns Function that returns an AbortSignal for the current task
 *
 * @example
 * ```ts
 * const cancelPendingTask = useOneTaskAtATime();
 *
 * const doAsyncWork = async () => {
 *   const signal = cancelPendingTask();
 *   try {
 *     const result = await someAsyncOperation();
 *     if (signal.aborted) return;
 *     // Use result...
 *   } catch (error) {
 *     if (signal.aborted) return;
 *     // Handle error...
 *   }
 * };
 * ```
 */
export function useOneTaskAtATime(): () => AbortSignal {
  const abortController = useRef<AbortController | null>(null);

  const cancelPendingTask = useCallback(() => {
    // Cancel previous task if it exists
    if (abortController.current) {
      abortController.current.abort();
    }

    // Create new AbortController for current task
    abortController.current = new AbortController();
    return abortController.current.signal;
  }, []);

  return cancelPendingTask;
}
