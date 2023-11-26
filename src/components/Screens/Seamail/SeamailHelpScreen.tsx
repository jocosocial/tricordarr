import React from 'react';
import {Text} from 'react-native-paper';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const SeamailHelpScreen = () => {
  const {commonStyles} = useStyles();
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>Seamail: It's like email, but at sea. Use them to send private messages to other users.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.bold]}>
            Types of Seamail Conversations
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text style={[commonStyles.marginBottomSmall]}>
            Open: Allows you add or remove users later on. Added users will be able to read all past history.
          </Text>
          <Text style={[commonStyles.marginBottomSmall]}>
            Closed: Cannot add or remove users later on. To start chatting with new users you'll need to create a new
            conversation.
          </Text>
          <Text>The type cannot be changed once the conversation is created.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.bold]}>
            Seamail Content
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text style={[commonStyles.marginBottomSmall]}>
            You can send text, unicode emojis, and our custom emojis. You cannot send pictures. This is by design.
          </Text>
          <Text style={[commonStyles.marginBottomSmall]}>
            Messages can be reported to the moderation team by long-pressing on the message and selecting Report.
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
