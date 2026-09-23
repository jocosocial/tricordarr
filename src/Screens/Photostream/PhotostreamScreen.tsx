import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PhotostreamActionsMenu} from '#src/Components/Menus/Photostream/PhotostreamActionsMenu';
import {PhotostreamFilterMenu} from '#src/Components/Menus/Photostream/PhotostreamFilterMenu';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {usePhotostreamQuery} from '#src/Queries/Photostream/PhotostreamQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {PhotostreamScreenBase} from '#src/Screens/Photostream/PhotostreamScreenBase';

export type Props = StackScreenProps<MainStackParamList, MainStackComponents.photostreamScreen>;

export const PhotostreamScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.photostreamHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.photostream}>
          <PhotostreamScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const PhotostreamScreenInner = ({navigation, route}: Props) => {
  const [locationName, setLocationName] = useState<string | undefined>(undefined);
  const queryResult = usePhotostreamQuery({locationName});
  // Only read and forwarded here -- PhotostreamScreenBase owns the effect that acts on it,
  // the same as the event and user screens. This screen used to duplicate that effect against
  // a FlashList ref it passed down, which meant two scrollToOffset calls on the same list.
  const {scrollToTopIntent} = route.params || {};

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <PhotostreamFilterMenu locationName={locationName} onLocationChange={setLocationName} />
          <PhotostreamActionsMenu />
        </MaterialHeaderButtons>
      </View>
    );
  }, [locationName]);

  const onScrollThreshold = useCallback(() => {
    // Scroll threshold callback for FAB behavior (currently unused but kept for future use)
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <PhotostreamScreenBase
      queryResult={queryResult}
      showFAB={true}
      onScrollThreshold={onScrollThreshold}
      scrollToTopIntent={scrollToTopIntent}
    />
  );
};
