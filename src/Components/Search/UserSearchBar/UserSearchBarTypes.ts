import {UserMatchSort} from '#src/Enums/UserMatchSort';
import {UserHeader} from '#src/Structs/ControllerStructs';

/**
 * Common props interface for all UserSearchBar components
 */
export interface UserSearchBarProps {
  excludeSelf?: boolean;
  excludeHeaders?: UserHeader[];
  onPress: (user: UserHeader) => void;
  clearOnPress?: boolean;
  dataHeaders?: UserHeader[];
  useProvidedData?: boolean;
  favorers?: boolean;
  /**
   * Ordering of the search results. Defaults to UserMatchSort.favorites so that the people you
   * actually talk to come first. There is no "unsorted" member yet; add one if a caller ever
   * needs the raw server ordering back.
   */
  sort?: UserMatchSort;
  label?: string;
  autoSearch?: boolean;
  testID: string;
}
