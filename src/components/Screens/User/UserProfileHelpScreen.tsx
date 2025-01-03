import React from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {Text} from 'react-native-paper';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.userProfileHelpScreen>;

export const UserProfileHelpScreen = ({route}: Props) => {
  const {commonStyles} = useStyles();
  return (
    <AppView safeEdges={route.params?.oobe ? ['bottom'] : []}>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>
            Share as much or as little information about yourself as you'd like with your fellow passengers. All fields
            are optional and free-form (except dinner team which while optional presents a choice).
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.bold]}>
            Viewing a Profile
          </Text>
          <Text>
            When viewing a users profile, you can long-press any text to either select it or copy it immediately to your
            clipboard. Tapping on the Email field (if present) will open your devices default Mail application.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.bold]}>
            Private Note
          </Text>
          <Text>
            You can save a note about a user that is visible only to you. For example: "Met at the Lido Bar on Monday,
            interested in my D&D campaign".
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.bold]}>
            Block
          </Text>
          <Text>
            Blocking a user will hide all that user's content from you, and also hide all your content from them.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.bold]}>
            Mute
          </Text>
          <Text>Muting a user will hide all that user's content from you.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.bold]}>
            Favorite
          </Text>
          <Text>
            Favoriting a user allows them to call you (between iOS devices only) and allows them to invite you to
            Personal Events.
          </Text>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
