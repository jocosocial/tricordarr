import {HttpStatusCode} from 'axios';
import React from 'react';
import {RefreshControlProps} from 'react-native';
import {Text} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';

type HuntLoadResource = 'hunts' | 'hunt' | 'puzzle';

interface HuntLoadErrorViewProps {
  status?: number;
  resource: HuntLoadResource;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

/**
 * Copy for a 404 from the hunts API. Locked puzzles 404 the same as missing ones.
 */
const notFoundMessage = (resource: HuntLoadResource): string => {
  if (resource === 'puzzle') {
    return "This puzzle hasn't unlocked yet, or it could not be found.";
  }
  if (resource === 'hunt') {
    return 'This hunt could not be found.';
  }
  return 'Puzzle hunts could not be found. Pull to retry.';
};

/**
 * Copy for a non-404 hunt load failure.
 */
const genericMessage = (resource: HuntLoadResource): string => {
  if (resource === 'puzzle') {
    return 'Unable to load this puzzle. Pull to retry.';
  }
  if (resource === 'hunt') {
    return 'Unable to load this hunt. Pull to retry.';
  }
  return 'Unable to load puzzle hunts. Pull to retry.';
};

/**
 * Retryable error for hunt queries. Swiftarr 404s locked or missing puzzles.
 */
export const HuntLoadErrorView = ({status, resource, refreshControl}: HuntLoadErrorViewProps) => {
  const {commonStyles} = useStyles();
  const message = status === HttpStatusCode.NotFound ? notFoundMessage(resource) : genericMessage(resource);

  return (
    <AppView>
      <ScrollingContentView isStack={true} refreshControl={refreshControl}>
        <PaddedContentView padTop={true}>
          <Text style={commonStyles.onBackground}>{message}</Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
