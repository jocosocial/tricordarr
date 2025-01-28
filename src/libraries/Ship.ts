import {ImageURISource} from 'react-native';
// @ts-ignore
import deck1 from '../../assets/map/deck1.png';
// @ts-ignore
import deck2 from '../../assets/map/deck2.png';
// @ts-ignore
import deck3 from '../../assets/map/deck3.png';
// @ts-ignore
import deck4 from '../../assets/map/deck4.png';
// @ts-ignore
import deck5 from '../../assets/map/deck5.png';
// @ts-ignore
import deck6 from '../../assets/map/deck6.png';
// @ts-ignore
import deck7 from '../../assets/map/deck7.png';
// @ts-ignore
import deck8 from '../../assets/map/deck8.png';
// @ts-ignore
import deck9 from '../../assets/map/deck9.png';
// @ts-ignore
import deck10 from '../../assets/map/deck10.png';
// @ts-ignore
import deck11 from '../../assets/map/deck11.png';
// @ts-ignore
import deck12 from '../../assets/map/deck12.png';
import {ProfilePublicData} from './Structs/ControllerStructs.tsx';

export interface DeckData {
  number: number;
  label: string;
  roomStart?: number;
  roomEnd?: number;
  imageSource: ImageURISource;
}

export const ShipDecks: DeckData[] = [
  {number: 1, label: 'Main', roomStart: 1001, roomEnd: 1130, imageSource: deck1},
  {number: 2, label: 'Lower Promenade', imageSource: deck2},
  {number: 3, label: 'Promenade', imageSource: deck3},
  {number: 4, label: 'Upper Promenade', roomStart: 4001, roomEnd: 4189, imageSource: deck4},
  {number: 5, label: 'Verandah', roomStart: 5001, roomEnd: 5193, imageSource: deck5},
  {number: 6, label: 'Upper Verandah', roomStart: 6001, roomEnd: 6181, imageSource: deck6},
  {number: 7, label: 'Rotterdam', roomStart: 7001, roomEnd: 7143, imageSource: deck7},
  {number: 8, label: 'Navigation', roomStart: 8001, roomEnd: 8175, imageSource: deck8},
  {number: 9, label: 'Lido', imageSource: deck9},
  {number: 10, label: 'Panorama', roomStart: 10001, roomEnd: 10046, imageSource: deck10},
  {number: 11, label: 'Observation', roomStart: 11001, roomEnd: 11010, imageSource: deck11},
  {number: 12, label: 'Sun', imageSource: deck12},
];

/**
 * Guess the deck number from a location string.
 * ChatGPT wrote this.
 * @param location
 */
export const guessDeckNumber = (location?: string): number | undefined => {
  if (!location) {
    return undefined;
  }
  console.log('Matching Location', location);
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

export const publicLocationSuggestions = [
  'Atrium, Deck 1, Midship',
  'Gallery Bar, Deck 2, Forward',
  'Billboard Onboard, Deck 2, Forward',
  'Rolling Stone Lounge, Deck 2, Midship',
  'Pinnacle Bar, Deck 2, Midship',
  "Explorer's Lounge, Deck 2, Aft",
  'Lower Main Dining Room, Deck 2, Aft',
  'Ocean Bar, Deck 3, Midship',
  'Upper Main Dining Room, Deck 3, Aft',
  'Lido Bar, Deck 9, Midship',
  'Lido Pool Area, Deck 9, Midship',
  'Sea View Bar, Deck 9, Aft',
  'Lido Market, Deck 9, Aft',
  'Sea View Pool Area, Deck 9, Aft',
  "Crow's Nest (Ten Forward), Deck 10, Forward",
  'Shuffleboard Court, Deck 10, Midship',
  'High Score Arcade, Deck 10, Midship',
  'Hang 10, Deck 10, Midship',
  'Ready Room, Deck 10, Forward',
  'Sports Court, Deck 11, Forward',
];

export const getUserSuggestedLocations = (profilePublicData?: ProfilePublicData) => {
  if (profilePublicData?.roomNumber) {
    return [`Room ${profilePublicData.roomNumber}`]
      .concat(publicLocationSuggestions)
      .concat(['That place where I put that thing that time']);
  }
  return publicLocationSuggestions;
};
