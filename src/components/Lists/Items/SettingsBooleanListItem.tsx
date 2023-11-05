import {StyleProp, Switch, View, ViewStyle} from 'react-native';
import {HelperText, Text, TouchableRipple} from 'react-native-paper';
import {AppIcon} from '../../Images/AppIcon';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';

interface SettingsBooleanListItemProps {
  onPress?: () => void;
  value?: boolean;
  label: string;
  helperText?: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}

export const SettingsBooleanListItem = ({
  onPress,
  icon,
  label,
  value,
  helperText,
  style,
}: SettingsBooleanListItemProps) => {
  const {commonStyles, styleDefaults} = useStyles();
  const theme = useAppTheme();

  const styles = {
    ripple: {
      ...commonStyles.marginVerticalSmall,
    },
    wrapper: [commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.justifySpaceBetween],
    helperText: {
      color: theme.colors.onBackground,
    },
  };

  return (
    <TouchableRipple style={[styles.ripple, style]} onPress={onPress}>
      <View>
        <View style={styles.wrapper}>
          <Text>
            {icon && (
              // This is a bit hacky. I am not proud. View did weird aligning nonsense.
              <>
                <AppIcon size={styleDefaults.fontSize} icon={icon} />
                &nbsp;
              </>
            )}
            {label}
          </Text>
          <Switch value={value} onValueChange={onPress} />
        </View>
        {helperText && (
          <HelperText style={styles.helperText} type={'info'}>
            {helperText}
          </HelperText>
        )}
      </View>
    </TouchableRipple>
  );
};
