import {FormikProps} from 'formik';
import React, {PropsWithChildren, useMemo} from 'react';
import {TextInput} from 'react-native';

import {ForumComposerContext, ForumComposerContextType} from '#src/Context/Contexts/ForumComposerContext';
import {appendMention} from '#src/Libraries/StringUtils';
import {PostContentData} from '#src/Structs/ControllerStructs';

interface ForumComposerProviderProps {
  /** Formik ref for the thread's ContentPostForm. */
  formRef: React.RefObject<FormikProps<PostContentData> | null>;
  /** Text input for that same form, so a mention can leave the user ready to type. */
  inputRef: React.MutableRefObject<TextInput | null>;
  /** False when the thread has no composer, which makes the context undefined. */
  enabled: boolean;
}

/**
 * Exposes the forum thread composer to the post list below it, so a post's actions menu
 * can write into the composer without the screen having to drill a callback through the
 * memoized list.
 *
 * Formik refreshes `innerRef` on every render, so `formRef.current.values` is the live
 * composer content rather than a snapshot from when this provider mounted.
 */
export const ForumComposerProvider = ({
  formRef,
  inputRef,
  enabled,
  children,
}: PropsWithChildren<ForumComposerProviderProps>) => {
  const value = useMemo<ForumComposerContextType | undefined>(() => {
    if (!enabled) {
      return undefined;
    }
    return {
      mentionUser: (username: string) => {
        const form = formRef.current;
        if (!form) {
          return;
        }
        const text = appendMention(form.values.text, username);
        // Not awaited on purpose: this resolves with validation errors we don't act on,
        // and the focus below is sequenced on the render rather than on that promise.
        // Matches ElevationPrivilegeSync in ContentPostForm. (`no-void` rules out marking
        // it with the void operator.)
        form.setFieldValue('text', text);
        // Opening the actions menu leaves the composer unusable, so without this the user
        // is looking at a mention they cannot type after. The two platforms get there
        // differently: iOS fully blurs the field, while Android keeps focus and the caret
        // but closes the soft keyboard. `focus()` alone fixes iOS but is a no-op on
        // Android, where the field never lost focus — hence the explicit blur first, which
        // forces the keyboard back up on both.
        //
        // Deferred a frame so this lands after the new value has been applied, and the
        // caret is placed explicitly rather than wherever the field was last left.
        requestAnimationFrame(() => {
          inputRef.current?.blur();
          inputRef.current?.focus();
          // setSelection rather than setNativeProps: this app runs the new architecture,
          // where setNativeProps goes through legacy viewConfig attribute filtering.
          inputRef.current?.setSelection(text.length, text.length);
        });
      },
    };
  }, [enabled, formRef, inputRef]);

  return <ForumComposerContext.Provider value={value}>{children}</ForumComposerContext.Provider>;
};
