import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppImage} from '#src/Components/Images/AppImage';
import {DeckMapMenu} from '#src/Components/Menus/DeckMapMenu';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {MapIndicatorView} from '#src/Components/Views/MapIndicatorView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {ShipDecks} from '#src/Libraries/Ship';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.mapScreen>;

export const MapScreen = ({navigation, route}: Props) => {
  const {commonStyles} = useStyles();
  const [shipDeck, setShipDeck] = useState(
    ShipDecks.find(dd => dd.number === Number(route.params?.deckNumber)) || ShipDecks[0],
  );

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <DeckMapMenu shipDeck={shipDeck} setShipDeck={setShipDeck} />
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.mapHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [shipDeck, navigation]);

  const styles = StyleSheet.create({
    imageContainer: {
      ...commonStyles.paddingHorizontal,
      ...commonStyles.paddingVertical,
      ...commonStyles.flex,
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
          <AppImage
            key={shipDeck.number}
            mode={'scaledimage'}
            image={AppImageMetaData.fromAsset(shipDeck.imageSource, `deck${shipDeck.number}.png`)}
          />
        </View>
        <MapIndicatorView direction={'Aft'} />
      </ScrollingContentView>
    </AppView>
  );
};
