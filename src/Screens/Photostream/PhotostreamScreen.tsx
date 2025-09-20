import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {usePhotostreamQuery} from '#src/Queries/Photostream/PhotostreamQueries';
import {PhotostreamImageData} from '#src/Structs/ControllerStructs';
import {FlatList, RefreshControl, View} from 'react-native';
import {PhotostreamListItem} from '#src/Components/Lists/Items/PhotostreamListItem';
import {PhotostreamFAB} from '#src/Components/Buttons/FloatingActionButtons/PhotostreamFAB';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {PhotostreamActionsMenu} from '#src/Components/Menus/Photostream/PhotostreamActionsMenu';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {Text} from 'react-native-paper';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {AppFlatList} from '#src/Components/Lists/AppFlatList';
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';

export type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.photostreamScreen>;

export const PhotostreamScreen = ({navigation}: Props) => {
  const {data, refetch, isFetchingNextPage, hasNextPage, fetchNextPage} = usePhotostreamQuery();
  const [refreshing, setRefreshing] = useState(false);
  const [expandFab, setExpandFab] = useState(true);
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

  const streamList = data?.pages.flatMap(p => p.photos);

  if (!streamList || streamList.length === 0) {
    return (
      <AppView>
        <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
      <AppFlatList
        flatListRef={flatListRef}
        renderItem={renderItem}
        data={streamList}
        onScrollThreshold={onScrollThreshold}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        hasNextPage={hasNextPage}
        handleLoadNext={handleLoadNext}
        keyExtractor={keyExtractor}
        maintainViewPosition={false}
        renderListFooter={EndResultsFooter}
      />
      <PhotostreamFAB showLabel={expandFab} />
    </AppView>
  );
};
