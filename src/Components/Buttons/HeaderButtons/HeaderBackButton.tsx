import {Platform} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {AppIcons} from '#src/Enums/Icons';

interface HeaderBackButtonProps {
  onPress: () => void;
  title?: string;
}

export const HeaderBackButton = ({onPress, title = 'Back'}: HeaderBackButtonProps) => {
  // On iOS, show title with icon (matching default React Navigation behavior)
  // On Android, show only icon (matching default React Navigation behavior)
  // Using empty string on Android to satisfy type requirement while hiding text
  return <Item title={Platform.OS === 'ios' ? title : ''} iconName={AppIcons.back} onPress={onPress} />;
};
