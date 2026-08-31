import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {Text} from 'react-native-paper';
import {TextInput} from 'react-native-paper';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {UserFindSearchBar} from '#src/Components/Search/UserSearchBar/UserFindSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useRegCodeStatsQuery, useUserForRegCodeQuery} from '#src/Queries/Admin/RegCodeQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.adminRegCodesScreen>;

export const AdminRegCodesScreen = (props: Props) => {
  return (
    <AdminAccessScreen minAccess={'accountmanager'}>
      <AdminRegCodesScreenInner {...props} />
    </AdminAccessScreen>
  );
};

const AdminRegCodesScreenInner = ({navigation}: Props) => {
  const {data: stats, refetch, isLoading} = useRegCodeStatsQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const [regCode, setRegCode] = useState('');
  const normalized = regCode.replace(/\s/g, '').toLowerCase();
  const {data: users, isFetching: searching} = useUserForRegCodeQuery(
    {regCode: normalized},
    {enabled: normalized.length === 6},
  );
  useAdminHelpButton();

  if (isLoading && !stats) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListSection>
          <ListSubheader>Usage</ListSubheader>
        </ListSection>
        <DataFieldListItem title={'Allocated'} description={stats?.allocatedCodes} />
        <DataFieldListItem title={'Used'} description={stats?.usedCodes} />
        <DataFieldListItem title={'Unused'} description={stats?.unusedCodes} />
        <DataFieldListItem title={'Discord Allocated'} description={stats?.allocatedDiscordCodes} />
        <DataFieldListItem title={'Discord Assigned'} description={stats?.assignedDiscordCodes} />
        <DataFieldListItem title={'Discord Used'} description={stats?.usedDiscordCodes} />
        <ListSection>
          <ListSubheader>Find By Code</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <TextInput
            label={'Registration Code'}
            value={regCode}
            onChangeText={setRegCode}
            autoCapitalize={'characters'}
            autoCorrect={false}
            testID={'regCodeSearch-field'}
          />
          {normalized.length === 6 && !searching && users?.length === 0 && (
            <Text>Valid code with no associated account yet.</Text>
          )}
        </PaddedContentView>
        {users?.map(user => (
          <UserListItem
            key={user.userID}
            userHeader={user}
            onPress={() => navigation.push(CommonStackComponents.userRegCodeScreen, {userID: user.userID})}
          />
        ))}
        <ListSection>
          <ListSubheader>Find By User</ListSubheader>
        </ListSection>
        <PaddedContentView padTop={true}>
          <UserFindSearchBar
            testID={'regCodeUser-search'}
            label={'Username'}
            onPress={user => navigation.push(CommonStackComponents.userRegCodeScreen, {userID: user.userID})}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
