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
  label?: string;
  autoSearch?: boolean;
}
