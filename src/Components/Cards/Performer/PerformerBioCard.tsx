import React from 'react';
import {StyleSheet} from 'react-native';
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
        <ContentText text={props.bio} forceMarkdown={true} />
      </Card.Content>
    </Card>
  );
};
