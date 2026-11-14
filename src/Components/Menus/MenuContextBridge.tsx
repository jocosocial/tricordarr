import {NavigationContext, NavigationRouteContext} from '@react-navigation/native';
import React, {PropsWithChildren, useContext, useMemo} from 'react';

import {ElevationContext} from '#src/Context/Contexts/ElevationContext';
import {ForumComposerContext} from '#src/Context/Contexts/ForumComposerContext';

export interface BridgedMenuContexts {
  navigation: React.ContextType<typeof NavigationContext>;
  route: React.ContextType<typeof NavigationRouteContext>;
  elevation: React.ContextType<typeof ElevationContext>;
  forumComposer: React.ContextType<typeof ForumComposerContext>;
}

/**
 * Captures the screen-scoped contexts a menu item may need. MUST be called from the component that
 * renders the `Menu` (which is in the navigator tree), never from inside the Menu's children: those
 * render in the Paper Portal, where these contexts are already gone. Pass the result to
 * MenuContextBridge.
 */
export const useMenuContextBridge = (): BridgedMenuContexts => {
  const navigation = useContext(NavigationContext);
  const route = useContext(NavigationRouteContext);
  const elevation = useContext(ElevationContext);
  const forumComposer = useContext(ForumComposerContext);
  return useMemo(() => ({navigation, route, elevation, forumComposer}), [navigation, route, elevation, forumComposer]);
};

interface MenuContextBridgeProps {
  /** From `useMenuContextBridge()`, called in the component that renders the Menu. */
  bridged: BridgedMenuContexts;
}

/**
 * Carries screen-scoped React contexts into a react-native-paper `Menu`'s children.
 *
 * Paper renders a Menu's children (and anything else in a `<Portal>`) at `Portal.Host`, which sits
 * in `ShellProvider` above every navigator. `PortalManager` re-renders those children from its own
 * state, so the only contexts that survive the trip are Paper's own theme and settings. Everything
 * provided below the host is gone: `useNavigation()` / `useCommonStack()` return the root container
 * (no `push`, crashes on tap), and screen-scoped providers such as `ElevationProvider` fall back to
 * their defaults.
 *
 * The children elements themselves still come from the menu, so a provider placed INSIDE the Menu
 * travels into the portal with them. This component is rendered as the Menu's only direct child
 * (AppMenu does it automatically; raw Paper `Menu`s must do it themselves, and lint enforces that)
 * and re-provides the contexts. It cannot read them itself, because it is portaled too; the values
 * come from `useMenuContextBridge()` run in the menu component. Menu items can then use the normal
 * hooks instead of having navigation or context values drilled in as props.
 *
 * Only the contexts listed here are bridged. A new screen-scoped provider whose value a menu item
 * reads must be added to both the hook and this component. See docs/Navigation.md,
 * "Paper portals remount outside those stacks".
 */
export const MenuContextBridge = ({bridged, children}: PropsWithChildren<MenuContextBridgeProps>) => {
  return (
    <NavigationContext.Provider value={bridged.navigation}>
      <NavigationRouteContext.Provider value={bridged.route}>
        <ElevationContext.Provider value={bridged.elevation}>
          <ForumComposerContext.Provider value={bridged.forumComposer}>{children}</ForumComposerContext.Provider>
        </ElevationContext.Provider>
      </NavigationRouteContext.Provider>
    </NavigationContext.Provider>
  );
};
