import {AppView} from '#src/Components/Views/AppView';
import {BoardgameFlatList} from '#src/Components/Lists/BoardgameFlatList';
import {useBoardgamesQuery} from '#src/Queries/Boardgames/BoardgameQueries';
import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import React, {useCallback, useEffect, useState} from 'react';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {RefreshControl, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {AppIcons} from '#src/Enums/Icons';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {BoardgameGuideFAB} from '#src/Components/Buttons/FloatingActionButtons/BoardgameGuideFAB';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.boardgameListScreen>;

export const BoardgameListScreen = ({navigation}: Props) => {
  const [favorites, setFavorites] = useState(false);
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    refetch,
    isFetching,
  } = useBoardgamesQuery({favorite: favorites});
  const {isLoggedIn} = useAuth();

  const handleLoadNext = async () => {
    if (!isFetchingNextPage && hasNextPage) {
      await fetchNextPage();
    }
  };

  const handleLoadPrevious = async () => {
    if (!isFetchingPreviousPage && hasPreviousPage) {
      await fetchPreviousPage();
    }
  };

  const getNavButtons = useCallback(
    () => (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Search'}
            iconName={AppIcons.search}
            onPress={() => navigation.push(MainStackComponents.boardgameSearchScreen)}
          />
          <MenuAnchor
            title={'Favorites'}
            iconName={AppIcons.favorite}
            onPress={() => setFavorites(!favorites)}
            active={favorites}
          />
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(MainStackComponents.boardgameHelpScreen)}
          />
        </HeaderButtons>
      </View>
    ),
    [favorites, navigation],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  const items = data?.pages.flatMap(p => p.gameArray) || [];

  return (
    <AppView>
      <ListTitleView title={favorites ? 'Your Favorites' : 'All Games'} />
      <BoardgameFlatList
        items={items}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      />
      <BoardgameGuideFAB showLabel={true} />
    </AppView>
  );
};
