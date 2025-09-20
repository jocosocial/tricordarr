import {Card, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import React from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {ImageQueryData} from '#src/Libraries/Types/index.ts';
import {AppImage} from '#src/Components/Images/AppImage.tsx';

interface ContributorCardProps {
  bodyText: string;
  image: ImageQueryData;
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
