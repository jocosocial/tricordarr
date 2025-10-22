import {Field, useField, useFormikContext} from 'formik';
import React, { useMemo } from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import { TextInput } from 'react-native';
import {
  PatternsConfig,
  TriggersConfig,
  useMentions,
} from 'react-native-controlled-mentions';

import {ContentPostMentionSuggestionsView} from '#src/Components/Views/Content/ContentPostMentionSuggestionsView';
import {useStyles} from '#src/Context/Contexts/StyleContext';


interface MentionTextFieldProps {
  name: string;
  style?: StyleProp<ViewStyle>;
}

export const MentionTextField = (props: MentionTextFieldProps) => {
  const {commonStyles} = useStyles();
  const {handleBlur} = useFormikContext();
  const [field, _, helpers] = useField<string>(props.name);

  const triggersConfig: TriggersConfig<'mention' | 'hashtag'> = useMemo(() => ({
    mention: {
      trigger: '@',
      textStyle: commonStyles.bold,
    },
    hashtag: {
      trigger: '#',
      allowedSpacesCount: 0,
      textStyle: commonStyles.bold,
    },
  }), [commonStyles.bold]);

  const patternsConfig: PatternsConfig = useMemo(() => ({
    url: {
      pattern:
        /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
      textStyle: { color: 'blue' },
    },
  }), []);

  const { textInputProps, triggers } = useMentions({
    value: field.value,
    onChange: helpers.setValue,
    triggersConfig,
    patternsConfig,
  });

  return (
    <Field name={props.name}>
      {() => (
        <>
        <ContentPostMentionSuggestionsView {...triggers.mention} />
        <TextInput
          // The textInputProps provides onChangeText and onSelectionChange.
          {...textInputProps}
          style={props.style}
          onBlur={handleBlur(props.name)}
          multiline={true}
          underlineColorAndroid={'transparent'}
          // editable=false makes the keyboard disappear which from a UX is significantly
          // worse than the race condition of rapidly editing text. Eww.
          // editable={!isSubmitting}
        />
        </>
      )}
    </Field>
  );
};
