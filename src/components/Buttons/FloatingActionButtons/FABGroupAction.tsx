import {useAppTheme} from '../../../styles/Theme';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {GestureResponderEvent} from 'react-native';
import {AndroidColor} from '@notifee/react-native';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';

interface Props {
  icon: IconSource;
  label?: string;
  onPress: (e: GestureResponderEvent) => void;
}

export const FabGroupAction = ({icon, label, onPress}: Props) => {
  const theme = useAppTheme();
  const {asPrivilegedUser} = usePrivilege();

  const color = asPrivilegedUser ? AndroidColor.WHITE : theme.colors.onPrimary;
  const backgroundColor = asPrivilegedUser ? theme.colors.twitarrNegativeButton : theme.colors.primary;

  return {
    icon: icon,
    label: label,
    color: color,
    style: {
      backgroundColor: backgroundColor,
    },
    onPress: onPress,
  };
};
