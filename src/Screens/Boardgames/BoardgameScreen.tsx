import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import {decode} from 'html-entities';
import React, {useCallback, useEffect} from 'react';
import {RefreshControl, View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';

import {HeaderFavoriteButton} from '#src/Components/Buttons/HeaderButtons/HeaderFavoriteButton';
import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {AppIcons} from '#src/Enums/Icons';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useBoardgameFavoriteMutation} from '#src/Queries/Boardgames/BoardgameMutations';
import {useBoardgameQuery} from '#src/Queries/Boardgames/BoardgameQueries';
import {BoardgameData} from '#src/Structs/ControllerStructs';

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
              return queryClient.invalidateQueries({queryKey: key});
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
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
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
