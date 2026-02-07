import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {BaseFAB} from '#src/Components/Buttons/FloatingActionButtons/BaseFAB';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {KaraokeSongList} from '#src/Components/Lists/Karaoke/KaraokeSongList';
import {AppMenu} from '#src/Components/Menus/AppMenu';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {KaraokeSearchBar} from '#src/Components/Search/KaraokeSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useRoles} from '#src/Context/Contexts/RoleContext';
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
  const {visible, openMenu, closeMenu} = useMenu();
  const {hasKaraokeManager} = useRoles();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistoryVisible, setSearchHistoryVisible] = useState(false);

  const {data, refetch, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage} = useKaraokeLatestQuery({
    search: searchHistoryVisible ? searchQuery : undefined,
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
    }
  }, [searchHistoryVisible]);

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
              title={'Help'}
              leadingIcon={AppIcons.help}
              onPress={() => {
                closeMenu();
                navigation.push(CommonStackComponents.karaokeHelpScreen);
              }}
            />
            {hasKaraokeManager && (
              <Menu.Item
                title={searchHistoryVisible ? 'Hide Search History' : 'Search History'}
                leadingIcon={AppIcons.search}
                onPress={() => {
                  toggleSearchHistory();
                }}
              />
            )}
          </AppMenu>
        </MaterialHeaderButtons>
      </View>
    ),
    [navigation, visible, closeMenu, menuAnchor, hasKaraokeManager, searchHistoryVisible, toggleSearchHistory],
  );

  useEffect(() => {
    navigation.setOptions({headerRight: getNavButtons});
  }, [getNavButtons, navigation]);

  if (isLoading) return <LoadingView />;

  const items = data?.pages.flatMap(p => p.songs) ?? [];

  return (
    <AppView>
      {hasKaraokeManager && searchHistoryVisible && (
        <KaraokeSearchBar
          searchQuery={searchQuery}
          onChangeSearch={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
      )}
      <ListTitleView title={'Recent Performances'} />
      <KaraokeSongList
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
