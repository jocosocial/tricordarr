import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React from 'react';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AdminHuntForm} from '#src/Components/Forms/Admin/AdminHuntForm';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {parseHuntPuzzlesJson} from '#src/Libraries/Admin/HuntPuzzles';
import {alertDeleteHunt} from '#src/Libraries/Alerts/AdminAlerts';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useCreateHuntMutation, useDeleteHuntMutation, usePatchHuntMutation} from '#src/Queries/Admin/HuntMutations';
import {useHuntAdminQuery} from '#src/Queries/Admin/HuntQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {AdminHuntFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminHuntEditScreen>;

export const AdminHuntEditScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminHuntEditScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminHuntEditScreenInner = ({route, navigation}: Props) => {
  const huntID = route.params.huntID;
  const {data, isLoading} = useHuntAdminQuery({huntID: huntID ?? ''}, {enabled: !!huntID});
  const createMutation = useCreateHuntMutation();
  const patchMutation = usePatchHuntMutation();
  const deleteMutation = useDeleteHuntMutation();
  const {setSnackbarPayload} = useSnackbar();
  const {theme} = useAppTheme();
  useAdminHelpButton();

  const initialValues: AdminHuntFormValues = {
    title: data?.title ?? '',
    description: data?.description ?? '',
    puzzlesJson: '',
  };

  const onSubmit = (values: AdminHuntFormValues, helpers: FormikHelpers<AdminHuntFormValues>) => {
    if (huntID) {
      patchMutation.mutate(
        {huntID, data: {title: values.title, description: values.description}},
        {
          onSuccess: () => {
            setSnackbarPayload({message: 'Hunt updated.', messageType: 'success'});
            navigation.goBack();
          },
          onSettled: () => helpers.setSubmitting(false),
        },
      );
      return;
    }
    try {
      const puzzles = parseHuntPuzzlesJson(values.puzzlesJson);
      createMutation.mutate(
        {title: values.title, description: values.description, puzzles},
        {
          onSuccess: () => {
            setSnackbarPayload({message: 'Hunt created.', messageType: 'success'});
            navigation.goBack();
          },
          onSettled: () => helpers.setSubmitting(false),
        },
      );
    } catch (error) {
      helpers.setFieldError('puzzlesJson', error instanceof Error ? error.message : String(error));
      helpers.setSubmitting(false);
    }
  };

  if (huntID && isLoading && !data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <AdminHuntForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            buttonText={huntID ? 'Save' : 'Create'}
            showPuzzlesField={!huntID}
          />
        </PaddedContentView>
        {data && (
          <>
            <ListSection>
              <ListSubheader>Puzzles</ListSubheader>
            </ListSection>
            {data.puzzles.map(puzzle => (
              <DataFieldListItem
                key={puzzle.puzzleID}
                title={puzzle.title}
                description={puzzle.answer ?? puzzle.body}
                onPress={() =>
                  navigation.push(CommonStackComponents.adminPuzzleEditScreen, {
                    huntID: data.huntID,
                    puzzleID: puzzle.puzzleID,
                  })
                }
              />
            ))}
            <PaddedContentView padTop={true}>
              <PrimaryActionButton
                testID={'huntDelete-button'}
                buttonText={'Delete Hunt'}
                buttonColor={theme.colors.twitarrNegativeButton}
                onPress={() =>
                  alertDeleteHunt(data.title, () =>
                    deleteMutation.mutate(data.huntID, {
                      onSuccess: () => {
                        setSnackbarPayload({message: 'Hunt deleted.', messageType: 'success'});
                        navigation.goBack();
                      },
                    }),
                  )
                }
                isLoading={deleteMutation.isPending}
              />
            </PaddedContentView>
          </>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
