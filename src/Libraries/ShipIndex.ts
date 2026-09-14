import {createLogger} from '#src/Libraries/Logger';
import {getRoomName, guessDeckNumber} from '#src/Libraries/Ship';
import {ShipDeck, ShipIndex, ShipLabel, ShipRegion} from '#src/Structs/ShipStructs';

const logger = createLogger('ShipIndex');

/**
 * Resolved location to show on the map: which deck, which region band (if any),
 * and every label to highlight. A venue can legitimately be captioned more than
 * once on a deck (port and starboard Lido Market), so this is a list, not one box.
 */
export interface MapTarget {
  deckNumber: number;
  region?: ShipRegion;
  labels: ShipLabel[];
}

export interface MapTargetParams {
  deckNumber?: number;
  region?: ShipRegion;
  /// Venue/facility slug from ship.json.
  venue?: string;
  /// Stateroom number, e.g. "1234" or a lettered sub-unit like "7000A".
  room?: string;
  /// Raw Sched-style location string ("Ocean Bar, Deck 3, Midship"), resolved against
  /// each label's `matches`/`aliases`/`name`, then falling back to guessDeckNumber().
  location?: string;
}

const norm = (text: string) => text.trim().toLowerCase();

/// A stateroom number with an optional lettered sub-unit ("7000A" -> owner's suite D).
const ROOM_NUMBER_RE = /^(\d{4,5})([A-Za-z])?$/;

/**
 * Parse a user-entered or profile-stored room number ("1234", "7000A") into
 * the {number, suffix} shape ship.json cabin labels use. Returns undefined
 * for anything that isn't a plain stateroom number, so callers can tell a
 * garbage value from one that's well-formed but just not on the map.
 */
export const parseRoomNumber = (raw: string): {number: number; suffix?: string} | undefined => {
  const match = ROOM_NUMBER_RE.exec(raw.trim());
  if (!match) {
    return undefined;
  }
  return {number: Number(match[1]), suffix: match[2]?.toUpperCase()};
};

/**
 * Every cabin label matching a stateroom number (label.number is the full
 * 4-5 digit number Kraken's deck-prefix rule already validated at index-build
 * time, so simple equality is enough here). A number with no suffix given can
 * match more than one lettered sub-unit sharing that number (deck 7's owner's
 * suites) - all of them highlight, same as a venue captioned more than once.
 */
const findCabinLabels = (
  decks: readonly ShipDeck[],
  room: {number: number; suffix?: string},
): {deck: ShipDeck; labels: ShipLabel[]} | undefined => {
  for (const deck of decks) {
    const labels = deck.labels.filter(
      l => l.kind === 'cabin' && l.number === room.number && (!room.suffix || l.suffix === room.suffix),
    );
    if (labels.length) {
      return {deck, labels};
    }
  }
  return undefined;
};

const findVenueLabels = (
  decks: readonly ShipDeck[],
  slug: string,
  deckNumber?: number,
): {deck: ShipDeck; labels: ShipLabel[]}[] => {
  const results: {deck: ShipDeck; labels: ShipLabel[]}[] = [];
  for (const deck of decks) {
    if (deckNumber !== undefined && deck.number !== deckNumber) {
      continue;
    }
    const labels = deck.labels.filter(l => l.slug === slug);
    if (labels.length) {
      results.push({deck, labels});
    }
  }
  return results;
};

/**
 * Case-insensitive match of a Sched-style location string against a label's
 * hand-maintained `matches`, then its `name`/`aliases` compared to the location's
 * room-name prefix (the part before the first comma/paren — same rule getRoomName
 * already applies to Sched strings).
 */
const findLabelForLocation = (
  decks: readonly ShipDeck[],
  location: string,
): {deck: ShipDeck; label: ShipLabel} | undefined => {
  const wanted = norm(location);
  const roomName = norm(getRoomName(location));

  for (const deck of decks) {
    for (const label of deck.labels) {
      if (label.matches.some(m => norm(m) === wanted)) {
        return {deck, label};
      }
    }
  }
  if (!roomName) {
    return undefined;
  }
  for (const deck of decks) {
    for (const label of deck.labels) {
      if (label.kind === 'cabin') {
        continue;
      }
      if (norm(label.name) === roomName || label.aliases.some(a => norm(a) === roomName)) {
        return {deck, label};
      }
    }
  }
  return undefined;
};

/**
 * Resolve route params / a raw location string to a deck and the labels to
 * highlight on it. Tries, in order: venue slug, stateroom number, location
 * string (matches, then name/alias, then guessDeckNumber's deck-and-room-number
 * heuristics), then region/deck alone. Returns undefined only when nothing in
 * the index and nothing in the params identifies even a deck.
 */
export const resolveTarget = (index: ShipIndex | undefined, params: MapTargetParams): MapTarget | undefined => {
  if (!index) {
    return params.deckNumber !== undefined
      ? {deckNumber: params.deckNumber, region: params.region, labels: []}
      : undefined;
  }

  if (params.venue) {
    const hits = findVenueLabels(index.decks, params.venue, params.deckNumber);
    if (hits.length) {
      // Prefer the first deck named (or the venue's first occurrence) rather than
      // merging labels across decks, so a venue name reused ship-wide doesn't
      // highlight boxes on a deck the caller isn't looking at.
      const {deck, labels} = hits[0];
      return {deckNumber: deck.number, region: params.region, labels};
    }
    logger.debug('venue slug not found in index', params.venue);
  }

  if (params.room !== undefined) {
    const parsed = parseRoomNumber(params.room);
    const hit = parsed && findCabinLabels(index.decks, parsed);
    if (hit) {
      return {deckNumber: hit.deck.number, labels: hit.labels};
    }
    logger.debug('room number not found in index', params.room);
  }

  if (params.location) {
    const hit = findLabelForLocation(index.decks, params.location);
    if (hit) {
      return {deckNumber: hit.deck.number, labels: [hit.label]};
    }
    const guessedDeck = guessDeckNumber(params.location);
    if (guessedDeck !== undefined && index.decks.some(d => d.number === guessedDeck)) {
      return {deckNumber: guessedDeck, labels: []};
    }
    logger.debug('location string did not resolve', params.location);
  }

  if (params.deckNumber !== undefined) {
    return {deckNumber: params.deckNumber, region: params.region, labels: []};
  }

  return undefined;
};

export interface ShipSearchResult {
  deckNumber: number;
  kind: ShipLabel['kind'];
  /// Slug for a venue/facility result, or the stateroom number as a string.
  key: string;
  name: string;
  /// Every label this result should highlight (a venue can be captioned twice).
  labels: ShipLabel[];
}

/**
 * Typeahead over the index: venue/facility names and aliases first, then stateroom
 * numbers by prefix. Results are grouped by (deck, slug) so a twice-captioned venue
 * is one row, not two. Capped at 12, as Kraken's own search does — past that the
 * query is too ambiguous to be useful as a list.
 */
export const searchLabels = (index: ShipIndex | undefined, query: string, limit = 12): ShipSearchResult[] => {
  const q = norm(query);
  if (!index || q.length < 2) {
    return [];
  }

  const grouped = new Map<string, ShipSearchResult>();
  const pushLabel = (deck: ShipDeck, label: ShipLabel) => {
    const key = label.slug ?? String(label.number);
    const groupKey = `${deck.number}:${key}`;
    const existing = grouped.get(groupKey);
    if (existing) {
      existing.labels.push(label);
    } else {
      grouped.set(groupKey, {deckNumber: deck.number, kind: label.kind, key, name: label.name, labels: [label]});
    }
  };

  for (const deck of index.decks) {
    for (const label of deck.labels) {
      if (label.kind === 'facility') {
        continue;
      }
      if (label.kind === 'venue') {
        const haystack = [label.name, label.raw, ...label.aliases].map(norm);
        if (haystack.some(h => h.includes(q))) {
          pushLabel(deck, label);
        }
      } else if (label.kind === 'cabin' && label.number !== undefined && String(label.number).startsWith(q)) {
        pushLabel(deck, label);
      }
    }
    if (grouped.size > limit) {
      break;
    }
  }

  const results = [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name));
  // Ambiguous queries (a bare digit against every stateroom range) produce more
  // hits than are useful as a list; Kraken returns nothing rather than a wall of
  // results in this case.
  return results.length > limit ? [] : results;
};
