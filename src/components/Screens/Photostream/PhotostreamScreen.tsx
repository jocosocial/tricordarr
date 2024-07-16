import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {usePhotostreamQuery} from '../../Queries/Photostream/PhotostreamQueries.tsx';
import {PhotostreamImageData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {FlatList, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, View} from 'react-native';
import {PhotostreamListItem} from '../../Lists/Items/PhotostreamListItem.tsx';
import {PhotostreamFAB} from '../../Buttons/FloatingActionButtons/PhotostreamFAB.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {MainStackComponents} from '../../../libraries/Enums/Navigation.ts';

export type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.photostreamScreen>;

export const PhotostreamScreen = ({navigation}: Props) => {
  const {data, refetch, isFetchingNextPage, hasNextPage, fetchNextPage, isRefetching, isFetched, isLoading} =
    usePhotostreamQuery();
  const [refreshing, setRefreshing] = useState(false);
  const [expandFab, setExpandFab] = useState(false);

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
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(MainStackComponents.photostreamHelpScreen)}
          />
        </HeaderButtons>
      </View>
    );
  }, [navigation]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (event.nativeEvent.contentOffset.y <= 150) {
      setExpandFab(true);
    } else {
      setExpandFab(false);
    }
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadNext}
        keyExtractor={(item: PhotostreamImageData) => item.postID.toString()}
        data={streamList}
        renderItem={({item}) => <PhotostreamListItem item={item} />}
        onEndReachedThreshold={5}
        onScroll={handleScroll}
      />
      <PhotostreamFAB showLabel={expandFab} />
    </AppView>
  );
};
