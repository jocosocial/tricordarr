import {useAppTheme} from '../../../styles/Theme';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {GestureResponderEvent} from 'react-native';

interface Props {
  icon: IconSource;
  label?: string;
  onPress: (e: GestureResponderEvent) => void;
}

export const FabGroupAction = ({icon, label, onPress}: Props) => {
  const theme = useAppTheme();
  return {
    icon: icon,
    label: label,
    color: theme.colors.onPrimary,
    style: {
      backgroundColor: theme.colors.primary,
    },
    onPress: onPress,
  };
};
