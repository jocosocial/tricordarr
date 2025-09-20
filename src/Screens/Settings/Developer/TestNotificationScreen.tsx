import React from 'react';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {cancelTestNotification, displayTestNotification} from '#src/Libraries/Notifications/TestNotification';
import {useAppTheme} from '#src/Styles/Theme';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {AppView} from '#src/Components/Views/AppView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {generateContentNotification} from '#src/Libraries/Notifications/Content';
import {eventChannel} from '#src/Libraries/Notifications/Channels';
import {NotificationTypeData} from '#src/Structs/SocketStructs';
import {PressAction} from '#src/Enums/Notifications';

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
