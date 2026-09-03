import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useClipboard} from '#src/Hooks/useClipboard';
import {displayString} from '#src/Libraries/RegistrationCode';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useUnlockRegCodeMutation} from '#src/Queries/Admin/RegCodeMutations';
import {useRegCodeForUserQuery} from '#src/Queries/Admin/RegCodeQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.userRegCodeScreen>;

export const UserRegCodeScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.registrationCodeHelpScreen}>
      <DisabledFeatureScreen
        feature={SwiftarrFeature.users}
        urlPath={`/admin/regcodes/showuser/${props.route.params.userID}`}>
        <UserRegCodeScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

/**
 * Per-user registration code, related accounts, and password-recovery unlock.
 */
const UserRegCodeScreenInner = ({route, navigation}: Props) => {
  const {data} = useRegCodeForUserQuery({userID: route.params.userID});
  const {setSnackbarPayload} = useSnackbar();
  const unlockMutation = useUnlockRegCodeMutation();
  const {setString} = useClipboard();
  useAdminHelpButton(CommonStackComponents.registrationCodeHelpScreen);

  const handleUnlock = () => {
    unlockMutation.mutate(
      {userID: route.params.userID},
      {
        onSuccess: () => {
          setSnackbarPayload({message: 'Password reset unlocked.', messageType: 'success'});
        },
      },
    );
  };

  const accountCreatedAt = data?.accountCreatedAt ? new Date(data.accountCreatedAt).toLocaleString() : undefined;

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <View>
          <ListSubheader>Code</ListSubheader>
          {data && (
            <DataFieldListItem
              title={'Registration Code'}
              description={displayString(data.regCode)}
              onLongPress={() => setString(displayString(data.regCode))}
            />
          )}
          {accountCreatedAt && <DataFieldListItem title={'Account Created'} description={accountCreatedAt} />}
          {data && (
            <DataFieldListItem
              title={'Used for Password Reset'}
              description={data.hasUsedRegCodeForPasswordRecovery ? 'Yes' : 'No'}
            />
          )}
        </View>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'unlock-button'}
            buttonText={'Unlock'}
            onPress={handleUnlock}
            disabled={!data?.hasUsedRegCodeForPasswordRecovery || unlockMutation.isPending}
            isLoading={unlockMutation.isPending}
          />
        </PaddedContentView>
        <View>
          <ListSubheader>Related Accounts</ListSubheader>
          {data?.users.map(user => (
            <UserListItem
              key={user.userID}
              userHeader={user}
              onPress={() =>
                navigation.push(CommonStackComponents.userProfileScreen, {
                  userID: user.userID,
                })
              }
            />
          ))}
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
