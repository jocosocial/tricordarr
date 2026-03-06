import {GestureResponderEvent} from 'react-native';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {FabGroupActionType} from '#src/Types';

interface Props {
  icon: IconSource;
  label?: string;
  onPress: (e: GestureResponderEvent) => void;
  color?: string;
  backgroundColor?: string;
}

export const FabGroupAction = ({icon, label, onPress, backgroundColor, color}: Props): FabGroupActionType => {
  const {theme} = useAppTheme();
  const {asPrivilegedUser} = useElevation();

  const actionColor = asPrivilegedUser ? theme.colors.constantWhite : color ? color : theme.colors.inverseOnSurface;
  const actionBackgroundColor = asPrivilegedUser
    ? theme.colors.twitarrNegativeButton
    : backgroundColor
      ? backgroundColor
      : theme.colors.inverseSurface;

  return {
    icon: icon,
    label: label,
    color: actionColor,
    style: {
      backgroundColor: actionBackgroundColor,
    },
    onPress: onPress,
  };
};
