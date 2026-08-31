import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';

import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {ForumPostScreenBase} from '#src/Screens/Forum/Post/ForumPostScreenBase';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderatorForumMentionsScreen>;

const ModeratorForumMentionsScreenInner = () => {
  return <ForumPostScreenBase queryParams={{mentionname: 'moderator'}} title={'@moderator Mentions'} />;
};

export const ModeratorForumMentionsScreen = (_props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModeratorForumMentionsScreenInner />
    </ModeratorFeatureScreen>
  );
};
