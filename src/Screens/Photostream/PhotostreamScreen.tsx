import {StackScreenProps} from '@react-navigation/stack';
import {FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PhotostreamActionsMenu} from '#src/Components/Menus/Photostream/PhotostreamActionsMenu';
import {PhotostreamFilterMenu} from '#src/Components/Menus/Photostream/PhotostreamFilterMenu';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {usePhotostreamQuery} from '#src/Queries/Photostream/PhotostreamQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {PhotostreamScreenBase} from '#src/Screens/Photostream/PhotostreamScreenBase';
import {PhotostreamImageData} from '#src/Structs/ControllerStructs';

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
  const flashListRef = useRef<FlashListRef<PhotostreamImageData>>(null);
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

  // Scroll to top when intent is dispatched (e.g., after uploading a photo)
  useEffect(() => {
    if (scrollToTopIntent) {
      flashListRef.current?.scrollToOffset({offset: 0, animated: false});
    }
  }, [scrollToTopIntent]);

  return (
    <PhotostreamScreenBase
      queryResult={queryResult}
      showFAB={true}
      onScrollThreshold={onScrollThreshold}
      flashListRef={flashListRef}
      scrollToTopIntent={scrollToTopIntent}
    />
  );
};
