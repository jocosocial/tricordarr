import {Field, useField, useFormikContext} from 'formik';
import {ContentPostMentionSuggestionsView} from '../../Views/ContentPostMentionSuggestionsView';
import {MentionInput} from 'react-native-controlled-mentions';
import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';

interface MentionTextFieldProps {
  name: string;
  style?: StyleProp<ViewStyle>;
}

export const MentionTextField = (props: MentionTextFieldProps) => {
  const {commonStyles} = useStyles();
  const {handleChange, handleBlur} = useFormikContext();
  const [field] = useField<string>(props.name);
  return (
    <Field name={props.name}>
      {() => (
        <MentionInput
          // editable=false makes the keyboard disappear which from a UX is significantly
          // worse than the race condition of rapidly editing text. Eww.
          // editable={!isSubmitting}
          underlineColorAndroid={'transparent'}
          style={props.style}
          multiline={true}
          onChangeText={handleChange(props.name)}
          onChange={handleChange(props.name)}
          onBlur={handleBlur(props.name)}
          value={field.value}
          partTypes={[
            {
              trigger: '@', // Should be a single character like '@' or '#'
              renderSuggestions: ContentPostMentionSuggestionsView,
              textStyle: commonStyles.bold, // The mention style in the input
            },
          ]}
        />
      )}
    </Field>
  );
};
