import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ForumPostScreenBase} from '#src/Screens/Forum/Post/ForumPostScreenBase';

type Props = StackScreenProps<ForumStackParamList, ForumStackComponents.forumPostSelfScreen>;

export const ForumPostSelfScreen = ({route}: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.forumThreadHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.forums} urlPath={'/forumpost/owned'}>
        <ForumPostScreenBase
          refreshOnUserNotification={true}
          queryParams={{byself: true}}
          scrollToTopIntent={route.params?.scrollToTopIntent}
        />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};
