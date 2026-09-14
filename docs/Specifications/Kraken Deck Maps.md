# How The Kraken Implements Deck Maps

Analysis of `~/Projects/public/thekraken` for reuse in Tricordarr. Focus: PDF processing, rendering, overlays, and the (often assumed) OCR path.

**Bottom line:** Kraken does **not** OCR the deck plans. It ships a cropped Holland America PDF that already has a selectable text layer, searches that layer with Apple PDFKit, and draws a red arrow `PDFAnnotation` on the matching page. The only Vision OCR in Kraken is photostream privacy blur, unrelated to maps.

Tricordarr already shows the same ship as static PNGs and only guesses a deck number. The interesting Kraken capability is **room-level search + a pointer overlay**, not runtime OCR.

---

## Feature at a glance

Kraken’s Deck Maps tab is a local, offline viewer for the Nieuw Amsterdam. Users can:

- Flip decks with a 1–11 segmented control
- Pinch-zoom a `PDFView`
- Search a venue name or suite number
- Deep-link from schedule events, performer bios, and a user’s cabin number
- See a red arrow at the port or starboard edge pointing at the match

Marketing copy (`Resources/AboutKraken.md`): “Kraken's deck maps let you search for a room by name or number.”

There is no server map API. The PDF is bundled. The feature can still be disabled via Twitarr’s `deck_plans` flag (`ValidSections.swift`).

---

## Source map

| Path | Role |
| --- | --- |
| `Kraken/Deck Maps/DeckMapViewController.swift` | UI: `PDFView`, deck picker, Find overlay |
| `Kraken/Deck Maps/DeckDataManager.swift` | PDF load, room index, search, pointer annotation |
| `Resources/Deck Plans/Decks.pdf` | Bundled 12-page map (~1.8 MB) |
| `Asset Masters/Deck/Deck {1–12}.pdf` | Per-deck sources used to build `Decks.pdf` |
| `Kraken/Base.lproj/Main.storyboard` | `DeckMapNavController` + Find overlay layout |
| `Kraken/Common UI/Basic VCs/BaseCollectionViewController.swift` | `showRoomOnDeckMap` segue (`String` location) |

Callers of `showRoomOnDeckMap`:

- Schedule event cells / single-event VC (event `location`)
- User profile (“show cabin on map” if `isValidRoom`)
- Performer bio

`DeckDataManager` exists specifically as a global resolver: “can this string be pointed to on the maps?”

---

## The PDF is the map and the spatial index

### What is shipped

`Decks.pdf` is a 12-page, unencrypted PDF 1.4 produced by macOS Quartz (`Feb 15, 2024`). Each page is a **letter-size HAL brochure page** (`MediaBox` 612×792 pt) with a **tight CropBox** around the ship silhouette only:

| Box | Page 1 |
| --- | --- |
| MediaBox | `0, 0, 612, 792` |
| CropBox | `432.54, 31.55, 572.54, 731.55` (~140×700 pt) |

`pdfinfo` reports page size 140×700 because it uses the crop. The left side of the original page is the stateroom legend, category key, and “NIEUW AMSTERDAM / DECK PLANS” copy. Cropping hides that chrome so the viewer is just the hull.

The file is tagged and has **real outline text**, not a scanned bitmap. Fonts are embedded HAL brochure faces (Neutraface, Univers, Futura). Room labels look like `F1002`, `D1014` (category letter + number). Venue names are often split across lines (`FUTURE` / `CRUISES`, `GUEST` / `SERVICES`).

That text layer is why search works without OCR. `DeckDataManager` even says it is “pretty closely bonded with the exact contents of this PDF.”

### How the PDF is built

`Asset Masters/Deck/` has one cropped PDF per deck plus a combined `Decks.pdf`. Same producer and crop style as the bundle. Page index **0 → Deck 1**, …, **11 → Deck 12**.

---

## Rendering

`DeckMapViewController` is a thin PDFKit wrapper:

```swift
pdfView.document = DeckDataManager.shared.document
pdfView.displayMode = .singlePage
```

Scale is derived from page 0’s **crop box** vs the view:

- `minScaleFactor` ≈ `1.14 * viewHeight / pageHeight` (nearly fit-height, a little extra so you can scroll)
- `maxScaleFactor` ≈ `0.97 * viewWidth / pageWidth` (almost fit-width)

On a phone that is roughly **1.1×–2.9×**. PDFKit handles pinch-zoom, pan, and page changes.

The nav title is hardcoded (`1 - Main Deck`, …). The segmented control only has **11** segments. Deck 12 exists in the PDF and in `namedRooms` (`Sun Deck`) but is not in the picker; `setNavBarTitle()` falls through to `"Unknown Deck"` for 12.

The Find panel is a `UIVisualEffectView` (regular blur) that slides in from the trailing edge. It is a search UI overlay, not a map overlay.

Network banner is turned off: maps are local.

---

## “OCR” is PDFKit text search

There is no `Vision`, `VNRecognizeTextRequest`, or Tesseract on the map path. Locations come from:

```swift
doc.findString(searchStr, withOptions: .caseInsensitive) -> [PDFSelection]
```

A `PDFSelection` has:

- the matched string
- page(s)
- `bounds(for: page)` in PDF space

That is enough to know **which deck** and **where on the page**.

### Named venues (hand-curated)

On init, `DeckDataManager` builds `namedRooms` by searching for known strings on a given page. Each `RoomLocation` stores:

| Field | Meaning |
| --- | --- |
| `name` | Colloquial name shown in search / used for matching |
| `alternateNames` | Aliases (`"The Main Stage"` → World Stage) |
| `deck` | 1-based page index |
| `location` | The `PDFSelection` |
| `isPortSide` | `selection.midX < cropBox.midX` |
| `isFullDeck` | Whole-deck targets (deck names) |

If the pretty name is not in the PDF, a `searchString` is supplied, often with a newline to match stacked labels:

```swift
RoomLocation("Future Cruises", 1, in: pdfDoc, searchString: "FUTURE\nCRUISES")
RoomLocation("Billboard Onboard", 2, in: pdfDoc, searchString: "BILLBOARD\nONBOARD")
```

Some venues are **aliased onto another label’s geometry** when the PDF does not say the JoCo name:

- Crafting Room → `PORTRAIT\nSTUDIO`
- Café / Ten Forward → `Crow’s Nest`

Whole decks are a selection of the full crop box, used to zoom to “the whole floor” rather than a room.

If `findString` misses, the room is still inserted with an empty selection (pointer will no-op). There is no fallback OCR.

### Suite numbers (discovered at search time)

Numbered cabins are **not** pre-indexed. Search hits the PDF live.

Exact resolve (`findRoom(named:)`), used by deep links:

1. Split on `,` (Sched-style `"Stuyvesant Room, Deck 3, Forward"`)
2. Strip a trailing `" Room"`
3. If a later phrase is `"Deck N"`, prefer that deck
4. Special cases: any `"Dining"` → Dining Room; `"Ten Forward"` stays Ten Forward
5. Match `namedRooms` by name / alias
6. Else scan for a **4-digit** number, or **5-digit starting with `1`** (deck 10–11)
7. `findString` that number; keep the hit only if the string **prefixes the page’s deck number** (`1001` on page 1, `11001` on page 11)

That prefix check drops stray legend hits (accessibility copy lists rooms from other decks).

Typeahead (`findRooms(matching:)`, max 12 results):

1. Substring-match `namedRooms`
2. If none, `findString` the query
3. Grow the selection left/right while the next character is a digit (so `101` → `1012`)
4. Same deck-prefix validation
5. Sort by name; more than 12 hits → empty (too ambiguous)

Displayed name becomes `"Suite 1012"` even though the PDF glyph is `"F1012"`. Category letters are ignored.

### Event-string massaging

This is the same problem Tricordarr’s `getRoomName()` / `guessDeckNumber()` solve, but Kraken also **resolves a point**:

- `"Stuyvesant Room, Deck 3, Forward"` → Stuyvesant on deck 3
- `"Atrium"` vs `"Atrium Bar"` is why they match the full first phrase, not a naive contains on every room

---

## The fancy overlay: one red arrow annotation

`pointAtRoom(_:forView:)` is the overlay.

1. Remove the previous `roomPointer` from its page (one global arrow; last viewer wins).
2. Take the selection bounds on its page.
3. Rebuild a **20 pt wide** rect at the **port or starboard crop edge**, same vertical span as the room.
4. Add a `PDFAnnotation` of type `.line`:
   - port: arrow on the **end** (points starboard / inward)
   - starboard: arrow on the **start**
   - color red
5. Zoom:
   - full-deck target → `minScaleFactor`
   - room → `maxScaleFactor`
6. `pdfView.go(to: navBounds, on: page)` with vertical padding so the arrow sits in view.

Port/starboard is inferred from geometry, not from the location string’s “Forward / Aft / Port” suffix.

Because the annotation lives on the `PDFPage`, it pans and zooms with the map. No separate overlay canvas, no marker views, no coordinate conversion at draw time.

---

## Navigation and product wiring

```
Daily "Deck Maps"  →  DeckMapRoot  →  empty map
Schedule / profile / performer  →  ShowRoomOnDeckMap(String)  →  pointAtRoomNamed
```

`isValidRoom(name:)` hides the profile map row when the cabin string does not resolve.

Disabled-content copy treats the tab as “Deck Maps” even though the enum is `deckPlans`.

---

## Vision OCR in Kraken (not maps)

`Kraken/Photostream/PhotostreamCamera.swift` uses `VNRecognizeTextRequest` after a photostream capture. If any text is found, those bounding boxes mask a heavy Gaussian blur (`sigma: 100`) via `CIFilter.blendWithMask`. Purpose: strip readable text (badges, nametags, screens) before upload.

That pipeline is **image in → image out**. It does not feed `DeckDataManager`. Do not copy it for maps unless you only have rasters and no text layer.

---

## What Tricordarr does today

| | Kraken | Tricordarr (`MapScreen`) |
| --- | --- | --- |
| Asset | Cropped 12-page `Decks.pdf` | `assets/map/deck{1-12}.png` (773×5782) |
| Viewer | PDFKit `PDFView`, pinch-zoom | `AppImage` `scaledimage` in a scroll view; tap opens Lightbox |
| Deck switch | Segmented control 1–11 | `DeckMapMenu` 1–12 |
| Deep link | Resolves room and **points at it** | `guessDeckNumber()` opens that **deck only** |
| Search | Name + suite, live PDF search | None |
| Overlay | Red edge arrow annotation | Port / Forward / Aft / Starboard chrome only |
| Room list | Hardcoded named rooms + PDF suites | `ShipDecks` room ranges + `publicLocationSuggestions` |

The PNGs are the same HAL Nieuw Amsterdam plans (same labels: World Stage, Atrium, F/D/C/E staterooms). Aspect ratio is **not** the PDF crop:

- PDF crop: 140 / 700 = **0.200**
- PNGs: 773 / 5782 = **0.134**

So the PNGs are a tighter or differently padded crop. You cannot scale CropBox points onto the PNG with a single uniform scale and expect the arrow to land.

`guessDeckNumber` already mirrors Kraken’s `"Deck N"` / 4–5 digit room prefix logic. `getRoomName()` already strips Sched suffixes the way Kraken splits on commas.

---

## Implications if you want Kraken-style pointing

### 1. Prefer a build-time index over runtime OCR

The PDF already has the words and boxes. A one-shot script (`pdftotext -bbox-layout`, pdf.js, or a tiny Swift PDFKit tool) can emit JSON:

```json
{
  "deck": 1,
  "kind": "suite",
  "label": "1002",
  "raw": "F1002",
  "x": 0.21,
  "y": 0.25,
  "w": 0.08,
  "h": 0.01,
  "port": true
}
```

Use **normalized crop-relative** coordinates (or pixels if you re-export PNGs from that same crop). Bundle the JSON. Search becomes an in-memory filter, same as `namedRooms` + suite discovery, with no PDFKit and no OCR on device.

Keep Kraken’s hand aliases (`Ten Forward` → Crow’s Nest, `FUTURE\nCRUISES`, dining-room special case). Those are product knowledge, not extractable.

### 2. Runtime PDF in React Native is a poor port of this design

PDFKit’s value here is `findString` + `PDFSelection.bounds` + `PDFAnnotation` on the same document the user sees. On RN:

- iOS: you could bridge PDFKit (heavy, iOS-only).
- Android: no PDFKit. Typical RN PDF viewers render pages to images and do not expose per-glyph search the same way.
- You would reimplement search and the arrow yourself anyway.

If you want PDF as the viewer, do it as a **native iOS experiment**, not as the cross-platform architecture.

### 3. OCR only pays off if you stay on the current PNGs

If you keep the 773×5782 rasters, PDF boxes are in a different crop. Then you need either:

- **Re-export** the PNGs from `Decks.pdf` CropBox so PDF coords and pixels share a transform, or
- **Offline OCR** of the PNGs (Vision on a Mac, Tesseract, ML Kit) to get boxes already in image space.

Runtime OCR on every map open is slower, flakier (stacked labels, category+number tokens, tiny type), and unnecessary given the PDF text layer.

If you do OCR once offline, treat it like Kraken’s `findString`: produce the same `RoomLocation` list, then throw the OCR engine away.

### 4. Overlay in Tricordarr

You do not need PDF annotations. Once you have a box in image space:

- Render the deck PNG in a zoomable view (`react-native-image-zoom`, Skia, or a custom `ScrollView` + scale).
- Draw a sibling view (or Skia path): a 20 pt-wide red line at the port or starboard edge of the **image**, vertically aligned with the room, arrow pointing inboard.
- On room select: jump deck, set zoom near Kraken’s max scale, scroll so the arrow is on screen.

Lightbox-on-tap fights this; the map itself should be the zoom surface.

### 5. Suggested adoption order

1. Offline extractor → `rooms.json` (named + suites + port flag).
2. Reuse Kraken’s alias table and Sched-string cleanup (you already have half of this in `Ship.ts`).
3. Search UI (typeahead, cap ~12 results).
4. Zoomable map + edge arrow.
5. Change `mapScreen` params from `{ deckNumber }` to `{ deckNumber, room? }` and pass that from schedule / profile / photostream.
6. Only then consider live PDF or on-device OCR — you likely will not need them.

---

## Caveats copied from Kraken

- **Ship-specific.** New HAL PDF or a different ship means new crops, new aliases, and a re-run of the indexer. Decks 4–6 / 10–12 in the current file are mostly cabins; venue lists are sparse by design.
- **False friends in the PDF.** Legend and accessibility notes mention rooms on other decks; the “number prefix equals page deck” rule is load-bearing.
- **Shared geometry.** Several JoCo names point at one PDF label. Search should collapse those so users do not see two pins on one room (Kraken’s `alternateNames` comment).
- **One pointer.** Kraken keeps a single annotation on the shared `PDFDocument`. If two screens used it at once they would fight. A RN overlay should be view-local state.
- **Deck 12.** Wire it if you port the picker; Kraken’s control forgot it.
- **Copyright.** `Decks.pdf` is a Holland America plan. Tricordarr already ships derived PNGs; keep using your existing asset pipeline and do not republish the full brochure page (legend + legal) if you can stay on the cropped hull.

---

## Files worth reading first

1. `DeckDataManager.swift` — all search, indexing, and overlay logic (~410 lines, including a stale room list in the footer comment).
2. `DeckMapViewController.swift` — viewer + Find UI (~217 lines).
3. `EventCell.mapButtonHit` and `BaseCollectionViewController` `showRoomOnDeckMap` — how locations enter the feature.
4. `PhotostreamCamera.textRecognizeDone` — only if you want the **privacy blur** OCR pattern, not maps.
