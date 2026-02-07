import {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {KaraokeSongList} from '#src/Components/Lists/Karaoke/KaraokeSongList';
import {KaraokeSearchBar} from '#src/Components/Search/KaraokeSearchBar';
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

type Props = StackScreenProps<MainStackParamList, MainStackComponents.karaokeSearchScreen>;

export const KaraokeSearchScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.karaokeHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.karaoke} urlPath={'/karaoke/search'}>
          <KaraokeSearchScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const KaraokeSearchScreenInner = (_props: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  /** Only search when user submits (search icon or keyboard submit). */
  const [submittedQuery, setSubmittedQuery] = useState('');

  const trimmedSubmitted = submittedQuery.trim();
  const canSearch = trimmedSubmitted.length >= 3 || trimmedSubmitted.length === 1 || trimmedSubmitted === '#';

  const {data, refetch, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage} = useKaraokeSongsQuery({
    search: canSearch ? submittedQuery : undefined,
  });

  const onSearch = React.useCallback(() => {
    setSubmittedQuery(searchQuery.trim());
  }, [searchQuery]);

  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const {handleLoadNext} = usePagination({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const items = useMemo(() => data?.pages.flatMap(p => p.songs) ?? [], [data?.pages]);

  if (isLoading && canSearch) return <LoadingView />;

  return (
    <AppView>
      <KaraokeSearchBar
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onSearch={onSearch}
        onClear={() => {
          setSearchQuery('');
          setSubmittedQuery('');
        }}
      />
      <ListTitleView title={canSearch ? 'Results' : 'Search Song Library'} />
      <KaraokeSongList
        items={items}
        showFavoriteButton={true}
        swipeableEnabled={false}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        hasNextPage={hasNextPage}
        handleLoadNext={handleLoadNext}
      />
    </AppView>
  );
};
