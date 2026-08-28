Testing
=======

testID
------

Form fields and interactive buttons take a required `testID` (or `testIDPrefix` for image pickers). Maestro maps that to `id:`.

Pattern: `{formOrScreen}{Control}-{kind}`

- Stem is alphanumeric camelCase. Strip spaces and punctuation the same way OOBE buttons do (`oobeIAgree-button` from "I Agree").
- Unique per form or component, not globally. Shared forms keep one ID; only one instance is on screen at a time.
- Put `testID` on the tappable/editable control (Paper `Button` / `TextInput` / `Switch` / `FAB` / `IconButton`, community `Slider`, RNGH `RectButton`), not an outer `View`.

Kinds:

- `input` — text, search, chips search
- `button` — `PrimaryActionButton`, pickers, swipe actions, segmented, schedule chips, image actions
- `switch` — `BooleanField`
- `slider` — `SliderField`
- `fab` — FABs and FAB group actions
- `headerButton` — header `Item`s

Examples: `loginUsername-input`, `loginSubmit-button`, `serverChoice-button`, `oobeNext-button`, `seamailCreate-fab`, `headerEdit-headerButton`, `forumThreadFavorite-button`.

Special cases:

- `ImageButtons` take `testIDPrefix` and emit `{prefix}Attach-button`, `{prefix}Take-button`, `{prefix}Delete-button`.
- `OobeButtonsView` generates IDs from the label (`oobeIAgree-button`, `oobeNext-button`).
- `StringChipsField` uses the field `testID` for the input and `{stem}Add-button` for the add control.

Maestro:

```yaml
- tapOn:
    id: 'loginSubmit-button'
```
