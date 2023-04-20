import React, {useState} from 'react';
import {AppView} from '../../Views/AppView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {View} from 'react-native';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {UserChip} from '../../Chips/UserChip';

// Chips: https://github.com/callstack/react-native-paper/issues/801
export const SeamailCreateScreen = () => {
  const {profilePublicData} = useUserData();
  const [participants, setParticipants] = useState<UserHeader[]>([profilePublicData.header]);
  const {commonStyles} = useStyles();

  const removeParticipant = (user: UserHeader) => {
    const userID = user.userID;
    if (userID === profilePublicData.header.userID) {
      return;
    }
    setParticipants(participants.filter(item => item.userID !== userID));
  };

  const styles = {
    chipView: [commonStyles.flexRow, commonStyles.flexStart, commonStyles.flexWrap],
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <UserSearchBar participants={participants} setParticipants={setParticipants} />
        </PaddedContentView>
        <PaddedContentView>
          <View style={styles.chipView}>
            {participants.flatMap((user: UserHeader) => (
              <UserChip
                key={user.userID}
                userHeader={user}
                onClose={() => removeParticipant(user)}
                disabled={user.userID === profilePublicData.header.userID}
              />
            ))}
          </View>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
