import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AppIcons} from '#src/Enums/Icons';
import {Text} from 'react-native-paper';
import React from 'react';
import {PhotostreamImageData} from '#src/Structs/ControllerStructs';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useMainStack} from '#src/Navigation/Stacks/MainStackNavigator';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {guessDeckNumber} from '#src/Libraries/Ship';

interface PhotostreamImageBodyViewProps {
  image: PhotostreamImageData;
}

export const PhotostreamImageBodyView = (props: PhotostreamImageBodyViewProps) => {
  const {commonStyles} = useStyles();
  const navigation = useMainStack();

  const onEventPress = () => {
    if (props.image.event) {
      navigation.push(CommonStackComponents.eventScreen, {
        eventID: props.image.event.eventID,
      });
    }
  };

  const onLocationPress = () => {
    const deck = guessDeckNumber(props.image.location);
    navigation.push(CommonStackComponents.mapScreen, {
      deckNumber: deck,
    });
  };

  const styles = StyleSheet.create({
    viewContainer: {
      ...commonStyles.paddingVerticalSmall,
      ...commonStyles.paddingHorizontalSmall,
    },
    rowContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
    },
    icon: {
      ...commonStyles.marginRightSmall,
    },
  });

  return (
    <View style={styles.viewContainer}>
      {props.image.location && (
        <TouchableOpacity onPress={onLocationPress}>
          <View style={styles.rowContainer}>
            <AppIcon icon={AppIcons.map} style={styles.icon} />
            <Text variant={'bodyMedium'}>{props.image.location}</Text>
          </View>
        </TouchableOpacity>
      )}
      {props.image.event && (
        <TouchableOpacity onPress={onEventPress}>
          <View style={styles.rowContainer}>
            <AppIcon icon={AppIcons.events} style={styles.icon} />
            <Text variant={'bodyMedium'}>{props.image.event.title}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};
