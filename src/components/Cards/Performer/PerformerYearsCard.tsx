import {Card, Chip} from 'react-native-paper';
import React from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {StyleSheet} from 'react-native';

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
