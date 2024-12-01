import {Card, Text} from 'react-native-paper';
import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {StyleSheet} from 'react-native';

interface PerformerBioCardProps {
  bio?: string;
}

export const PerformerBioCard = (props: PerformerBioCardProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    bioCard: {
      ...commonStyles.flex,
    },
  });

  if (!props.bio) {
    return <></>;
  }

  return (
    <Card style={styles.bioCard}>
      <Card.Title title={'Bio'} />
      <Card.Content>
        <Text selectable={true}>{props.bio}</Text>
      </Card.Content>
    </Card>
  );
};
