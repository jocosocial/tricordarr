import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {BoardgameGuideFAB} from '#src/Components/Buttons/FloatingActionButtons/BoardgameGuideFAB';
import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {BoardgameFlatList} from '#src/Components/Lists/Boardgames/BoardgameFlatList';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useBoardgamesQuery} from '#src/Queries/Boardgames/BoardgameQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.boardgameListScreen>;

export const BoardgameListScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.boardgameHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.gameslist} urlPath={'/boardgames'}>
          <BoardgameListScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const BoardgameListScreenInner = ({navigation}: Props) => {
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
        <MaterialHeaderButtons left>
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
        </MaterialHeaderButtons>
      </View>
    ),
    [favorites, navigation],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

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
        refreshControl={<AppRefreshControl refreshing={isFetching} onRefresh={refetch} />}
      />
      <BoardgameGuideFAB showLabel={true} />
    </AppView>
  );
};
