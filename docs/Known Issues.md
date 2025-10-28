Known Issues
============

```
 WARN  The package /Users/grant/Projects/jocosocial/tricordarr/node_modules/javascript-time-ago/locale/en contains an invalid package.json configuration. Consider raising this issue with the package maintainer(s).
Reason: One or more mappings for subpaths defined in "exports" are invalid. All values must begin with "./". Falling back to file-based resolution.
```

https://gitlab.com/catamphetamine/javascript-time-ago/-/issues/7

Ignore it.

```
A props object containing a "key" prop is being spread into JSX:
  let props = {key: someKey, selectable: ..., style: ..., variant: ..., children: ..., ref: ...};
  <Text {...props} />
React keys must be passed directly to JSX without using spread:
  let props = {selectable: ..., style: ..., variant: ..., children: ..., ref: ...};
  <Text key={someKey} {...props} /> Error Stack:
```

Unrecorded bug in https://github.com/obipawan/react-native-hyperlink. Patched in this repo.

Historical
----------

```
 ERROR  Warning: A props object containing a "key" prop is being spread into JSX:
  let props = {key: someKey, route: ..., borderless: ..., centered: ..., rippleColor: ..., onPress: ..., onLongPress: ..., testID: ..., accessibilityLabe
l: ..., accessibilityRole: ..., accessibilityState: ..., style: ..., children: ...};
  <Touchable {...props} />
React keys must be passed directly to JSX without using spread:
  let props = {route: ..., borderless: ..., centered: ..., rippleColor: ..., onPress: ..., onLongPress: ..., testID: ..., accessibilityLabel: ..., access
ibilityRole: ..., accessibilityState: ..., style: ..., children: ...};
  <Touchable key={someKey} {...props} />
```

https://github.com/callstack/react-native-paper/issues/4401 (PR: https://github.com/callstack/react-native-paper/pull/4494)

```
 ERROR  Warning: TextInput.Icon: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default para
meters instead.
    in TextInput.Icon (created by Formik)
```

Fixed in react-native-paper 5.12.5