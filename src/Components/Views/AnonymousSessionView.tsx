import React from 'react';
import {Text} from 'react-native-paper';

import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface AnonymousSessionViewProps {
  serverUrl: string;
}

/**
 * Confirms that the setup flow is carrying on without an account, and on which server.
 */
export const AnonymousSessionView = ({serverUrl}: AnonymousSessionViewProps) => {
  const {commonStyles} = useStyles();

  return (
    <>
      <PaddedContentView>
        <Text>
          Using <Text style={commonStyles.bold}>{serverUrl}</Text> without an account.
        </Text>
      </PaddedContentView>
      <PaddedContentView>
        <Text>Some areas of Twitarr, like the schedule and daily themes, work without one.</Text>
      </PaddedContentView>
    </>
  );
};
