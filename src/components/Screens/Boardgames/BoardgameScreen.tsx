import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem.tsx';
import {BoardgameData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {decode} from 'html-entities';
import {RefreshControl, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {useBoardgameQuery} from '../../Queries/Boardgames/BoardgameQueries.ts';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {useBoardgameFavoriteMutation} from '../../Queries/Boardgames/BoardgameMutations.ts';
import {useQueryClient} from '@tanstack/react-query';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.boardgameScreen>;

// This is kinda shady.
const decodeHtml = (html?: string) => {
  let text = decode(html);
  return text.replaceAll('<br/>', '\n').replaceAll('    ', '').trimEnd();
};

export const BoardgameScreen = ({navigation, route}: Props) => {
  const {data, isFetching, isLoading, refetch} = useBoardgameQuery({boardgameID: route.params.boardgame.gameID});
  const favoriteMutation = useBoardgameFavoriteMutation();
  const queryClient = useQueryClient();

  const onFavorite = useCallback(() => {
    if (data) {
      favoriteMutation.mutate(
        {
          boardgameID: data.gameID,
          action: data.isFavorite ? 'unfavorite' : 'favorite',
        },
        {
          onSuccess: async () => {
            await Promise.all([
              queryClient.invalidateQueries(['/boardgames']),
              queryClient.invalidateQueries([`/boardgames/${data.gameID}`]),
            ]);
          },
        },
      );
    }
  }, [data, favoriteMutation, queryClient]);

  const getNavButtons = useCallback(
    () => (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Favorite'}
            iconName={data?.isFavorite ? AppIcons.favorite : AppIcons.toggleFavorite}
            onPress={onFavorite}
          />
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(MainStackComponents.boardgameHelpScreen)}
          />
        </HeaderButtons>
      </View>
    ),
    [data?.isFavorite, navigation, onFavorite],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (isLoading || !data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <DataFieldListItem title={'Name'} description={data.gameName} />
        <DataFieldListItem title={'Players'} description={BoardgameData.getPlayers(data)} />
        <DataFieldListItem title={'Playing Time'} description={BoardgameData.getPlayingTime(data)} />
        <DataFieldListItem title={'Rating (1-10)'} description={data.avgRating} />
        <DataFieldListItem title={'Year'} description={data.yearPublished} />
        <DataFieldListItem title={'Complexity (1-5)'} description={data.complexity} />
        <DataFieldListItem title={'Description'} description={decodeHtml(data.gameDescription)} />
        <DataFieldListItem title={'Categories'} description={data.categories.join(', ')} />
        <DataFieldListItem title={'Mechanics'} description={data.mechanics.join(', ')} />
      </ScrollingContentView>
    </AppView>
  );
};
