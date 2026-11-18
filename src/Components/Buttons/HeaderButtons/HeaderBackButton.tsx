import {Item} from 'react-navigation-header-buttons';

import {AppIcons} from '#src/Enums/Icons';
import {isIOS} from '#src/Libraries/Platform/Detection';

interface HeaderBackButtonProps {
  onPress: () => void;
  title?: string;
  /** Shows the button but makes it inert, for screens where going back is not possible. */
  disabled?: boolean;
}

/**
 * Back button for the navigation header, for screens that render their own instead of the default.
 */
export const HeaderBackButton = ({onPress, title = 'Back', disabled}: HeaderBackButtonProps) => {
  // On iOS, show title with icon (matching default React Navigation behavior)
  // On Android, show only icon (matching default React Navigation behavior)
  // Using empty string on Android to satisfy type requirement while hiding text
  // showTitle is a custom prop. See MaterialHeaderButton.tsx for more details.
  // prettier-ignore
  // @ts-ignore
  return <Item title={isIOS ? title : ''} iconName={AppIcons.back} onPress={onPress} disabled={disabled} showTitle={isIOS} testID={'headerBack-headerButton'} />;
};
