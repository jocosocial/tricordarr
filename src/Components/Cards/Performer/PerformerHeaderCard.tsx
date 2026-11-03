import React, {memo} from 'react';
import {StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {APIImage} from '#src/Components/Images/APIImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {PerformerHeaderData} from '#src/Structs/ControllerStructs';

interface PerformerHeaderCardProps {
  header: PerformerHeaderData;
  /** Called with this card's header when tapped. Should be a stable reference (the card is memoized). */
  onPress: (header: PerformerHeaderData) => void;
}

/**
 * Name and photo card for a performer. What a tap does is up to the caller.
 */
const PerformerHeaderCardInternal = ({header, onPress}: PerformerHeaderCardProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    cardContent: {
      ...commonStyles.flexColumn,
      ...commonStyles.alignItemsCenter,
      ...commonStyles.justifyCenter,
    },
    image: {
      width: 120,
      height: 120,
      ...commonStyles.roundedBorder,
    },
    body: {
      ...commonStyles.flex,
      ...commonStyles.flexColumn,
    },
    card: {},
    title: {
      ...commonStyles.bold,
      ...commonStyles.paddingBottomSmall,
      textAlign: 'center',
      alignSelf: 'stretch',
    },
  });

  return (
    <Card style={styles.card} onPress={() => onPress(header)}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.title}>{header.name}</Text>
        {header.photo && (
          <APIImage style={styles.image} path={header.photo} mode={'image'} disableTouch={true} staticSize={'thumb'} />
        )}
      </Card.Content>
    </Card>
  );
};

export const PerformerHeaderCard = memo(PerformerHeaderCardInternal);
