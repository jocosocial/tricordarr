import React from 'react';
import {Text} from 'react-native-paper';

import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const DisabledView = () => {
  const {serverUrl} = useSwiftarrQueryClient();
  const commonNavigation = useCommonStack();

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView>
          <Text>The server admins have temporarily disabled this section of Twitarr. It should be back up Soon™!</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text
            onPress={() =>
              commonNavigation.push(CommonStackComponents.siteUIScreen, {timestamp: new Date().toISOString()})
            }>
            You could also check {serverUrl} to see if there is more information available.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            If the feature works in the website but not in the app, it's likely that a critical bug in the app was
            discovered. The server admins may have disabled the feature for the app as a precaution.
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
