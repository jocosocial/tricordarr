Testing
=======

There is no CI for tests yet — lint runs on push, but unit and end-to-end tests only run
where you run them. Please exercise both locally before opening a PR.

```bash
npm test        # unit tests (Jest)
npm run typecheck
npm run lint
```

Note that `npm test` is not currently green on a clean checkout: `TestDateTime`,
`TestNewDayMinuteCalculator` and `TestScheduleMarker` fail (5 tests), apparently
timezone-dependent. Compare against a clean tree before assuming you caused a failure.

End-to-end
----------

End-to-end flows live in `__tests__/e2e/` and run on
[Maestro](https://maestro.mobile.dev). Install it with the official installer
(`curl -Ls "https://get.maestro.mobile.dev" | bash`), which needs a JDK and drops into
`~/.maestro/bin`. The Homebrew formula fails if your Command Line Tools are older than
your Xcode.

Flows drive a real app against a real server, so before running them you need a
[swiftarr](https://github.com/jocosocial/swiftarr) instance, the app built and installed
on a simulator or emulator, Metro running (`npx expo start --dev-client`), and the app
signed in. The `Emulator` server preset points at port `3050`, so set `SWIFTARR_PORT=3050`
in your swiftarr `development.env` if you want that preset to work.

```bash
# iOS
maestro test -e APP_ID=com.grantcohoe.tricordarr __tests__/e2e/Forum/ForumPostReply.yaml

# Android — note the different app ID
maestro test -e APP_ID=com.tricordarr __tests__/e2e/Forum/ForumPostReply.yaml

# With both a simulator and an emulator running, name the target
maestro --device emulator-5554 test -e APP_ID=com.tricordarr <flow>.yaml
```

Two things that will save you time. On Android, use an AVD built from a **non-Play**
system image (`google_apis`, not `google_apis_playstore`); Play images set
`ro.adb.secure=1` and pop an "Allow USB debugging" dialog that nothing can dismiss
programmatically, because every tool you would use goes through adb. Also disable the
system handwriting overlay, which otherwise swallows the first `inputText`:
`adb shell settings put secure stylus_handwriting_enabled 0`.

A flow that passes is not automatically a flow that tests anything. Before trusting a new
one, break the code it covers and confirm it fails — assertions that match any visible
text will happily match rendered content instead of the widget you meant.

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
- `message` — long-pressable message bubbles (`MessageView`). Unlike the others this is
  not unique on screen; every message in a list shares the value, so flows pick one with
  Maestro's `index`.

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

Manual test cases
------------------

Checklist of manual QA cases not yet covered by automated tests.

### Account
#### Registration
* Create account
* Login
* Forgot password
* Forgot username

#### Self Profile
* Edit
* Upload Photo
* delete photo
* change photo
* profile link to forums
* profile link to forum posts for moderators

#### Manage
* change username
* change password
* logout device
* logout all

### Drawer
* directory search

#### User Profile
* view
* favorite / unfavorite
* create private note
* edit private note
* delete private note
* block / unblock
* mute / unmute
* report
* start seamail with user

#### Navigation
* board games
* karaoke
* lighter
* themes
  * view theme
* deck map
  * change decks
* time zone check
* FAQ
* Code of Conduct
* About Twitarr
* About Tricordarr
* Web UI

### Today Screen
* Account Management (see actions above)
* Theme card view theme
* Announcement
* Next event if present
  * tap opens event

### Settings
* Your account (same as above)
* server url
  * healthcheck
  * change signs you out
* change push notifications
  * enable / disable all
* background worker
  * enable / disable
  * start/stop
  * change healthcheck interval
* polling
  * enable / disable
  * change poll interval
* content
<!-- Pick it up here -->

### Forums
* Mentioned notification opens the mentions page and clears the unread

### Schedule
* favorite event (should also update UND)
* unfavorite event (should also update UND)

### LFG
* favorite / unfavorite
* Favorites filter on the Joined and Owned lists returns the starred set
* unfavoriting with the Favorites filter active removes the row from the list
* favorite is unavailable while muted, and mute is unavailable while favorited

### Seamail
* favorite / unfavorite a conversation via the list swipe
* Favorites filter returns the starred set

### Socket Events
* new announcement generates notification
  * tapping notification opens home screen with announcement
