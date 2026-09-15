import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React from 'react';
import {Text} from 'react-native-paper';

import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {invalidateQueryKeys} from '#src/Libraries/QueryInvalidation';
import {
  CommonStackComponents,
  CommonStackParamList,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useUserUsernameMutation} from '#src/Queries/User/UserMutations';
import {ModeratorFeatureScreen} from '#src/Screens/Checkpoint/ModeratorFeatureScreen';
import {ChangeUsernameScreenBase} from '#src/Screens/Settings/Account/ChangeUsernameScreenBase';
import {
  ModeratorActionLogResponseData,
  ProfileModerationData,
  UserHeader,
  UserModerationData,
} from '#src/Structs/ControllerStructs';
import {ChangeUsernameFormValues} from '#src/Types/FormValues';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.moderateChangeUsernameScreen>;

/**
 * Change another user's login username from a profile moderate screen.
 */
const ModerateChangeUsernameScreenInner = ({route}: Props) => {
  const {userID, username} = route.params;
  const navigation = useCommonStack();
  const usernameMutation = useUserUsernameMutation();
  const queryClient = useQueryClient();
  const {setSnackbarPayload} = useSnackbar();

  /**
   * Submit a moderator username change and invalidate profile, user, and action-log caches.
   */
  const onSubmit = (values: ChangeUsernameFormValues, helper: FormikHelpers<ChangeUsernameFormValues>) => {
    usernameMutation.mutate(
      {
        userUsernameData: values,
        userID,
      },
      {
        onSuccess: async () => {
          await invalidateQueryKeys(
            queryClient,
            ProfileModerationData.getCacheKeys(userID)
              .concat(UserModerationData.getCacheKeys(userID))
              .concat(UserHeader.getCacheKeys({userID, username}))
              .concat(ModeratorActionLogResponseData.getCacheKeys()),
          );
          setSnackbarPayload({message: 'Successfully changed username!'});
          navigation.goBack();
        },
        onSettled: () => {
          helper.setSubmitting(false);
        },
      },
    );
  };

  return (
    <ChangeUsernameScreenBase
      currentUsername={username}
      onSubmit={onSubmit}
      helpScreen={CommonStackComponents.moderatorHelpScreen}>
      <PaddedContentView>
        <Text>
          If you change a user's username and don't tell them, they can't log in. Sending a seamail informing them of
          their new username is ineffective as they can't read it.
        </Text>
      </PaddedContentView>
      <PaddedContentView>
        <Text>
          If the user's standing next to you at the Help Desk, you can use this form to change the user's username.
        </Text>
      </PaddedContentView>
      <PaddedContentView>
        <Text>
          If the user's name is sorta offensive, it may be best to quarantine them and send them a seamail saying they
          need to change their username to get un-quarantined.
        </Text>
      </PaddedContentView>
      <PaddedContentView>
        <Text>
          If the user's name is really offensive to where they get banned, you can use this form to change their name
          which will update all their posts with their new (non-offensive) name.
        </Text>
      </PaddedContentView>
    </ChangeUsernameScreenBase>
  );
};

export const ModerateChangeUsernameScreen = (props: Props) => {
  return (
    <ModeratorFeatureScreen>
      <ModerateChangeUsernameScreenInner {...props} />
    </ModeratorFeatureScreen>
  );
};
