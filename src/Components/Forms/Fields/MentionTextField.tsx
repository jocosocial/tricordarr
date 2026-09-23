import {useField} from 'formik';
import React, {createContext, useCallback, useContext, useMemo, useRef} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {TextInput} from 'react-native';
import {PatternsConfig, TriggersConfig, useMentions} from 'react-native-controlled-mentions';

import {ContentPostMentionSuggestionsView} from '#src/Components/Views/Content/ContentPostMentionSuggestionsView';
import {useStyles} from '#src/Context/Contexts/StyleContext';

type MentionTriggerProps = React.ComponentProps<typeof ContentPostMentionSuggestionsView>;

interface MentionTextFieldContextType {
  /** Props from useMentions that drive the TextInput (onChangeText, onSelectionChange, children). */
  textInputProps: ReturnType<typeof useMentions>['textInputProps'];
  /** Undefined while no @mention is being typed. */
  mentionTriggerProps?: MentionTriggerProps;
  setInputRefs: (node: TextInput | null) => void;
  onBlur: () => void;
}

const MentionTextFieldContext = createContext<MentionTextFieldContextType | undefined>(undefined);

/**
 * Reads the mention wiring published by MentionTextFieldProvider. Throws rather than degrading
 * silently, since a field rendered outside the provider would look fine but never suggest.
 */
const useMentionTextFieldContext = () => {
  const context = useContext(MentionTextFieldContext);
  if (!context) {
    throw new Error('MentionTextField components must be rendered inside a MentionTextFieldProvider.');
  }
  return context;
};

interface MentionTextFieldProviderProps {
  name: string;
  /**
   * Configures the '@' trigger. When false no suggestions are offered and no mention markup can
   * be produced, leaving anything the user types starting with '@' as plain text. Required
   * rather than defaulted so each composer states which it wants.
   */
  enableMentions: boolean;
  /**
   * Receives the underlying TextInput so callers can focus it or move the caret. Needed
   * when something outside the form writes into the field, since the user is otherwise
   * left with text they cannot type after.
   */
  inputRef?: React.MutableRefObject<TextInput | null>;
  children: React.ReactNode;
}

/**
 * Owns the @mention/#hashtag wiring for a Formik text field and publishes it to
 * MentionTextFieldSuggestions and MentionTextField below it.
 *
 * These are split rather than rendered as one unit because the suggestion list and the input
 * belong at different places in the layout: the list needs the composer's full width, while the
 * input sits in a row flanked by the insert and submit buttons. The hooks here need Formik
 * context, so this has to be a component inside <Formik>, not a hook the form itself calls.
 */
export const MentionTextFieldProvider = ({name, enableMentions, inputRef, children}: MentionTextFieldProviderProps) => {
  const {commonStyles} = useStyles();
  const [field, _, helpers] = useField<string>(name);
  const textInputRef = useRef<TextInput | null>(null);
  const pendingMentionInsertionRef = useRef<boolean>(false);

  /**
   * Fans the input out to the caller's ref as well as the local one. Stable so React
   * doesn't detach and reattach it on every render, which would leave the caller's ref
   * momentarily null.
   */
  const callerInputRef = inputRef;
  const setInputRefs = useCallback(
    (node: TextInput | null) => {
      textInputRef.current = node;
      if (callerInputRef) {
        callerInputRef.current = node;
      }
    },
    [callerInputRef],
  );

  const triggersConfig: TriggersConfig<'mention' | 'hashtag'> = useMemo(() => {
    const config: Partial<TriggersConfig<'mention' | 'hashtag'>> = {
      hashtag: {
        trigger: '#',
        allowedSpacesCount: 0,
        textStyle: commonStyles.bold,
      },
    };
    if (enableMentions) {
      config.mention = {
        trigger: '@',
        textStyle: commonStyles.bold,
      };
    }
    // The library types a trigger config as a complete Record, but only populates triggers.<name>
    // while that trigger is actually active, so consumers already treat the entries as optional
    // (see the triggers.mention checks below). Omitting one here is what turns the trigger off.
    return config as TriggersConfig<'mention' | 'hashtag'>;
  }, [commonStyles.bold, enableMentions]);

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

  const onBlur = useCallback(() => helpers.setTouched(true, true), [helpers]);

  const contextValue = useMemo(
    () => ({textInputProps, mentionTriggerProps, setInputRefs, onBlur}),
    [textInputProps, mentionTriggerProps, setInputRefs, onBlur],
  );

  return <MentionTextFieldContext.Provider value={contextValue}>{children}</MentionTextFieldContext.Provider>;
};

/**
 * The @mention suggestion list for the enclosing provider's field. Renders nothing unless a
 * mention is being typed. Place this where it can occupy the composer's full width.
 */
export const MentionTextFieldSuggestions = () => {
  const {mentionTriggerProps} = useMentionTextFieldContext();

  if (!mentionTriggerProps) {
    return null;
  }

  return <ContentPostMentionSuggestionsView {...mentionTriggerProps} />;
};

interface MentionTextFieldProps {
  testID: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The text input for the enclosing provider's field.
 */
export const MentionTextField = ({testID, style}: MentionTextFieldProps) => {
  const {textInputProps, setInputRefs, onBlur} = useMentionTextFieldContext();

  return (
    <TextInput
      testID={testID}
      ref={setInputRefs}
      // The textInputProps provides onChangeText and onSelectionChange.
      {...textInputProps}
      style={style}
      onBlur={onBlur}
      multiline={true}
      underlineColorAndroid={'transparent'}
    />
  );
};
