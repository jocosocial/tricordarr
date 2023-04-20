import React, {useState} from 'react';
import {AppView} from '../../Views/AppView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {UserSearchBar} from '../../Search/UserSearchBar';
import {Switch, View} from 'react-native';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {UserChip} from '../../Chips/UserChip';
import {Chip, Text, TextInput} from 'react-native-paper';
import {FezPostForm} from '../../Forms/FezPostForm';
import {BooleanInput} from '../../Forms/BooleanInput';
import {AppIcons} from '../../../libraries/Enums/Icons';

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
    chipView: [commonStyles.flexRow, commonStyles.flexStart, commonStyles.flexWrap, commonStyles.paddingTopSmall],
  };

  const TestChips = () => {
    return (
      <View style={styles.chipView}>
        <Chip>Thing 1</Chip>
        <Chip>Thing 2</Chip>
      </View>
    );
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <UserSearchBar participants={participants} setParticipants={setParticipants} />
        </PaddedContentView>
        <PaddedContentView>
          <Text>Participants</Text>
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
          <Text>Subject</Text>
          <TextInput mode={'outlined'} />
          {/*<Text variant={'labelLarge'}>Options</Text>*/}
          <BooleanInput label={'Open Chat'} value={false} onPress={() => console.log('wwaa')} helperText={'Allows you to add or remove users later.'} />
          <BooleanInput label={'Post as Moderator'} value={false} onPress={() => console.log('wwaa')} icon={AppIcons.moderator} />
          <BooleanInput label={'Post as TwitarrTeam'} value={false} onPress={() => console.log('wwaa')} icon={AppIcons.twitarteam} />
        </PaddedContentView>
      </ScrollingContentView>
      <FezPostForm onSubmit={() => console.log('lolz')} />
    </AppView>
  );
};
