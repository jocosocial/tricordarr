import React from 'react';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {cancelTestNotification, displayTestNotification} from '../../../libraries/Notifications/TestNotification';
import {useAppTheme} from '../../../styles/Theme';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {AppView} from '../../Views/AppView';

export const TestNotificationScreen = () => {
  const theme = useAppTheme();

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonText="Display Notification"
            buttonColor={theme.colors.twitarrNeutralButton}
            onPress={() => displayTestNotification()}
          />
          <PrimaryActionButton
            buttonText="Cancel"
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => cancelTestNotification()}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
