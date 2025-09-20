import {AppView} from '../../Views/AppView.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {Card, Text} from 'react-native-paper';
import React from 'react';
import {useRegCodeForUserQuery} from '../../Queries/Admin/RegCodeQueries.ts';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {UserListItem} from '../../Lists/Items/UserListItem.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.userRegCodeScreen>;

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
