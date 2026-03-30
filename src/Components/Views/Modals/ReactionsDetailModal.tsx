import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {ModalCard} from '#src/Components/Cards/ModalCard';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ReactionData} from '#src/Structs/ControllerStructs';

interface ReactionsDetailModalProps {
  reactions: ReactionData[];
}

const ReactionsDetailModalContent = ({reactions}: ReactionsDetailModalProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    section: {
      ...commonStyles.marginBottom,
    },
    header: {
      ...commonStyles.bold,
      ...commonStyles.marginBottomSmall,
    },
    user: {
      ...commonStyles.marginBottomSmall,
    },
  });

  return (
    <ScrollView>
      {reactions.map(reaction => (
        <View key={reaction.emoji} style={styles.section}>
          <Text style={styles.header}>{reaction.emoji}</Text>
          {reaction.users.map(user => (
            <UserBylineTag key={`${reaction.emoji}-${user.userID}`} user={user} style={styles.user} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

export const ReactionsDetailModal = ({reactions}: ReactionsDetailModalProps) => {
  return (
    <View>
      <ModalCard
        title={'Reactions'}
        closeButtonText={'Close'}
        content={<ReactionsDetailModalContent reactions={reactions} />}
      />
    </View>
  );
};
