import {AppView} from '../../Views/AppView.tsx';
import {BoardgameRecommendationForm} from '../../Forms/BoardgameRecommendationForm.tsx';
import {BoardgameData, BoardgameRecommendationData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {useBoardgameRecommendMutation} from '../../Queries/Boardgames/BoardgameMutations.ts';
import {BoardgameFlatList} from '../../Lists/BoardgameFlatList.tsx';
import {Divider} from 'react-native-paper';
import {View} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {MainStackComponents, MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

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
