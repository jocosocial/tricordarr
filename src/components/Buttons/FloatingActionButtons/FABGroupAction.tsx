import {useAppTheme} from '../../../styles/Theme';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {GestureResponderEvent} from 'react-native';
import {AndroidColor} from '@notifee/react-native';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';

interface Props {
  icon: IconSource;
  label?: string;
  onPress: (e: GestureResponderEvent) => void;
  color?: string;
  backgroundColor?: string;
}

export const FabGroupAction = ({icon, label, onPress, backgroundColor, color}: Props) => {
  const theme = useAppTheme();
  const {asPrivilegedUser} = usePrivilege();

  const actionColor = asPrivilegedUser ? AndroidColor.WHITE : color ? color : theme.colors.inverseOnSurface;
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
