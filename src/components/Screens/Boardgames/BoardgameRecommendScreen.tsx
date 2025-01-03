import {AppView} from '../../Views/AppView.tsx';
import {BoardgameRecommendationForm} from '../../Forms/BoardgameRecommendationForm.tsx';
import {BoardgameData, BoardgameRecommendationData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {FormikHelpers} from 'formik';
import React, {useState} from 'react';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {useBoardgameRecommendMutation} from '../../Queries/Boardgames/BoardgameMutations.ts';
import {BoardgameFlatList} from '../../Lists/BoardgameFlatList.tsx';

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
}: {
  initialValues: BoardgameRecommendationData;
  onSubmit: (values: BoardgameRecommendationData, helpers: FormikHelpers<BoardgameRecommendationData>) => void;
}) => (
  <PaddedContentView padTop={true}>
    <BoardgameRecommendationForm initialValues={initialValues} onSubmit={onSubmit} />
  </PaddedContentView>
);

export const BoardgameRecommendScreen = () => {
  const guideMutation = useBoardgameRecommendMutation();
  const [games, setGames] = useState<BoardgameData[]>([]);
  const [fieldValues, setFieldValues] = useState<BoardgameRecommendationData>(defaultValues);

  const onSubmit = (values: BoardgameRecommendationData, helpers: FormikHelpers<BoardgameRecommendationData>) => {
    console.log(values);
    guideMutation.mutate(
      {
        recommendationData: values,
      },
      {
        onSuccess: response => {
          setGames(response.data.gameArray);
          setFieldValues(values);
          // @TODO why is this blinking before change
          helpers.resetForm({values: values});
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  const getHeader = () => <ListHeader onSubmit={onSubmit} initialValues={fieldValues} />;

  return (
    <AppView>
      <BoardgameFlatList items={games} listHeader={getHeader} />
    </AppView>
  );
};
