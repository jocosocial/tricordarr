import React, {memo} from 'react';
import {StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {APIImageV2} from '#src/Components/Images/APIImageV2';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useMainStack} from '#src/Navigation/Stacks/MainStackNavigator';
import {PerformerHeaderData} from '#src/Structs/ControllerStructs';

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
      navigation.push(CommonStackComponents.performerScreen, {
        id: header.id,
      });
    }
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.title}>{header.name}</Text>
        {header.photo && (
          <APIImageV2
            style={styles.image}
            path={header.photo}
            mode={'image'}
            disableTouch={true}
            initialSize={'thumb'}
          />
        )}
      </Card.Content>
    </Card>
  );
};

export const PerformerHeaderCard = memo(PerformerHeaderCardInternal);
