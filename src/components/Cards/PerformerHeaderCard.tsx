import React, {memo} from 'react';
import {PerformerHeaderData} from '../../libraries/Structs/ControllerStructs.tsx';
import {Card, Text} from 'react-native-paper';
import {useStyles} from '../Context/Contexts/StyleContext.ts';
import {StyleSheet} from 'react-native';
import {APIImage} from '../Images/APIImage.tsx';
import {MainStackComponents, useMainStack} from '../Navigation/Stacks/MainStackNavigator.tsx';

interface PerformerHeaderCardProps {
  header: PerformerHeaderData;
}
const PerformerHeaderCardInternal = ({header}: PerformerHeaderCardProps) => {
  const {commonStyles} = useStyles();
  const navigation = useMainStack();

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
    },
  });

  const onPress = () => {
    if (header.id) {
      navigation.push(MainStackComponents.performerScreen, {
        id: header.id,
      });
    }
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.title}>{header.name}</Text>
        <APIImage
          style={styles.image}
          thumbPath={`/image/thumb/${header.photo}`}
          fullPath={`/image/full/${header.photo}`}
          mode={'image'}
          disableTouch={true}
        />
      </Card.Content>
    </Card>
  );
};

export const PerformerHeaderCard = memo(PerformerHeaderCardInternal);
