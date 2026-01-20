import {useFocusEffect} from '@react-navigation/native';
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

const PhotostreamScreenInner = ({navigation}: Props) => {
  const [locationName, setLocationName] = useState<string | undefined>(undefined);
  const queryResult = usePhotostreamQuery({locationName});
  const flashListRef = useRef<FlashListRef<PhotostreamImageData>>(null);
  const shouldScrollToTopRef = useRef<boolean>(false);
  const streamListLengthWhenNavigatedAwayRef = useRef<number | null>(null);

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

  // Track when user navigates to create screen and store current list length
  useEffect(() => {
    const streamList = queryResult.data?.pages.flatMap(p => p.photos);
    const unsubscribe = navigation.addListener('state', () => {
      const state = navigation.getState();
      const currentRoute = state.routes[state.index];
      // If current route is the create screen, store current list length
      if (currentRoute.name === MainStackComponents.photostreamImageCreateScreen) {
        streamListLengthWhenNavigatedAwayRef.current = streamList?.length ?? null;
        shouldScrollToTopRef.current = true;
      }
    });

    return unsubscribe;
  }, [navigation, queryResult.data?.pages]);

  // Watch for list length changes when returning from posting
  useEffect(() => {
    const streamList = queryResult.data?.pages.flatMap(p => p.photos);
    if (shouldScrollToTopRef.current && flashListRef.current) {
      const previousLength = streamListLengthWhenNavigatedAwayRef.current;
      const currentLength = streamList?.length ?? 0;

      // Only scroll if the list length increased (indicating a successful post)
      if (previousLength !== null && currentLength > previousLength) {
        // Use requestAnimationFrame to ensure the list has rendered
        requestAnimationFrame(() => {
          try {
            flashListRef.current?.scrollToIndex({index: 0, animated: true});
          } catch {
            // If scrollToIndex fails (e.g., list not fully rendered), use scrollToOffset as fallback
            flashListRef.current?.scrollToOffset({offset: 0, animated: true});
          }
        });

        // Reset flags after scrolling
        shouldScrollToTopRef.current = false;
        streamListLengthWhenNavigatedAwayRef.current = null;
      }
    }
  }, [queryResult.data?.pages]);

  // Reset flag if user navigates away without posting (length didn't change)
  useFocusEffect(
    useCallback(() => {
      // When screen loses focus, if flag is still set but we're not on create screen, reset it
      return () => {
        const state = navigation.getState();
        const currentRoute = state.routes[state.index];
        if (shouldScrollToTopRef.current && currentRoute.name !== MainStackComponents.photostreamImageCreateScreen) {
          // Give it a moment for the length check to happen, then reset if still set
          setTimeout(() => {
            if (shouldScrollToTopRef.current) {
              shouldScrollToTopRef.current = false;
              streamListLengthWhenNavigatedAwayRef.current = null;
            }
          }, 1000);
        }
      };
    }, [navigation]),
  );

  return (
    <PhotostreamScreenBase
      queryResult={queryResult}
      showFAB={true}
      onScrollThreshold={onScrollThreshold}
      flashListRef={flashListRef}
    />
  );
};
