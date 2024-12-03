import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import React from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {UserNoteForm} from '../../Forms/User/UserNoteForm.tsx';
import {UserNoteFormValues} from '../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useUserNoteCreateMutation, useUserNoteDeleteMutation} from '../../Queries/Users/UserNoteMutations.ts';
import {useQueryClient} from '@tanstack/react-query';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../styles/Theme';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.userPrivateNoteScreen>;

export const UserPrivateNoteScreen = ({route, navigation}: Props) => {
  const createMutation = useUserNoteCreateMutation();
  const deleteMutation = useUserNoteDeleteMutation();
  const initialValues: UserNoteFormValues = {
    note: route.params.user.note || '',
  };
  const queryClient = useQueryClient();
  const theme = useAppTheme();
  const {commonStyles} = useStyles();
  const onSubmit = (values: UserNoteFormValues, helpers: FormikHelpers<UserNoteFormValues>) => {
    helpers.setSubmitting(true);
    createMutation.mutate(
      {
        userID: route.params.user.header.userID,
        noteData: values,
      },
      {
        onSuccess: () => {
          queryClient.setQueryData([`/users/${route.params.user.header.userID}/profile`, undefined], () => {
            return {
              ...route.params.user,
              note: values.note,
            };
          });
          navigation.goBack();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };
  const handleDelete = () => {
    deleteMutation.mutate(
      {
        userID: route.params.user.header.userID,
      },
      {
        onSuccess: () => {
          queryClient.setQueryData([`/users/${route.params.user.header.userID}/profile`, undefined], () => {
            return {
              ...route.params.user,
              note: undefined,
            };
          });
          navigation.goBack();
        },
      },
    );
  };
  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>Add a note about this user, visible only to you.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <UserNoteForm initialValues={initialValues} onSubmit={onSubmit} />
          {route.params.user.note && (
            <PrimaryActionButton
              buttonColor={theme.colors.twitarrNegativeButton}
              disabled={deleteMutation.isLoading}
              isLoading={deleteMutation.isLoading}
              viewStyle={[commonStyles.marginTop]}
              onPress={handleDelete}
              buttonText={'Delete'}
            />
          )}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
