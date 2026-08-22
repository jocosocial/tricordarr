import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {RegCodeText} from '#src/Components/Text/RegCodeText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useClipboard} from '#src/Hooks/useClipboard';
import {formatRegCodeDisplay} from '#src/Libraries/StringUtils';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useUnlockRegCodeMutation} from '#src/Queries/Admin/RegCodeMutations';
import {useRegCodeForUserQuery} from '#src/Queries/Admin/RegCodeQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.userRegCodeScreen>;

export const UserRegCodeScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.userProfilesHelpScreen}>
      <DisabledFeatureScreen
        feature={SwiftarrFeature.users}
        urlPath={`/admin/regcodes/showuser/${props.route.params.userID}`}>
        <UserRegCodeScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

const UserRegCodeScreenInner = ({route, navigation}: Props) => {
  const {data} = useRegCodeForUserQuery({userID: route.params.userID});
  const {setModalVisible} = useModal();
  const {setSnackbarPayload} = useSnackbar();
  const unlockMutation = useUnlockRegCodeMutation();
  const {setString} = useClipboard();

  const handleUserPress = (pressedUserID: string) => {
    setModalVisible(false);
    navigation.push(CommonStackComponents.userProfileScreen, {
      userID: pressedUserID,
    });
  };

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
              description={<RegCodeText code={data.regCode} selectable={false} />}
              onLongPress={() => setString(formatRegCodeDisplay(data.regCode))}
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
            buttonText={'Unlock'}
            onPress={handleUnlock}
            disabled={!data?.hasUsedRegCodeForPasswordRecovery || unlockMutation.isPending}
            isLoading={unlockMutation.isPending}
          />
        </PaddedContentView>
        <View>
          <ListSubheader>Related Accounts</ListSubheader>
          {data?.users.map(user => (
            <UserListItem key={user.userID} userHeader={user} onPress={() => handleUserPress(user.userID)} />
          ))}
        </View>
      </ScrollingContentView>
    </AppView>
  );
};
