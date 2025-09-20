import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackComponents, MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem.tsx';
import {BoardgameData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {decode} from 'html-entities';
import {RefreshControl, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {useBoardgameQuery} from '../../Queries/Boardgames/BoardgameQueries.ts';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import {useBoardgameFavoriteMutation} from '../../Queries/Boardgames/BoardgameMutations.ts';
import {useQueryClient} from '@tanstack/react-query';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {HeaderFavoriteButton} from '../../Buttons/HeaderButtons/HeaderFavoriteButton.tsx';

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
            const invalidations = BoardgameData.getCacheKeys(data.gameID).map(key => {
              return queryClient.invalidateQueries(key);
            });
            await Promise.all(invalidations);
          },
        },
      );
    }
  }, [data, favoriteMutation, queryClient]);

  const onCreate = useCallback(() => {
    if (data) {
      navigation.push(MainStackComponents.boardgameCreateLfgScreen, {
        boardgame: data,
      });
    }
  }, [data, navigation]);

  const getNavButtons = useCallback(
    () => (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          {data && (
            <>
              <Item title={'Create LFG'} iconName={AppIcons.lfgCreate} onPress={onCreate} />
              <HeaderFavoriteButton isFavorite={data.isFavorite} onPress={onFavorite} />
            </>
          )}
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(MainStackComponents.boardgameHelpScreen)}
          />
        </HeaderButtons>
      </View>
    ),
    [data, navigation, onCreate, onFavorite],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (isLoading || !data) {
    return <LoadingView />;
  }

  const players = BoardgameData.getPlayers(data);
  const playingTime = BoardgameData.getPlayingTime(data);

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <DataFieldListItem title={'Name'} description={data.gameName} />
        {!!players && <DataFieldListItem title={'Players'} description={players} />}
        {!!playingTime && <DataFieldListItem title={'Playing Time'} description={playingTime} />}
        {!!data.avgRating && <DataFieldListItem title={'Rating (1-10)'} description={data.avgRating.toFixed(2)} />}
        {!!data.yearPublished && <DataFieldListItem title={'Year'} description={data.yearPublished} />}
        {!!data.complexity && data.complexity > 0 && (
          <DataFieldListItem title={'Complexity (1-5)'} description={data.complexity.toFixed(0)} />
        )}
        {!!data.gameDescription && (
          <DataFieldListItem title={'Description'} description={decodeHtml(data.gameDescription)} />
        )}
        {data.gameTypes.length > 0 && (
          <DataFieldListItem title={'Game Types'} description={data.gameTypes.join(', ')} />
        )}
        {data.categories.length > 0 && (
          <DataFieldListItem title={'Categories'} description={data.categories.join(', ')} />
        )}
        {data.mechanics.length > 0 && <DataFieldListItem title={'Mechanics'} description={data.mechanics.join(', ')} />}
        {!!data.donatedBy && <DataFieldListItem title={'Donated By'} description={data.donatedBy} />}
        {(data.isExpansion || data.hasExpansions) && (
          <PaddedContentView padTop={true}>
            <PrimaryActionButton
              buttonText={'Expansions'}
              onPress={() =>
                navigation.push(MainStackComponents.boardgameExpansionsScreen, {
                  boardgameID: route.params.boardgame.gameID,
                })
              }
            />
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
