import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Card} from 'react-native-paper';

import {ContentText} from '#src/Components/Text/ContentText';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface PerformerBioCardProps {
  bio: string;
}

export const PerformerBioCard = (props: PerformerBioCardProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    bioCard: {
      ...commonStyles.flex,
    },
  });

  return (
    <Card style={styles.bioCard}>
      <Card.Content>
        <TouchableOpacity onLongPress={() => Clipboard.setString(props.bio)}>
          <ContentText text={props.bio} forceMarkdown={true} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
};
