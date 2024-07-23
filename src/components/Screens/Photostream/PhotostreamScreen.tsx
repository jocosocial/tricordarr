import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {usePhotostreamQuery} from '../../Queries/Photostream/PhotostreamQueries.tsx';
import {PhotostreamImageData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {FlatList, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, View} from 'react-native';
import {PhotostreamListItem} from '../../Lists/Items/PhotostreamListItem.tsx';
import {PhotostreamFAB} from '../../Buttons/FloatingActionButtons/PhotostreamFAB.tsx';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {MainStackComponents} from '../../../libraries/Enums/Navigation.ts';
import {PhotostreamActionsMenu} from '../../Menus/Photostream/PhotostreamActionsMenu.tsx';
import {FloatingScrollButton} from '../../Buttons/FloatingScrollButton.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';

export type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.photostreamScreen>;

export const PhotostreamScreen = ({navigation}: Props) => {
  const {data, refetch, isFetchingNextPage, hasNextPage, fetchNextPage} = usePhotostreamQuery();
  const [refreshing, setRefreshing] = useState(false);
  const [expandFab, setExpandFab] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const flatListRef = useRef<FlatList<PhotostreamImageData>>(null);

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
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <PhotostreamActionsMenu />
        </HeaderButtons>
      </View>
    );
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (event.nativeEvent.contentOffset.y <= 150) {
      setExpandFab(true);
    } else {
      setExpandFab(false);
    }
    // I picked 450 out of a hat. Roughly 8 messages @ 56 units per message.
    setShowButton(event.nativeEvent.contentOffset.y > 450);
  };

  const handleScrollButtonPress = () => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const streamList = data?.pages.flatMap(p => p.photos);

  return (
    <AppView>
      <FlatList
        ref={flatListRef}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadNext}
        keyExtractor={(item: PhotostreamImageData) => item.postID.toString()}
        data={streamList}
        renderItem={({item}) => <PhotostreamListItem item={item} />}
        onEndReachedThreshold={5}
        onScroll={handleScroll}
      />
      {showButton && (
        <FloatingScrollButton icon={AppIcons.scrollUp} onPress={handleScrollButtonPress} displayPosition={'bottom'} />
      )}
      <PhotostreamFAB showLabel={expandFab} />
    </AppView>
  );
};
