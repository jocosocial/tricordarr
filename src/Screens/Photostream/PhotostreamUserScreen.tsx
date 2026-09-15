import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PhotostreamActionsMenu} from '#src/Components/Menus/Photostream/PhotostreamActionsMenu';
import {getUserBylineString} from '#src/Components/Text/Tags/UserBylineTag';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {usePhotostreamUserQuery} from '#src/Queries/Photostream/PhotostreamQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {PhotostreamScreenBase} from '#src/Screens/Photostream/PhotostreamScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.photostreamUserScreen>;

export const PhotostreamUserScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.photostreamHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.photostream}>
          <PhotostreamUserScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const PhotostreamUserScreenInner = ({navigation, route}: Props) => {
  const queryResult = usePhotostreamUserQuery(route.params.user.userID);
  const {scrollToTopIntent} = route.params;

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <PhotostreamActionsMenu />
        </MaterialHeaderButtons>
      </View>
    );
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const titleView = <ListTitleView title={getUserBylineString(route.params.user, false, true, 'Photos by')} />;

  return (
    <PhotostreamScreenBase queryResult={queryResult} titleView={titleView} scrollToTopIntent={scrollToTopIntent} />
  );
};
