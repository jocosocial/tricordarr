import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React, {useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

import {UsernameLookupForm} from '#src/Components/Forms/User/UsernameLookupForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useClipboard} from '#src/Hooks/useClipboard';
import {normalized} from '#src/Libraries/RegistrationCode';
import {normalizeServerUrl} from '#src/Libraries/ServerUrl';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useUsernameLookupMutation} from '#src/Queries/Auth/RecoveryMutations';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {UsernameLookupFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.usernameLookupScreen>;

/**
 * Recovers a forgotten username from a registration code plus the account password or
 * recovery key. Reached from the login form, so it runs while logged out and acts on the server
 * that form was logging in to (the route's, else the active session's).
 */
export const UsernameLookupScreen = ({route}: Props) => {
  const lookupMutation = useUsernameLookupMutation();
  const [userHeader, setUserHeader] = useState<UserHeader>();
  const {commonStyles} = useStyles();
  const {serverUrl: sessionServerUrl} = useSwiftarrQueryClient();
  const serverUrl = normalizeServerUrl(route.params?.serverUrl ?? sessionServerUrl);
  const inSetupFlow = !!route.params?.mode;
  const {setString} = useClipboard();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        fieldLabel: {
          ...commonStyles.bold,
        },
        username: {
          ...commonStyles.textCenter,
          ...commonStyles.noteContainer,
          ...commonStyles.onNoteContainer,
          ...commonStyles.roundedBorder,
          ...commonStyles.paddingVerticalSmall,
        },
      }),
    [commonStyles],
  );

  const onSubmit = (values: UsernameLookupFormValues, helpers: FormikHelpers<UsernameLookupFormValues>) => {
    lookupMutation.mutate(
      {
        serverUrl,
        // THO mails codes as "ABC DEF"; swiftarr stores and matches them as "abcdef".
        registrationCode: normalized(values.registrationCode),
        recoveryKey: values.recoveryKey,
      },
      {
        onSuccess: response => {
          setUserHeader(response.data);
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  if (userHeader) {
    return (
      <AppView disablePreRegistrationWarning={inSetupFlow}>
        <ScrollingContentView isStack={true}>
          <PaddedContentView padTop={true}>
            <Text>Found your account on {serverUrl}. Your username is:</Text>
          </PaddedContentView>
          <PaddedContentView>
            <Text
              selectable={false}
              style={styles.username}
              variant={'titleLarge'}
              onLongPress={() => setString(userHeader.username)}>
              {userHeader.username}
            </Text>
          </PaddedContentView>
          <PaddedContentView>
            <Text>Long press your username above to copy it.</Text>
          </PaddedContentView>
          <PaddedContentView>
            {userHeader.displayName && (
              <Text>
                <Text style={styles.fieldLabel}>Display Name: </Text>
                <Text selectable={false}>{userHeader.displayName}</Text>
              </Text>
            )}
          </PaddedContentView>
        </ScrollingContentView>
      </AppView>
    );
  }

  return (
    <AppView disablePreRegistrationWarning={inSetupFlow}>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <Text style={commonStyles.marginBottom}>
            Looking up your username on {serverUrl}. You will need your registration code and either your recovery key
            or your current password.
          </Text>
          <UsernameLookupForm onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
