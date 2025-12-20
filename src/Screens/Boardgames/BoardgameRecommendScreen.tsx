import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Divider} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {BoardgameRecommendationForm} from '#src/Components/Forms/BoardgameRecommendationForm';
import {BoardgameFlatList} from '#src/Components/Lists/Boardgames/BoardgameFlatList';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useBoardgameRecommendMutation} from '#src/Queries/Boardgames/BoardgameMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
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

type Props = StackScreenProps<MainStackParamList, MainStackComponents.boardgameRecommendScreen>;

export const BoardgameRecommendScreen = (props: Props) => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.gameslist} urlPath={'/boardgames/guide'}>
        <BoardgameRecommendScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const BoardgameRecommendScreenInner = ({navigation}: Props) => {
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
        <MaterialHeaderButtons left>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(MainStackComponents.boardgameHelpScreen)}
          />
        </MaterialHeaderButtons>
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
