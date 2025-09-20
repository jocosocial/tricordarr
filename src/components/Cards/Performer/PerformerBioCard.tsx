import {Card} from 'react-native-paper';
import React from 'react';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {StyleSheet} from 'react-native';
import {ContentText} from '#src/Components/Text/ContentText';

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
      <Card.Content>
        <ContentText text={props.bio} forceMarkdown={true} />
      </Card.Content>
    </Card>
  );
};
