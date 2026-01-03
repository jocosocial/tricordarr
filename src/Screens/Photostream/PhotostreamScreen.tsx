import {useFocusEffect} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {PhotostreamFAB} from '#src/Components/Buttons/FloatingActionButtons/PhotostreamFAB';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {PhotostreamListItem} from '#src/Components/Lists/Items/PhotostreamListItem';
import {PhotostreamActionsMenu} from '#src/Components/Menus/Photostream/PhotostreamActionsMenu';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {usePhotostreamQuery} from '#src/Queries/Photostream/PhotostreamQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {PhotostreamImageData} from '#src/Structs/ControllerStructs';

export type Props = StackScreenProps<MainStackParamList, MainStackComponents.photostreamScreen>;

export const PhotostreamScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.photostreamHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.photostream}>
        <PhotostreamScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const PhotostreamScreenInner = ({navigation}: Props) => {
  const {data, refetch, isFetchingNextPage, hasNextPage, fetchNextPage} = usePhotostreamQuery();
  const [refreshing, setRefreshing] = useState(false);
  const [expandFab, setExpandFab] = useState(true);
  const flashListRef = useRef<FlashListRef<PhotostreamImageData>>(null);
  const shouldScrollToTopRef = useRef<boolean>(false);
  const streamListLengthWhenNavigatedAwayRef = useRef<number | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <PhotostreamActionsMenu />
        </MaterialHeaderButtons>
      </View>
    );
  }, []);

  const onScrollThreshold = useCallback((condition: boolean) => {
    setExpandFab(!condition);
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const renderItem = useCallback(({item}: {item: PhotostreamImageData}) => <PhotostreamListItem item={item} />, []);
  const keyExtractor = useCallback((item: PhotostreamImageData) => item.postID.toString(), []);

  const streamList = useMemo(() => data?.pages.flatMap(p => p.photos), [data?.pages]);

  // Track when user navigates to create screen and store current list length
  useEffect(() => {
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
  }, [navigation, streamList?.length]);

  // Watch for list length changes when returning from posting
  useEffect(() => {
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
  }, [streamList?.length]);

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

  if (!streamList || streamList.length === 0) {
    return (
      <AppView>
        <ScrollingContentView refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <PaddedContentView>
            <Text>There are no photos in the Photo Stream. Press the button below to add one!</Text>
          </PaddedContentView>
        </ScrollingContentView>
        <PhotostreamFAB />
      </AppView>
    );
  }

  return (
    <AppView>
      <AppFlashList
        ref={flashListRef}
        renderItem={renderItem}
        data={streamList}
        onScrollThreshold={onScrollThreshold}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        handleLoadNext={handleLoadNext}
        keyExtractor={keyExtractor}
        renderListFooter={EndResultsFooter}
      />
      <PhotostreamFAB showLabel={expandFab} />
    </AppView>
  );
};
