import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {DisabledFeatureScreen} from '#src/Screens/DisabledFeatureScreen';
import {ForumPostScreenBase} from '#src/Screens/Forum/Post/ForumPostScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.forumPostHashtagScreen>;

export const ForumPostHashtagScreen = (props: Props) => {
  return (
    <DisabledFeatureScreen
      feature={SwiftarrFeature.forums}
      urlPath={`/forumpost/search?hashtag=${props.route.params.hashtag}`}>
      <ForumPostHashtagScreenInner {...props} />
    </DisabledFeatureScreen>
  );
};

const ForumPostHashtagScreenInner = (props: Props) => {
  return (
    <ForumPostScreenBase
      refreshOnUserNotification={false}
      queryParams={{hashtag: props.route.params.hashtag}}
      title={props.route.params.hashtag}
    />
  );
};
