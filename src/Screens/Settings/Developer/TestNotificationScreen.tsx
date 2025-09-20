import React from 'react';
import {PrimaryActionButton} from '#src/Buttons/PrimaryActionButton';
import {cancelTestNotification, displayTestNotification} from '../../../../Libraries/Notifications/TestNotification';
import {useAppTheme} from '../../../../Styles/Theme';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView';
import {AppView} from '#src/Views/AppView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {generateContentNotification} from '../../../../Libraries/Notifications/Content';
import {eventChannel} from '../../../../Libraries/Notifications/Channels';
import {NotificationTypeData} from '../../../../Libraries/Structs/SocketStructs';
import {PressAction} from '../../../../Libraries/Enums/Notifications';

export const TestNotificationScreen = () => {
  const theme = useAppTheme();
  const {commonStyles} = useStyles();

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonText="Display Notification"
            buttonColor={theme.colors.twitarrNeutralButton}
            onPress={() => displayTestNotification()}
            style={[commonStyles.marginTopSmall]}
          />
          <PrimaryActionButton
            buttonText="Cancel"
            buttonColor={theme.colors.twitarrNegativeButton}
            onPress={() => cancelTestNotification()}
            style={[commonStyles.marginTopSmall]}
          />
          <PrimaryActionButton
            buttonText={'Generate Event Notification'}
            onPress={() =>
              generateContentNotification(
                'ABC123',
                'Followed Event Starting',
                'Orientation is starting Soon™ in World Stage, Deck 2, Forward',
                eventChannel,
                NotificationTypeData.followedEventStarting,
                '/events/ABC123',
                // '/forumpost/mentions',
                PressAction.event,
              )
            }
            style={[commonStyles.marginTopSmall]}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
