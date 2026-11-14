# Navigation

## Nested navigators vs the root container

Screens live in nested stacks (Schedule, LFG, Settings, Chat, …) that sit under `NavigationContainer`. In a screen, `useNavigation()`, `useCommonStack()`, `useSettingsStack()`, and the other stack hooks return **that nested stack**. `goBack()` / `pop()` then pop the screen the user is looking at.

`useCommonStack()` is only a typed `useNavigation()`:

```ts
export const useCommonStack = () => useNavigation<StackNavigationProp<CommonStackParamList>>();
```

It does not search for a “common” navigator. It returns whatever `NavigationContext` is nearest.

## Paper portals remount outside those stacks

react-native-paper `Menu` (and anything else wrapped in Paper's `<Portal>`) is remounted at `Portal.Host` in `ShellProvider`, which wraps `RootStackNavigator` but is **not** inside a tab or stack navigator:

```
NavigationContainer          ← root NavigationContext
  PaperProvider
    ShellProvider
      Portal.Host            ← menus remount here
        RootStackNavigator
          Bottom tabs
            Schedule / LFG / … stacks
              PersonalEventScreen, LfgScreen, …
```

Paper's `PortalManager` re-renders portal children from its own state at the host, so the only React contexts that survive are Paper's theme and settings. Hooks in a component that **mounts in the portal** (menu items) see the root container, not the nested stack. TypeScript still types `useCommonStack()` as the common stack, so this compiles and then does the wrong thing:

- `push()` is `undefined` on the root container: tapping the item hard-crashes (`undefined is not a function`)
- `getState().routes` is OOBE / main tabs / lighter — not `PersonalEventScreen`
- `goBack()` / `pop()` run on the **root** stack

The same applies to every provider mounted below the host. Screen-scoped providers (`ElevationProvider`, `ForumComposerProvider`, `SelectionProvider`, `MentionTextFieldProvider`) are invisible to a portaled item, which silently reads the context's default value.

### `MenuContextBridge`

The children elements still come from the menu, which is in the navigator tree, so a provider placed **inside** the Menu travels into the portal with them. `src/Components/Menus/MenuContextBridge.tsx` has two halves:

- `useMenuContextBridge()` runs in the **menu component** (in the tree) and captures `NavigationContext`, `NavigationRouteContext`, `ElevationContext` and `ForumComposerContext`.
- `<MenuContextBridge bridged={...}>` is rendered **inside** the Menu and re-provides those values around the children.

The split matters: the bridge component is itself portaled, so it cannot read the contexts on its own. The values have to arrive as a prop from the hook. (The first version read them inside the bridge and crashed exactly like the un-bridged code.) With both halves in place, menu items use the normal hooks (`useCommonStack()`, `useFezAlert()`, `useElevation()`, `useForumComposer()`) and nothing needs to be drilled in as a prop.

```tsx
const bridged = useMenuContextBridge();
return (
  <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
    <MenuContextBridge bridged={bridged}>{/* items */}</MenuContextBridge>
  </Menu>
);
```

- `AppMenu` does both halves automatically.
- A raw Paper `<Menu>` must render `<MenuContextBridge>` as its **only** direct child (see `EventCardActionsMenu`, `ForumPostActionsMenu`, `DayPlannerCardActionsMenu`). A `no-restricted-syntax` rule in `.eslintrc.js` flags any other element, fragment or `{expression}` child of a raw `Menu`, so a missing bridge fails lint rather than crashing on tap.
- Only the contexts listed in the bridge are carried. A new screen-scoped provider whose value a menu item reads must be added there, or the item reads the default.
- Moving `Portal.Host` is not the fix: it has to sit above the navigators so menus can paint over the header and tab bar.
- The app snackbar is **not** portaled. `AppView` renders `AppSnackbar` inline as its last child, so it pins to the bottom of the screen content (just above the tab bar) and keeps every context. Keep it that way; a portaled snackbar would lose them again.

Closures created in the menu itself were always fine, and still are; the bridge is what makes hooks inside the items safe too.

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

Inside a menu, rely on `MenuContextBridge` (above) rather than NavigationRef. Outside a menu, do not call `useCommonStack()` / `useNavigation()` from a component that itself mounts in a portal unless something re-provides the context there.

Screens, headers, and `Alert.alert` callbacks in those parents should keep using the stack hooks.

## Scroll-to-top

`useScrollToTopIntent` dispatches `setParams` via `navigationRef` so it can find `lfgListScreen` (and similar) in another tab. The target route may not be in the caller's navigator, so stack hooks are not enough.
