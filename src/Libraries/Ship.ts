import {createLogger} from '#src/Libraries/Logger';
import {ProfilePublicData} from '#src/Structs/ControllerStructs';

const logger = createLogger('Ship');

/**
 * Guess the deck number from a location string.
 * ChatGPT wrote this.
 * @param location
 */
export const guessDeckNumber = (location?: string): number | undefined => {
  if (!location) {
    return undefined;
  }
  logger.debug('Matching location', location);
  // deckMatch typically catches Events that come from Sched.
  const deckMatch = location.match(/deck (\d+)/i);
  if (deckMatch) {
    return parseInt(deckMatch[1], 10);
  }
  // roomMatch can catch room numbers that are entered by users.
  const roomMatch = location.match(/(room|rm)? ?(\d{4,5})/i);
  if (roomMatch) {
    const roomNumberString = roomMatch[roomMatch.length - 1];
    if (roomNumberString.length === 4) {
      return parseInt(roomNumberString.substring(0, 1), 10);
    } else if (roomNumberString.length === 5) {
      return parseInt(roomNumberString.substring(0, 2), 10);
    }
  }
  // No deck number found.
  return undefined;
};

/**
 * Room name from a Sched-style location: text before the first comma or '('.
 * Matches Swiftarr `GET /api/v3/admin/feedback/roomlist` (prefix until `,` or `(`).
 * "Lower Main Dining Room, Deck 2, Aft" → "Lower Main Dining Room"
 */
export const getRoomName = (location?: string): string => {
  if (!location) {
    return '';
  }
  const match = /^[^,(]*/.exec(location);
  return (match?.[0] ?? '').trim();
};

/**
 * Unique room names from location strings, sorted alphabetically.
 * Duplicate names that differ only by case are collapsed to the first spelling seen.
 */
export const getUniqueRoomNames = (locations: readonly string[]): string[] => {
  const seen = new Map<string, string>();
  for (const location of locations) {
    const roomName = getRoomName(location);
    if (!roomName) {
      continue;
    }
    const key = roomName.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, roomName);
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
};

export const publicLocationSuggestions = [
  'Atrium, Deck 1, Midship',
  'Casino, Deck 2, Forward',
  'Billboard Onboard, Deck 2, Forward',
  'Gallery Bar, Deck 2, Forward',
  'Rolling Stone Lounge, Deck 2, Midship',
  'Pinnacle Bar, Deck 2, Midship',
  'Pinnacle Restaurant, Deck 2, Midship',
  "Explorer's Lounge, Deck 2, Aft",
  'Lower Main Dining Room, Deck 2, Aft',
  'Ocean Bar, Deck 3, Midship',
  'Upper Main Dining Room, Deck 3, Aft',
  'Fitness Center, Deck 9, Forward',
  'Lido Bar, Deck 9, Midship',
  'Lido Pool Area, Deck 9, Midship',
  'Sea View Bar, Deck 9, Aft',
  'Lido Market, Deck 9, Aft',
  'Canaletto Restaurant, Deck 9, Midship',
  'Sea View Pool Area, Deck 9, Aft',
  'Shuffleboard Court, Deck 10, Midship',
  'High Score Arcade, Deck 10, Midship',
  'Hang 10, Deck 10, Midship',
  "Crow's Nest (Ten Forward), Deck 11, Forward",
  'Ready Room, Deck 11, Forward',
  'Tamarind Restaurant, Deck 11, Midship',
  'Morimoto Restaurant, Deck 11, Midship',
  'Sports Court, Deck 11, Forward',
  'Observation (Sun) Deck, Deck 12, Forward',
];

export const getUserSuggestedLocations = (profilePublicData?: ProfilePublicData) => {
  if (profilePublicData?.roomNumber) {
    return [`Room ${profilePublicData.roomNumber}`]
      .concat(publicLocationSuggestions)
      .concat(['That place where I put that thing that time']);
  }
  return publicLocationSuggestions;
};
