import {Menu} from 'react-native-paper';
import React from 'react';
import {TextField, TextFieldProps} from './TextField';
import {useFormikContext} from 'formik';

interface SuggestedTextFieldProps extends TextFieldProps {
  suggestions?: string[];
  value?: string;
}

export const SuggestedTextField = ({
  name,
  mode = 'outlined',
  multiline,
  numberOfLines,
  secureTextEntry,
  label,
  left,
  right,
  viewStyle,
  inputMode,
  autoCapitalize,
  maxLength,
  suggestions = [],
  value,
}: SuggestedTextFieldProps) => {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const {setFieldValue} = useFormikContext();

  const handleSelect = (newValue: string) => {
    setFieldValue(name, newValue);
    closeMenu();
  };

  const handleOpen = () => {
    if (value) {
      return;
    }
    openMenu();
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <TextField
          name={name}
          mode={mode}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          label={label}
          left={left}
          right={right}
          viewStyle={viewStyle}
          inputMode={inputMode}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onFocus={handleOpen}
        />
      }>
      {suggestions.map((suggestion, index) => {
        return <Menu.Item key={index} title={suggestion} onPress={() => handleSelect(suggestion)} />;
      })}
    </Menu>
  );
};
