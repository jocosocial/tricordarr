import {Card, Text} from 'react-native-paper';
import {Image, ImageSourcePropType, StyleSheet, View} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';

interface ContributorCardProps {
  imageSource: ImageSourcePropType;
  bodyText: string;
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
        <Image style={styles.image} source={props.imageSource} />
        <View style={styles.body}>
          <Text>{props.bodyText}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};
