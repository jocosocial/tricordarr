# Navigation

## Nested navigators vs the root container

Screens live in nested stacks (Schedule, LFG, Settings, Chat, …) that sit under `NavigationContainer`. In a screen, `useNavigation()`, `useCommonStack()`, `useSettingsStack()`, and the other stack hooks return **that nested stack**. `goBack()` / `pop()` then pop the screen the user is looking at.

`useCommonStack()` is only a typed `useNavigation()`:

```ts
export const useCommonStack = () => useNavigation<StackNavigationProp<CommonStackParamList>>();
```

It does not search for a “common” navigator. It returns whatever `NavigationContext` is nearest.

## Paper portals remount outside those stacks

`AppView` renders `AppModal` (and snackbars/banners) inside react-native-paper `<Portal>`. Portal content is remounted at `Portal.Host` in `ShellProvider`, which wraps `RootStackNavigator` but is **not** inside a tab or stack navigator:

```
NavigationContainer          ← root NavigationContext
  PaperProvider
    ShellProvider
      Portal.Host            ← AppModal, menus, snackbars remount here
        RootStackNavigator
          Bottom tabs
            Schedule / LFG / … stacks
              PersonalEventScreen, LfgScreen, …
```

Hooks in a component that **mounts in the portal** (modal content, some menu items) see the root container, not the nested stack. TypeScript still types `useCommonStack()` as the common stack, so this compiles and then does the wrong thing:

- `getState().routes` is OOBE / main tabs / lighter — not `PersonalEventScreen`
- `goBack()` / `pop()` run on the **root** stack

React Native Paper menus have the same Host. Closures created in a parent that is still in the navigator tree are fine; calling `useNavigation()` inside a component that itself mounts in the portal is not. See `SetOrganizerMenuItem`.

## What to use instead

[`src/Libraries/NavigationRef.ts`](../src/Libraries/NavigationRef.ts) holds `navigationRef` on `NavigationContainer`. `goBack()` and `pop()` on the container ref target the **focused** nested navigator. `popPastScreen()` walks the nested tree, finds the stack that actually contains a named screen, and pops that stack.

Use those helpers from modal (and other portal) code. Do not call `useCommonStack()` / `useNavigation()` there.

Screens and headers that are still under a stack navigator should keep using the stack hooks.

Passing a `navigation` object **into** modal content as a prop also works: the hook runs on the screen, and the object stays valid after the element remounts in the portal.

## Scroll-to-top

`useScrollToTopIntent` dispatches `setParams` via `navigationRef` so it can find `lfgListScreen` (and similar) in another tab even when the caller is a modal.
