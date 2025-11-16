import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Card, Text} from 'react-native-paper';

import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useRegCodeForUserQuery} from '#src/Queries/Admin/RegCodeQueries';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.userRegCodeScreen>;

export const UserRegCodeScreen = ({route, navigation}: Props) => {
  const {data} = useRegCodeForUserQuery({userID: route.params.userID});
  const {setModalVisible} = useModal();

  const handleUserPress = (pressedUserID: string) => {
    setModalVisible(false);
    navigation.push(CommonStackComponents.userProfileScreen, {
      userID: pressedUserID,
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
