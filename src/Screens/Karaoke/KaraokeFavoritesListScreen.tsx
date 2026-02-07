import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import React, {useMemo, useRef} from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {KaraokeSongList, type KaraokeSongListItem} from '#src/Components/Lists/Karaoke/KaraokeSongList';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useKaraokeSongsQuery} from '#src/Queries/Karaoke/KaraokeQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.karaokeFavoritesListScreen>;

export const KaraokeFavoritesListScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.karaokeHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.karaoke} urlPath={'/karaoke/favorites'}>
          <KaraokeFavoritesListScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const KaraokeFavoritesListScreenInner = (_props: Props) => {
  const listRef = useRef<FlashListRef<KaraokeSongListItem>>(null);
  const {data, refetch, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage} = useKaraokeSongsQuery({
    favorite: true,
  });

  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const {handleLoadNext} = usePagination({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const items = useMemo(() => data?.pages.flatMap(p => p.songs) ?? [], [data?.pages]);

  if (isLoading) return <LoadingView />;

  return (
    <AppView>
      <ListTitleView title={'Favorites'} />
      <KaraokeSongList
        ref={listRef}
        items={items}
        showFavoriteButton={true}
        swipeableEnabled={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        hasNextPage={hasNextPage}
        handleLoadNext={handleLoadNext}
      />
    </AppView>
  );
};
