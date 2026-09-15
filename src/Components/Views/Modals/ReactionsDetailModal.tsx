import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, Dialog, Portal} from 'react-native-paper';

import {ReactionIcon} from '#src/Components/Reactions/ReactionIcon';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ReactionData} from '#src/Structs/ControllerStructs';

interface ReactionsDetailModalProps {
  reactions: ReactionData[];
  visible: boolean;
  onDismiss: () => void;
}

const ReactionsDetailModalContent = ({reactions}: Pick<ReactionsDetailModalProps, 'reactions'>) => {
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: {
          ...commonStyles.marginBottom,
        },
        header: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.marginBottomSmall,
        },
        user: {
          ...commonStyles.marginBottomSmall,
        },
      }),
    [commonStyles],
  );

  return (
    <ScrollView>
      {reactions.map(reaction => (
        <View key={reaction.reaction} style={styles.section}>
          <View style={styles.header}>
            <ReactionIcon reaction={reaction.reaction} size={26} />
          </View>
          {reaction.users.map(user => (
            <UserBylineTag key={`${reaction.reaction}-${user.userID}`} user={user} style={styles.user} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

/** Displays the users grouped under each reaction on a post. */
export const ReactionsDetailModal = ({reactions, visible, onDismiss}: ReactionsDetailModalProps) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Reactions</Dialog.Title>
        <Dialog.ScrollArea>
          <ReactionsDetailModalContent reactions={reactions} />
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
