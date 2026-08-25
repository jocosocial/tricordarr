# Navigation

## Nested navigators vs the root container

Screens live in nested stacks (Schedule, LFG, Settings, Chat, …) that sit under `NavigationContainer`. In a screen, `useNavigation()`, `useCommonStack()`, `useSettingsStack()`, and the other stack hooks return **that nested stack**. `goBack()` / `pop()` then pop the screen the user is looking at.

`useCommonStack()` is only a typed `useNavigation()`:

```ts
export const useCommonStack = () => useNavigation<StackNavigationProp<CommonStackParamList>>();
```

It does not search for a “common” navigator. It returns whatever `NavigationContext` is nearest.

## Paper portals remount outside those stacks

`AppView` renders snackbars and banners inside react-native-paper `<Portal>`. Portal content is remounted at `Portal.Host` in `ShellProvider`, which wraps `RootStackNavigator` but is **not** inside a tab or stack navigator:

```
NavigationContainer          ← root NavigationContext
  PaperProvider
    ShellProvider
      Portal.Host            ← menus, snackbars remount here
        RootStackNavigator
          Bottom tabs
            Schedule / LFG / … stacks
              PersonalEventScreen, LfgScreen, …
```

Hooks in a component that **mounts in the portal** (some menu items) see the root container, not the nested stack. TypeScript still types `useCommonStack()` as the common stack, so this compiles and then does the wrong thing:

- `getState().routes` is OOBE / main tabs / lighter — not `PersonalEventScreen`
- `goBack()` / `pop()` run on the **root** stack

React Native Paper menus have the same Host. Closures created in a parent that is still in the navigator tree are fine; calling `useNavigation()` inside a component that itself mounts in the portal is not. See `SetOrganizerMenuItem`.

`Alert.alert` is not a portal. Destructive confirms that run from a screen or header-menu parent should use stack hooks (`useNavigation()`, `useCommonStack()`, …), not NavigationRef.

To pop past a named screen in the **current** stack (for example leave a private event from participation, which sits on top of `personalEventScreen`):

```ts
const state = navigation.getState();
const routeIndex = state.routes.findIndex(
  route => route.name === CommonStackComponents.personalEventScreen,
);
if (routeIndex > 0) {
  navigation.pop(state.index - routeIndex + 1);
} else {
  navigation.goBack();
}
```

To open a screen that may already be below the current one (for example LFG details from chat, or chat from LFG details), use `popToOrPush` in [`src/Libraries/Navigation.ts`](../src/Libraries/Navigation.ts). It walks the **current** stack backward and pops to a matching name+ID, or pushes if that screen is not already there. Same-stack only; it does not jump tabs.

Do not use React Navigation 7 `navigation.popTo()` for this. When the target is missing, `POP_TO` **replaces** the current screen instead of pushing on top of it.

```ts
popToOrPush(navigation, CommonStackComponents.lfgScreen, {fezID}, 'fezID');
```

`openFezParentScreen` / `openFezChatScreen` wrap that helper for LFG and private event chats.

## What to use instead (portal / non-stack code)

[`src/Libraries/NavigationRef.ts`](../src/Libraries/NavigationRef.ts) holds `navigationRef` on `NavigationContainer`. Use it from code that is **not** inside a nested stack: LinkingProvider, CallProvider, NotificationDataListener, and cross-tab `setParams`.

Do not call `useCommonStack()` / `useNavigation()` from components that themselves mount in the portal.

Screens, headers, and `Alert.alert` callbacks in those parents should keep using the stack hooks.

Passing a `navigation` object **into** a portaled menu item as a prop also works: the hook runs on the screen, and the object stays valid after the element remounts in the portal.

## Scroll-to-top

`useScrollToTopIntent` dispatches `setParams` via `navigationRef` so it can find `lfgListScreen` (and similar) in another tab. The target route may not be in the caller's navigator, so stack hooks are not enough.
