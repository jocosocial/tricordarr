import Slider from '@react-native-community/slider';
import {useFormikContext} from 'formik';
import pluralize from 'pluralize';
import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {HelperText, Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Styles/Theme';

interface SliderFieldProps {
  name: string;
  label: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  disabled?: boolean;
  step?: number;
  helperText?: string;
  unit?: string;
  style?: StyleProp<ViewStyle>;
  onValueChange?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
}

export const SliderField = (props: SliderFieldProps) => {
  const {setFieldValue} = useFormikContext();
  const {commonStyles} = useStyles();
  const theme = useAppTheme();

  const onValueChange = (value: number) => {
    setFieldValue(props.name, value);
    if (props.onValueChange) {
      props.onValueChange(value);
    }
  };

  return (
    <View style={[commonStyles.marginBottomSmall, props.style]}>
      <Text style={commonStyles.marginBottomSmall}>
        {props.label}: {props.value} {props.unit && pluralize(props.unit, props.value)}
      </Text>
      <Slider
        minimumValue={props.minimumValue}
        maximumValue={props.maximumValue}
        value={props.value}
        disabled={props.disabled}
        onValueChange={onValueChange}
        step={props.step}
        thumbTintColor={theme.colors.onBackground}
        onSlidingComplete={props.onSlidingComplete}
      />
      {props.helperText && (
        <HelperText style={commonStyles.onBackground} type={'info'}>
          {props.helperText}
        </HelperText>
      )}
    </View>
  );
};
