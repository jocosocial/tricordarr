import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {Card, Text} from 'react-native-paper';
import React from 'react';
import {useRegCodeForUserQuery} from '../../Queries/Admin/RegCodeQueries';
import {useModal} from '../../Context/Contexts/ModalContext';
import {
  BottomTabComponents,
  MainStackComponents,
  NavigatorIDs,
  RootStackComponents,
} from '../../../libraries/Enums/Navigation';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {UserListItem} from '../../Lists/Items/UserListItem';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';

export type Props = NativeStackScreenProps<
  MainStackParamList,
  MainStackComponents.userRegCodeScreen,
  NavigatorIDs.mainStack
>;

export const UserRegCodeScreen = ({route}: Props) => {
  const {data} = useRegCodeForUserQuery({userID: route.params.userID});
  const {setModalVisible} = useModal();
  const rootNavigation = useRootStack();

  const handleUserPress = (pressedUserID: string) => {
    setModalVisible(false);
    rootNavigation.push(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.userProfileScreen,
        params: {
          userID: pressedUserID,
        },
      },
    });
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Card>
            <Card.Title title={'Code'} />
            <Card.Content>{data && <Text selectable={true}>{data.regCode.toUpperCase()}</Text>}</Card.Content>
          </Card>
        </PaddedContentView>
        <PaddedContentView>
          <Card>
            <Card.Title title={'Related Accounts'} />
            <Card.Content>
              {data &&
                data.users.map((user, index) => {
                  return <UserListItem key={index} userHeader={user} onPress={() => handleUserPress(user.userID)} />;
                })}
            </Card.Content>
          </Card>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
