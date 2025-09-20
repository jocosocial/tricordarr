import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Divider} from 'react-native-paper';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {BoardgameRecommendationForm} from '#src/Components/Forms/BoardgameRecommendationForm';
import {BoardgameFlatList} from '#src/Components/Lists/BoardgameFlatList';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {AppIcons} from '#src/Enums/Icons';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useBoardgameRecommendMutation} from '#src/Queries/Boardgames/BoardgameMutations';
import {BoardgameData, BoardgameRecommendationData} from '#src/Structs/ControllerStructs';

const defaultValues: BoardgameRecommendationData = {
  numPlayers: 2,
  timeToPlay: 30,
  maxAge: 0,
  complexity: 1,
  minAge: 0,
};

const ListHeader = ({
  initialValues,
  onSubmit,
  games,
}: {
  initialValues: BoardgameRecommendationData;
  onSubmit: (values: BoardgameRecommendationData, helpers: FormikHelpers<BoardgameRecommendationData>) => void;
  games: BoardgameData[];
}) => (
  <>
    <PaddedContentView padTop={true}>
      <BoardgameRecommendationForm initialValues={initialValues} onSubmit={onSubmit} />
    </PaddedContentView>
    {games.length > 0 && <Divider bold={true} />}
  </>
);

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.boardgameRecommendScreen>;

export const BoardgameRecommendScreen = ({navigation}: Props) => {
  const guideMutation = useBoardgameRecommendMutation();
  const [games, setGames] = useState<BoardgameData[]>([]);
  const [fieldValues, setFieldValues] = useState<BoardgameRecommendationData>(defaultValues);

  const onSubmit = (values: BoardgameRecommendationData, helpers: FormikHelpers<BoardgameRecommendationData>) => {
    setFieldValues(values);
    guideMutation.mutate(
      {
        recommendationData: values,
      },
      {
        onSuccess: response => {
          setGames(response.data.gameArray);
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  const getHeader = () => <ListHeader onSubmit={onSubmit} initialValues={fieldValues} games={games} />;

  const getNavButtons = useCallback(
    () => (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(MainStackComponents.boardgameHelpScreen)}
          />
        </HeaderButtons>
      </View>
    ),
    [navigation],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <BoardgameFlatList items={games} listHeader={getHeader} />
    </AppView>
  );
};
