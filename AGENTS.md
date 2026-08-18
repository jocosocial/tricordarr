# Tricordarr (React Native, TypeScript)

## RefreshControl

- ALWAYS use `useRefresh` (`src/Hooks/useRefresh.ts`)
- NEVER use React Query `isFetching` with RefreshControl
- ALWAYS use `AppRefreshControl`
- `isFetching*` flags are NOT for RefreshControl
  - `isLoading` → initial empty load
  - `isRefetching` → background refetch
  - `isFetchingNext/PreviousPage` → pagination only

## API

- Swiftarr API dates are ISO8601 strings

## Clipboard

- Use `useClipboard()` for iOS feedback

## Structure

- Components: `src/Components`
- Screens: `src/Screens`
- Queries: `src/Queries`
- Hooks: `src/Hooks`
- Context: `src/Context`

## Debugging

- iOS localhost: `127.0.0.1`
- Android emulator: `10.0.2.2`
- Tell users they may need `adb reverse tcp:7848 tcp:7848` to port forward

## Help Screens

- Use `HelpTopicView` / `HelpChapterTitleView`
- Link new screens in `HelpManualScreen.tsx`
- Include “Actions” (exclude Back)
- Privileged actions → “Privileged Actions”
- FABs:
  - Listed before Actions
  - `BaseFAB` → HelpTopicView(s)
  - `BaseFABGroup` → one HelpTopicView per action
  - Implement matching `HelpFABView`
- Swipe / selection behavior must be documented
- Add to `HelpScreenComponents`
- `ScrollingContentView`: `isStack={true}`, `overScroll={true}`

## Screen Wrapping

Default pattern:
LoggedInScreen

- PreRegistrationScreen(helpScreen)
- DisabledFeatureScreen(feature)
- ScreenInner

## Platform

- Use `src/Libraries/Platform/Detection.ts`

## Menus (Actions Menus)

- Visibility: `useMenu`
- Anchor: `MenuAnchor`
- Mutating items: call `onClose` in mutation `onSettled`
- Toggle / Navigation items: NO `onClose`
- Action items (e.g. Share): MUST provide `onClose`

## Queries / Mutations

- Invalidate via `getCacheKeys()`
- NEVER hardcode query keys

## Code Smells

- NEVER disable ESLint validation such as `eslint-disable-next-line react-hooks/exhaustive-deps`
- Do not remove comments unless they are no longer relevant or are being updated

## Lists

- Implementors of `BaseSwipeable.tsx` must have a `key`

## Logging

Use `createLogger` rather than `console.log`

## Reducers

- Never mutate state within a reducer

## Components

- Components must be pure

## Styles

- All styles come from `useStyles()` (`commonStyles`, `styleDefaults`, `screenOptions`); definitions live in `StyleProvider.tsx`. There is no separate static style library.
- Never pass an array to `style`; merge once into a single object via `StyleSheet.create({foo: {...commonStyles.a, ...commonStyles.b}})`. Array styles allocate a new array every render and must be flattened each time; a merged `StyleSheet.create` object is a single stable reference.
- Component-specific styles: fully static ones go in a module-scope `StyleSheet.create` outside the component; styles depending on `commonStyles`, theme, or props are built inside the component with `StyleSheet.create` wrapped in `useMemo` keyed on those inputs, so style references stay stable for memoized children.
- Color values needed outside React (foreground services) come from `getTheme()` in `#src/Styles/Theme`.

## Hooks

- No conditional hooks
- No new namespaces in `ControllerStructs.tsx`. New hooks named after the struct. `FezData` => `useFezData`

## Patches

- Regenerate with `npx patch-package <package>`
- Before regenerating, remove build artifacts from the package in `node_modules` (e.g. `android/{.gradle,build}`) or the patch will include binaries

## Building

- Do not run builds in the agent. Instead tell the user to run a build in their terminal.
