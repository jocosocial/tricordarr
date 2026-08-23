import {createContext, useContext} from 'react';

/**
 * Options for {@link SignOutContextType.confirmLogout}.
 *
 * Logout is split into two callbacks because session teardown and navigation
 * must not happen in the same instant, and they must happen in a specific order.
 *
 * The previous Modal overlay hid the current screen until teardown finished, so
 * a single "then goBack" callback was enough. Alert.alert dismisses as soon as
 * the user taps Log Out, which exposed two flashes if ordering is wrong:
 *
 * 1. Teardown then navigate (no freeze): `isLoggedIn` becomes false while this
 *    screen is still visible, so it swaps to NotLoggedInView for a frame, then
 *    `goBack()` runs. That was the first bug after switching to Alert.
 * 2. Navigate then teardown: `goBack()` reveals the screen underneath (often
 *    Today, via MainAccountMenu → Settings stack) while the session and React
 *    Query cache are still logged-in. Today widgets render leftover
 *    appointments, avatar, notifications, then vanish when `queryClient.clear()`
 *    runs. That was the second bug.
 *
 * Correct order: freeze this screen (`onLogoutStart`) → `performSignOut()`
 * (session + cache) → navigate (`onLoggedOut`). The outgoing screen keeps its
 * logged-in UI; the destination is already logged-out when it becomes visible.
 *
 * SignOutProvider sits above the root navigator (see docs/Navigation.md) and
 * cannot safely call useNavigation(). Callers pass screen-scoped callbacks.
 */
export interface ConfirmLogoutOptions {
  allDevices?: boolean;
  /**
   * After the user confirms (and after the all-devices API succeeds), immediately
   * before local session teardown. Freeze the current screen so `isLoggedIn`
   * flipping false does not swap it to NotLoggedInView.
   */
  onLogoutStart?: () => void;
  /**
   * After `performSignOut()` (token cleared and query cache emptied). Navigate
   * away only now so the screen underneath does not flash leftover logged-in
   * content. Typical value: `() => navigation.goBack()`.
   */
  onLoggedOut?: () => void;
}

export interface SignOutContextType {
  /**
   * Local teardown only: notifications, sockets, session token, React Query
   * cache, webview cookies. No confirm UI and no navigation. Used when the
   * caller already owns the surrounding flow (server URL change, OOBE).
   */
  performSignOut: () => Promise<void>;
  /**
   * Confirm via Alert, optionally hit `/auth/logout` for all-devices, then
   * `onLogoutStart` → `performSignOut` → `onLoggedOut`. See
   * {@link ConfirmLogoutOptions} for why those two callbacks exist.
   */
  confirmLogout: (options?: ConfirmLogoutOptions) => void;
}

export const SignOutContext = createContext<SignOutContextType>({
  performSignOut: async () => {
    throw new Error('SignOutProvider not initialized');
  },
  confirmLogout: () => {
    throw new Error('SignOutProvider not initialized');
  },
});

export const useSignOut = () => useContext(SignOutContext);
