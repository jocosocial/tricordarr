import React from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {HelpChapterTitleView} from '#src/Components/Views/Help/HelpChapterTitleView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {AppIcons} from '#src/Enums/Icons';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.userProfileHelpScreen>;

export const UserProfileHelpScreen = ({route}: Props) => {
  return (
    <AppView safeEdges={route.params?.oobe ? ['bottom'] : []}>
      <ScrollingContentView isStack={true}>
        <HelpChapterTitleView title={'General'} />
        <HelpTopicView>
          Share as much or as little information about yourself as you'd like with your fellow passengers. All fields
          are optional and free-form (except dinner team which while optional presents a choice).
        </HelpTopicView>
        <HelpTopicView title={'Viewing a Profile'}>
          When viewing a users profile, you can long-press any text to either select it or copy it immediately to your
          clipboard. Tapping on the Email field (if present) will open your devices default Mail application.
        </HelpTopicView>
        <HelpTopicView title={'Private Note'}>
          You can save a note about a user that is visible only to you. For example: "Met at the Lido Bar on Monday,
          interested in my D&D campaign".
        </HelpTopicView>
        <HelpChapterTitleView title={'Relations'} />
        <HelpTopicView title={'Block'} icon={AppIcons.block}>
          Blocking a user will hide all that user's content from you, and also hide all your content from them.
        </HelpTopicView>
        <HelpTopicView title={'Mute'} icon={AppIcons.mute}>
          Muting a user will hide all that user's content from you.
        </HelpTopicView>
        <HelpTopicView title={'Favorite'} icon={AppIcons.favorite}>
          Favoriting a user allows them to call you (between iOS devices only). Otherwise does nothing.
        </HelpTopicView>
      </ScrollingContentView>
    </AppView>
  );
};
