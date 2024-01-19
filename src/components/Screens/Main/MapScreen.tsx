import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {Image, StyleSheet, View} from 'react-native';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {DeckMapMenu} from '../../Menus/DeckMapMenu';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';
import {MainStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {ShipDecks} from '../../../libraries/Ship';
import {ListTitleView} from '../../Views/ListTitleView';
import {MapIndicatorView} from '../../Views/MapIndicatorView';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.mapScreen, NavigatorIDs.mainStack>;

export const MapScreen = ({navigation, route}: Props) => {
  const {commonStyles} = useStyles();
  const [shipDeck, setShipDeck] = useState(
    ShipDecks.find(dd => dd.number === route.params?.deckNumber) || ShipDecks[0],
  );

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <DeckMapMenu shipDeck={shipDeck} setShipDeck={setShipDeck} />
        </HeaderButtons>
      </View>
    );
  }, [shipDeck]);

  // https://stackoverflow.com/questions/36436913/image-contain-resizemode-not-working-in-react-native
  const asset = Image.resolveAssetSource(shipDeck.imageSource);
  const styles = StyleSheet.create({
    imageContainer: {
      ...commonStyles.paddingHorizontal,
      ...commonStyles.paddingVertical,
      ...commonStyles.flex,
    },
    image: {
      flex: 1,
      height: undefined,
      width: undefined,
      aspectRatio: asset.width / asset.height,
    },
    buttons: {
      minWidth: undefined,
    },
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListTitleView
          title={`Deck ${shipDeck.number} - ${shipDeck.label}`}
          subtitle={shipDeck.roomStart ? `Staterooms ${shipDeck.roomStart} - ${shipDeck.roomEnd}` : undefined}
        />
        <MapIndicatorView direction={'Forward'} />
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={shipDeck.imageSource} />
        </View>
        <MapIndicatorView direction={'Aft'} />
      </ScrollingContentView>
    </AppView>
  );
};
