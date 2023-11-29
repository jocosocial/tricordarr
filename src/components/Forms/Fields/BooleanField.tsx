import React from 'react';
import {StyleProp, Switch, View, ViewStyle} from 'react-native';
import {HelperText, Text, TouchableRipple} from 'react-native-paper';
import {Field, useField, useFormikContext} from 'formik';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {AppIcon} from '../../Icons/AppIcon';

interface BooleanFieldProps {
  onPress?: () => void;
  value?: boolean;
  name: string;
  label: string;
  helperText?: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const BooleanField = ({
  name,
  label,
  helperText,
  icon,
  onPress,
  value,
  style,
  disabled = false,
}: BooleanFieldProps) => {
  const {commonStyles, styleDefaults} = useStyles();
  const theme = useAppTheme();
  const [field, meta, helpers] = useField<boolean>(name);
  const {setFieldValue} = useFormikContext();

  const onPressDefault = () => {
    setFieldValue(name, !field.value);
  };

  const styles = {
    ripple: [commonStyles.marginVerticalSmall],
    wrapper: [commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.justifySpaceBetween],
    helperText: {
      color: theme.colors.onBackground,
    },
  };

  // https://codereacter.medium.com/reducing-the-number-of-renders-when-using-formik-9790bf111ab9
  // FastField didn't update correctly
  return (
    <Field name={name}>
      {() => (
        <TouchableRipple style={[styles.ripple, style]} onPress={onPress || onPressDefault} disabled={disabled}>
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
              <Switch
                value={value === undefined ? field.value : value}
                onValueChange={onPress || onPressDefault}
                disabled={disabled}
              />
            </View>
            {helperText && (
              <HelperText style={styles.helperText} type={'info'}>
                {helperText}
              </HelperText>
            )}
          </View>
        </TouchableRipple>
      )}
    </Field>
  );
};
