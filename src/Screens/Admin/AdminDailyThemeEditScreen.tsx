import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React from 'react';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AdminDailyThemeForm} from '#src/Components/Forms/Admin/AdminDailyThemeForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {alertDeleteDailyTheme} from '#src/Libraries/Alerts/AdminAlerts';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {
  useCreateDailyThemeMutation,
  useDeleteDailyThemeMutation,
  useEditDailyThemeMutation,
} from '#src/Queries/Admin/DailyThemeMutations';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {DailyThemeUploadData} from '#src/Structs/AdminControllerStructs';
import {AdminDailyThemeFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminDailyThemeEditScreen>;

export const AdminDailyThemeEditScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'tho'}>
      <AdminDailyThemeEditScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminDailyThemeEditScreenInner = ({route, navigation}: Props) => {
  const theme = route.params.dailyTheme;
  const createMutation = useCreateDailyThemeMutation();
  const editMutation = useEditDailyThemeMutation();
  const deleteMutation = useDeleteDailyThemeMutation();
  const {setSnackbarPayload} = useSnackbar();
  useAdminHelpButton();

  const initialValues: AdminDailyThemeFormValues = {
    title: theme?.title ?? '',
    info: theme?.info ?? '',
    cruiseDay: theme ? String(theme.cruiseDay) : '0',
    image: theme?.image ? {filename: theme.image} : {},
  };

  const toUpload = (values: AdminDailyThemeFormValues): DailyThemeUploadData => ({
    title: values.title,
    info: values.info,
    cruiseDay: Number(values.cruiseDay),
    image: values.image.image || values.image.filename ? values.image : undefined,
  });

  const onSubmit = (values: AdminDailyThemeFormValues, helpers: FormikHelpers<AdminDailyThemeFormValues>) => {
    const data = toUpload(values);
    if (theme) {
      editMutation.mutate(
        {themeID: theme.themeID, data},
        {
          onSuccess: () => {
            setSnackbarPayload({message: 'Daily theme updated.', messageType: 'success'});
            navigation.goBack();
          },
          onSettled: () => helpers.setSubmitting(false),
        },
      );
      return;
    }
    createMutation.mutate(data, {
      onSuccess: () => {
        setSnackbarPayload({message: 'Daily theme created.', messageType: 'success'});
        navigation.goBack();
      },
      onSettled: () => helpers.setSubmitting(false),
    });
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <AdminDailyThemeForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            buttonText={theme ? 'Save' : 'Create'}
          />
        </PaddedContentView>
        {theme && (
          <PaddedContentView>
            <PrimaryActionButton
              testID={'themeDelete-button'}
              buttonText={'Delete'}
              onPress={() =>
                alertDeleteDailyTheme(() =>
                  deleteMutation.mutate(theme.themeID, {
                    onSuccess: () => {
                      setSnackbarPayload({message: 'Daily theme deleted.', messageType: 'success'});
                      navigation.goBack();
                    },
                  }),
                )
              }
              isLoading={deleteMutation.isPending}
            />
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
