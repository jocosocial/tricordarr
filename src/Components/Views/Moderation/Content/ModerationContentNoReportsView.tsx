import React from 'react';
import {Text} from 'react-native-paper';

import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';

/**
 * Empty-state copy when a piece of moderated content has no reports.
 */
export const ModerationContentNoReportsView = () => {
  return (
    <PaddedContentView padTop={true}>
      <Text>No reports on this content.</Text>
    </PaddedContentView>
  );
};
