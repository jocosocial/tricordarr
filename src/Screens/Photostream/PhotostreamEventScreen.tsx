import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PhotostreamActionsMenu} from '#src/Components/Menus/Photostream/PhotostreamActionsMenu';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useEventQuery} from '#src/Queries/Events/EventQueries';
import {usePhotostreamEventQuery} from '#src/Queries/Photostream/PhotostreamQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {PhotostreamScreenBase} from '#src/Screens/Photostream/PhotostreamScreenBase';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.photostreamEventScreen>;

export const PhotostreamEventScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.photostreamHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.photostream}>
          <PhotostreamEventScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const PhotostreamEventScreenInner = ({navigation, route}: Props) => {
  const {data: eventData} = useEventQuery({
    eventID: route.params.eventID,
  });
  const queryResult = usePhotostreamEventQuery(route.params.eventID);

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

  const titleView = eventData ? <ListTitleView title={eventData.title} /> : undefined;

  return <PhotostreamScreenBase queryResult={queryResult} titleView={titleView} />;
};
