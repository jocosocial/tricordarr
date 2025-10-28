import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {AppImage} from '#src/Components/Images/AppImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {APIImageV2Data} from '#src/Types';

interface ContributorCardProps {
  bodyText: string;
  image: APIImageV2Data;
}

export const ContributorCard = (props: ContributorCardProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    cardContent: {
      ...commonStyles.flexRow,
    },
    image: {
      width: 100,
      height: 100,
      ...commonStyles.marginRight,
      ...commonStyles.roundedBorder,
    },
    body: {
      ...commonStyles.flex,
      ...commonStyles.flexColumn,
    },
    card: {
      ...commonStyles.marginBottomSmall,
    },
  });

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <AppImage image={props.image} style={styles.image} />
        <View style={styles.body}>
          <Text>{props.bodyText}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};
