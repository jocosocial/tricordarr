Help
====

Guiding principles for what belongs in the in-app Help system. This file is the single source for Help: what to document, and how to build it.

Help is a map of the screen, not a manual of every gesture. If a user would find the thing by looking at the screen, Help does not need to explain it. Err toward leaving things out: every extra entry dilutes the ones that matter.

Document
--------

* **Explicit controls with icons.** Anything the user can see and tap that is drawn as an icon or icon button: FABs, header buttons, Actions Menu items, toolbar/composer buttons, icon buttons on cards. Icons are ambiguous; Help is where they get a name and a meaning.
* **Menu items.** Each Actions Menu item gets an entry (privileged ones under "Privileged Actions").
* **Non-obvious state.** Badges, colors, or indicators whose meaning is not self-evident (e.g. what a muted/favorited/locked marker means).
* **Behavior that surprises.** Things that would cause confusion or data loss if unexplained, e.g. an action that is irreversible, visible to others, or only appears under certain conditions (owner only, moderator only).
* **A short overview of the screen** so the user knows what they are looking at.

Do Not Document
---------------

* **Incidental gestures with no visible affordance**, such as long-press to copy text, tap-to-open on an obvious link or row, or pull to refresh. Users discover these by habit, and the platform conventions carry them.
* **Standard platform behavior** (scrolling, keyboard, back, text selection).
* **Plain text, labels, and rows** that already say what they do.
* **Every row-level swipe or selection mode**, by default. Document one only if it is the *only* way to reach an important action (see below).
* **Implementation details** or anything that changes frequently enough that the Help will be stale.

Judgment Calls
--------------

When a hidden gesture is the **only** way to do something that matters (e.g. swipe-to-delete with no menu equivalent), document it, ideally once in a shared topic rather than per screen. If the same action is also reachable from a visible button or menu item, document the visible one and skip the gesture.

A quick test before adding an entry:

1. Is there a visible icon or menu item for it? If yes, document it.
2. If not, would a reasonable user never find it *and* miss something important? If yes, document it.
3. Otherwise, leave it out.

Review Note
-----------

When reviewing a change, do not request Help entries for incidental gestures. Missing Help for a new icon button, FAB, or menu item is a valid review finding; missing Help for a long press on text is not.

Mechanics
---------

* Use `HelpTopicView` / `HelpChapterTitleView`.
* Link new screens in `HelpManualScreen.tsx`.
* Add new screens to `HelpScreenComponents`.
* "Actions" lists the screen's icon buttons and menu items (exclude Back).
* Privileged actions go under "Privileged Actions".
* FABs:
  * List them before Actions.
  * `BaseFAB` gets HelpTopicView(s).
  * `BaseFABGroup` gets one HelpTopicView per action.
  * Implement a matching `HelpFABView`.
* Swipe / selection behavior: document only when it is the sole path to an important action (see Judgment Calls).
* `ScrollingContentView`: `isStack={true}`, `overScroll={true}`.
* Screen wrapping passes the help screen to `PreRegistrationScreen(helpScreen)`; see "Screen Wrapping" in `AGENTS.md`.
