import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React from 'react';
import {Text} from 'react-native-paper';

import {AdminPuzzleForm} from '#src/Components/Forms/Admin/AdminPuzzleForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {combineDateAndTime, splitIsoDateTime} from '#src/Libraries/Admin/AdminDateTime';
import {hintsToJson, parseHintsJson} from '#src/Libraries/Admin/HuntPuzzles';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {usePatchHuntPuzzleMutation} from '#src/Queries/Admin/HuntMutations';
import {useHuntAdminQuery} from '#src/Queries/Admin/HuntQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {HuntPuzzlePatchData} from '#src/Structs/AdminControllerStructs';
import {AdminHuntPuzzleFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminPuzzleEditScreen>;

export const AdminPuzzleEditScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminPuzzleEditScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminPuzzleEditScreenInner = ({route, navigation}: Props) => {
  const {huntID, puzzleID} = route.params;
  const {data, isLoading} = useHuntAdminQuery({huntID});
  const mutation = usePatchHuntPuzzleMutation();
  const {setSnackbarPayload} = useSnackbar();
  useAdminHelpButton();

  const puzzle = data?.puzzles.find(item => item.puzzleID === puzzleID);
  const existing = puzzle?.unlockTime ? splitIsoDateTime(puzzle.unlockTime) : undefined;

  const initialValues: AdminHuntPuzzleFormValues = {
    title: puzzle?.title ?? '',
    body: puzzle?.body ?? '',
    answer: puzzle?.answer ?? '',
    unlockTimeDate: existing?.date ?? new Date(),
    unlockTimeTime: existing?.time ?? {hours: 8, minutes: 0},
    clearUnlockTime: !puzzle?.unlockTime,
    hintsJson: hintsToJson(puzzle?.hints),
  };

  const onSubmit = (values: AdminHuntPuzzleFormValues, helpers: FormikHelpers<AdminHuntPuzzleFormValues>) => {
    try {
      const payload: HuntPuzzlePatchData = {
        title: values.title,
        body: values.body,
        answer: values.answer,
        hints: parseHintsJson(values.hintsJson),
        unlockTime: values.clearUnlockTime
          ? null
          : combineDateAndTime(values.unlockTimeDate ?? new Date(), values.unlockTimeTime),
      };
      mutation.mutate(
        {puzzleID, huntID, data: payload},
        {
          onSuccess: () => {
            setSnackbarPayload({message: 'Puzzle updated.', messageType: 'success'});
            navigation.goBack();
          },
          onSettled: () => helpers.setSubmitting(false),
        },
      );
    } catch (error) {
      helpers.setFieldError('hintsJson', error instanceof Error ? error.message : String(error));
      helpers.setSubmitting(false);
    }
  };

  if (isLoading && !data) {
    return <LoadingView />;
  }

  if (!puzzle) {
    return (
      <AppView>
        <ScrollingContentView>
          <PaddedContentView padTop={true}>
            <Text>Puzzle not found.</Text>
          </PaddedContentView>
        </ScrollingContentView>
      </AppView>
    );
  }

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <AdminPuzzleForm initialValues={initialValues} onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
