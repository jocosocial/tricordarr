import React from 'react';
import {Switch, View} from 'react-native';
import {HelperText, Text, TouchableRipple} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {NavBarIcon} from '../../Icons/NavBarIcon';

interface BooleanInputProps {
  onPress: () => void;
  value: boolean;
  label: string;
  helperText?: string;
  icon?: string;
}

export const BooleanInput = ({onPress, value, label, helperText, icon}: BooleanInputProps) => {
  const {commonStyles, styleDefaults} = useStyles();
  const theme = useAppTheme();
  const styles = {
    ripple: [commonStyles.marginVerticalSmall],
    wrapper: [commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.justifySpaceBetween],
    helperText: {
      color: theme.colors.onBackground,
    },
  };
  return (
    <TouchableRipple style={styles.ripple} onPress={onPress}>
      <View>
        <View style={styles.wrapper}>
          <Text>
            {icon && (
              // This is a bit hacky. I am not proud. View did weird aligning nonsense.
              <>
                <NavBarIcon size={styleDefaults.fontSize} icon={icon} />
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
