import {AppView} from '../../Views/AppView.tsx';
import {BoardgameFlatList} from '../../Lists/BoardgameFlatList.tsx';
import {useBoardgamesQuery} from '../../Queries/Boardgames/BoardgameQueries.ts';
import {NotLoggedInView} from '../../Views/Static/NotLoggedInView.tsx';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import React, {useCallback, useEffect, useState} from 'react';
import {useAuth} from '../../Context/Contexts/AuthContext.ts';
import {RefreshControl, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {MenuAnchor} from '../../Menus/MenuAnchor.tsx';
import {ListTitleView} from '../../Views/ListTitleView.tsx';
import {BoardgameGuideFAB} from '../../Buttons/FloatingActionButtons/BoardgameGuideFAB.tsx';

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
