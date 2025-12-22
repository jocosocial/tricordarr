import {StackScreenProps} from '@react-navigation/stack';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React from 'react';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {UserNoteForm} from '#src/Components/Forms/User/UserNoteForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useUserNoteCreateMutation, useUserNoteDeleteMutation} from '#src/Queries/Users/UserNoteMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {UserNoteFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.userPrivateNoteScreen>;

export const UserPrivateNoteScreen = (props: Props) => {
  return (
    <PreRegistrationScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.users} urlPath={`/user/${props.route.params.user.header.userID}`}>
        <UserPrivateNoteScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const UserPrivateNoteScreenInner = ({route, navigation}: Props) => {
  const createMutation = useUserNoteCreateMutation();
  const deleteMutation = useUserNoteDeleteMutation();
  const initialValues: UserNoteFormValues = {
    note: route.params.user.note || '',
  };
  const queryClient = useQueryClient();
  const {theme} = useAppTheme();
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
          const invalidations = UserHeader.getCacheKeys(route.params.user.header).map(key => {
            return queryClient.invalidateQueries({queryKey: key});
          });
          Promise.all(invalidations);
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
        onSuccess: async () => {
          const invalidations = UserHeader.getCacheKeys(route.params.user.header).map(key => {
            return queryClient.invalidateQueries({queryKey: key});
          });
          await Promise.all(invalidations);
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
              disabled={deleteMutation.isPending}
              isLoading={deleteMutation.isPending}
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
