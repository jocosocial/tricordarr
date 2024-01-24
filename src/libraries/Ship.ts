import {ImageSourcePropType} from 'react-native';
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

export interface DeckData {
  number: number;
  label: string;
  roomStart?: number;
  roomEnd?: number;
  imageSource: ImageSourcePropType;
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
  const match = location.match(/Deck (\d+)/);
  if (match) {
    // Extracted deck number from the regex match
    return parseInt(match[1], 10);
  }
  // No deck number found.
  return undefined;
};
