import React from 'react';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {cancelTestNotification, displayTestNotification} from '../../../../libraries/Notifications/TestNotification';
import {useAppTheme} from '../../../../styles/Theme';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {AppView} from '../../../Views/AppView';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import {generateContentNotification} from '../../../../libraries/Notifications/Content';
import {eventChannel} from '../../../../libraries/Notifications/Channels';
import {NotificationType} from '@notifee/react-native/dist/utils';
import {NotificationTypeData} from '../../../../libraries/Structs/SocketStructs';
import {PressAction} from '../../../../libraries/Enums/Notifications';

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
