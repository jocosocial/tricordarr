import {StackScreenProps} from '@react-navigation/stack';
import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {KaraokeSongList, type KaraokeSongListItem} from '#src/Components/Lists/Karaoke/KaraokeSongList';
import {AppMenu} from '#src/Components/Menus/AppMenu';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {KaraokeSearchBar} from '#src/Components/Search/KaraokeSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useKaraokeLatestQuery} from '#src/Queries/Karaoke/KaraokeQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.karaokePerformanceListScreen>;

export const KaraokePerformanceListScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.karaokeHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.karaoke} urlPath={'/karaoke'}>
          <KaraokePerformanceListScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const KaraokePerformanceListScreenInner = ({navigation}: Props) => {
  const listRef = useRef<FlashListRef<KaraokeSongListItem>>(null);
  const {visible, openMenu, closeMenu} = useMenu();
  const [searchQuery, setSearchQuery] = useState('');
  /** Only search when user submits (search icon or keyboard submit). */
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [searchHistoryVisible, setSearchHistoryVisible] = useState(false);

  const trimmedSubmitted = submittedQuery.trim();
  const canSearch = trimmedSubmitted.length >= 3 || trimmedSubmitted.length === 1 || trimmedSubmitted === '#';

  const {data, refetch, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage} = useKaraokeLatestQuery({
    search: searchHistoryVisible && canSearch ? submittedQuery : undefined,
  });

  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const {handleLoadNext} = usePagination({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const toggleSearchHistory = useCallback(() => {
    setSearchHistoryVisible(v => !v);
    if (searchHistoryVisible) {
      setSearchQuery('');
      setSubmittedQuery('');
    }
  }, [searchHistoryVisible]);

  const onSearch = useCallback(() => {
    setSubmittedQuery(searchQuery.trim());
  }, [searchQuery]);

  const menuAnchor = useMemo(
    () => <MenuAnchor title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />,
    [openMenu],
  );

  const getNavButtons = useCallback(
    () => (
      <View>
        <MaterialHeaderButtons left>
          <Item
            title={'Favorites'}
            iconName={AppIcons.favorite}
            onPress={() => navigation.push(MainStackComponents.karaokeFavoritesListScreen)}
          />
          <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
            <Menu.Item
              title={searchHistoryVisible ? 'Hide Search History' : 'Search History'}
              leadingIcon={AppIcons.search}
              onPress={() => {
                toggleSearchHistory();
                closeMenu();
              }}
            />
            <Menu.Item
              title={'Help'}
              leadingIcon={AppIcons.help}
              onPress={() => {
                closeMenu();
                navigation.push(CommonStackComponents.karaokeHelpScreen);
              }}
            />
          </AppMenu>
        </MaterialHeaderButtons>
      </View>
    ),
    [navigation, visible, closeMenu, menuAnchor, searchHistoryVisible, toggleSearchHistory],
  );

  useEffect(() => {
    navigation.setOptions({headerRight: getNavButtons});
  }, [getNavButtons, navigation]);

  if (isLoading) return <LoadingView />;

  const items = data?.pages.flatMap(p => p.songs) ?? [];

  return (
    <AppView>
      <ListTitleView title={'Recent Performances'} />
      {searchHistoryVisible && (
        <KaraokeSearchBar
          searchQuery={searchQuery}
          onChangeSearch={setSearchQuery}
          onSearch={onSearch}
          onClear={() => {
            setSearchQuery('');
            setSubmittedQuery('');
          }}
          placeholder={'Search History'}
        />
      )}
      <KaraokeSongList
        ref={listRef}
        items={items}
        showFavoriteButton={true}
        swipeableEnabled={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        hasNextPage={hasNextPage}
        handleLoadNext={handleLoadNext}
      />
      <BaseFAB
        icon={AppIcons.search}
        label={'Search Library'}
        onPress={() => navigation.push(MainStackComponents.karaokeSearchScreen)}
      />
    </AppView>
  );
};
