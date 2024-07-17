import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {Text} from 'react-native-paper';
import {useUserRelations} from '../../Context/Contexts/UserRelationsContext';
import {RefreshControl} from 'react-native';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {UserListItem} from '../../Lists/Items/UserListItem';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useUserBlockMutation, useUserBlocksQuery} from '../../Queries/Users/UserBlockQueries';
import {ModeratorBlockText, UserBlockText} from '../../Text/UserRelationsText';
import {ItalicText} from '../../Text/ItalicText';
import {LoadingView} from '../../Views/Static/LoadingView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SettingsStackParamList} from '../../Navigation/Stacks/SettingsStackNavigator.tsx';
import {SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {CommonStackComponents} from '../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.blockUsers>;
export const BlockUsersScreen = ({navigation}: Props) => {
  const {blocks, setBlocks} = useUserRelations();
  const {hasModerator} = usePrivilege();
  const userBlockMutation = useUserBlockMutation();
  const {isLoading, refetch, isRefetching} = useUserBlocksQuery();

  const handleUnblockUser = (userHeader: UserHeader) => {
    userBlockMutation.mutate(
      {
        action: 'unblock',
        userID: userHeader.userID,
      },
      {
        onSuccess: () => {
          setBlocks(blocks.filter(m => m.userID !== userHeader.userID));
        },
      },
    );
  };

  const handleBlockUser = (userHeader: UserHeader) => {
    userBlockMutation.mutate(
      {
        action: 'block',
        userID: userHeader.userID,
      },
      {
        onSuccess: () => {
          setBlocks(blocks.concat(userHeader));
        },
      },
    );
  };

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        refreshControl={
          <RefreshControl refreshing={isRefetching || userBlockMutation.isLoading} onRefresh={refetch} />
        }>
        <PaddedContentView>
          <UserBlockText />
          {hasModerator && <ModeratorBlockText />}
        </PaddedContentView>
        <PaddedContentView>
          <UserSearchBar userHeaders={blocks} onPress={handleBlockUser} />
        </PaddedContentView>
        <PaddedContentView>
          <Text variant={'labelMedium'}>Blocked Users:</Text>
          {blocks.length === 0 && <ItalicText>You have not blocked any users.</ItalicText>}
          {blocks.map((relatedUserHeader, i) => (
            <UserListItem
              key={i}
              userHeader={relatedUserHeader}
              buttonIcon={AppIcons.unblock}
              onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {
                userID: relatedUserHeader.userID,
              })}
              buttonOnPress={handleUnblockUser}
            />
          ))}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
