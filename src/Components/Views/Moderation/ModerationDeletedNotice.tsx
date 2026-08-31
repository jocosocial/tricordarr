import React from 'react';
import {Text} from 'react-native-paper';

import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';

interface ModerationDeletedNoticeProps {
  contentLabel: string;
  visible: boolean;
}

/**
 * Banner shown when the moderated content has already been deleted.
 */
export const ModerationDeletedNotice = ({contentLabel, visible}: ModerationDeletedNoticeProps) => {
  if (!visible) {
    return null;
  }
  return (
    <PaddedContentView padTop={true}>
      <Text variant={'titleMedium'}>This {contentLabel} has been deleted.</Text>
    </PaddedContentView>
  );
};
