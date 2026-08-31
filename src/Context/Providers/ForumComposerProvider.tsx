import {FormikProps} from 'formik';
import React, {PropsWithChildren, useMemo} from 'react';

import {ForumComposerContext, ForumComposerContextType} from '#src/Context/Contexts/ForumComposerContext';
import {appendMention} from '#src/Libraries/StringUtils';
import {PostContentData} from '#src/Structs/ControllerStructs';

interface ForumComposerProviderProps {
  /** Formik ref for the thread's ContentPostForm. */
  formRef: React.RefObject<FormikProps<PostContentData> | null>;
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
export const ForumComposerProvider = ({formRef, enabled, children}: PropsWithChildren<ForumComposerProviderProps>) => {
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
        form.setFieldValue('text', appendMention(form.values.text, username));
      },
    };
  }, [enabled, formRef]);

  return <ForumComposerContext.Provider value={value}>{children}</ForumComposerContext.Provider>;
};
