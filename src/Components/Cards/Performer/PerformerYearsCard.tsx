import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Chip} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface PerformerYearsCardProps {
  years: number[];
}

export const PerformerYearsCard = ({years = []}: PerformerYearsCardProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    chipContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifyCenter,
      ...commonStyles.flexWrap,
      ...commonStyles.paddingTopSmall,
    },
    chip: {
      ...commonStyles.marginRightSmall,
      ...commonStyles.marginBottomSmall,
    },
    chipCard: {
      ...commonStyles.flex,
    },
    title: {
      ...commonStyles.textCenter,
      ...commonStyles.bold,
    },
  });

  if (years.length === 0) {
    return <></>;
  }

  return (
    <Card style={styles.chipCard}>
      <Card.Title title={'Years Attended'} titleStyle={styles.title} />
      <Card.Content style={styles.chipContainer}>
        {years.map((year, index) => (
          <Chip key={index} style={styles.chip}>
            {year}
          </Chip>
        ))}
      </Card.Content>
    </Card>
  );
};
