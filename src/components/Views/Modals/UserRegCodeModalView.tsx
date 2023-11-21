import React from 'react';
import {Linking, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ModalCard} from '../../Cards/ModalCard';
import {useRegCodeForUserQuery} from '../../Queries/Admin/RegCodeQueries';
import {UserChip} from '../../Chips/UserChip';
import {useModal} from '../../Context/Contexts/ModalContext';

interface UserRegCodeModalViewProps {
  userID: string;
}

export const UserRegCodeModalView = ({userID}: UserRegCodeModalViewProps) => {
  const {commonStyles} = useStyles();
  const {data} = useRegCodeForUserQuery({userID: userID});
  const {setModalVisible} = useModal();

  const handleUserPress = (pressedUserID: string) => {
    setModalVisible(false);
    Linking.openURL(`tricordarr://user/${pressedUserID}`);
  };

  return (
    <View>
      <ModalCard title={'Registration Information'}>
        <Text>Code</Text>
        {data && <Text style={[commonStyles.marginBottomSmall]}>{data.regCode.toUpperCase()}</Text>}
        <Text style={[commonStyles.marginBottomSmall]}>Related Accounts</Text>
        {data &&
          data.users.map(user => {
            return <UserChip key={user.userID} userHeader={user} onPress={() => handleUserPress(user.userID)} />;
          })}
      </ModalCard>
    </View>
  );
};
