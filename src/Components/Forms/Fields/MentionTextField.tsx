import {Field, useField, useFormikContext} from 'formik';
import React, {useCallback, useMemo, useRef} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {TextInput} from 'react-native';
import {PatternsConfig, TriggersConfig, useMentions} from 'react-native-controlled-mentions';

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
  const textInputRef = useRef<TextInput>(null);
  const pendingMentionInsertionRef = useRef<boolean>(false);

  const triggersConfig: TriggersConfig<'mention' | 'hashtag'> = useMemo(
    () => ({
      mention: {
        trigger: '@',
        textStyle: commonStyles.bold,
      },
      hashtag: {
        trigger: '#',
        allowedSpacesCount: 0,
        textStyle: commonStyles.bold,
      },
    }),
    [commonStyles.bold],
  );

  const patternsConfig: PatternsConfig = useMemo(
    () => ({
      url: {
        pattern:
          /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
        textStyle: commonStyles.linkText,
      },
    }),
    [commonStyles.linkText],
  );

  /**
   * Some AI code bloat but it works. Needed to add a space after a mention is inserted.
   */
  const handleChange = useCallback(
    (text: string) => {
      helpers.setValue(text);
      // If we're expecting a mention insertion and the text doesn't end with a space, add one
      if (pendingMentionInsertionRef.current && text && !text.endsWith(' ')) {
        pendingMentionInsertionRef.current = false;
        // Use requestAnimationFrame to ensure the text update is complete
        requestAnimationFrame(() => {
          const newText = text + ' ';
          helpers.setValue(newText);
          // Move cursor to end after adding space
          if (textInputRef.current) {
            textInputRef.current.setNativeProps({
              selection: {start: newText.length, end: newText.length},
            });
          }
        });
      }
    },
    [helpers],
  );

  const {textInputProps, triggers} = useMentions({
    value: field.value,
    onChange: handleChange,
    triggersConfig,
    patternsConfig,
  });

  // Wrap onSelect to add space after mention insertion
  const wrappedOnSelect = useMemo(() => {
    if (!triggers.mention?.onSelect) {
      return (_mention: {id: string; name: string}) => {
        // Fallback if onSelect is not available
      };
    }
    const originalOnSelect = triggers.mention.onSelect;
    return (mention: {id: string; name: string}) => {
      // Mark that we're inserting a mention
      pendingMentionInsertionRef.current = true;
      // Call the original onSelect to insert the mention
      originalOnSelect(mention);
    };
  }, [triggers.mention]);

  const mentionTriggerProps = useMemo(() => {
    if (!triggers.mention) {
      return undefined;
    }
    return {
      ...triggers.mention,
      onSelect: wrappedOnSelect,
    };
  }, [triggers.mention, wrappedOnSelect]);

  return (
    <Field name={props.name}>
      {() => (
        <>
          {mentionTriggerProps && <ContentPostMentionSuggestionsView {...mentionTriggerProps} />}
          <TextInput
            ref={textInputRef}
            // The textInputProps provides onChangeText and onSelectionChange.
            {...textInputProps}
            style={props.style}
            onBlur={handleBlur(props.name)}
            multiline={true}
            underlineColorAndroid={'transparent'}
          />
        </>
      )}
    </Field>
  );
};
