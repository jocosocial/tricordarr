import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {encode as base64_encode} from 'base-64';
import React, {useCallback, useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Menu} from 'react-native-paper';
import {HeaderButtons} from 'react-navigation-header-buttons';

import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppImage} from '#src/Components/Images/AppImage';
import {DeckMapMenu} from '#src/Components/Menus/DeckMapMenu';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {MapIndicatorView} from '#src/Components/Views/MapIndicatorView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/MenuHook';
import {ShipDecks} from '#src/Libraries/Ship';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.mapScreen>;

export const MapScreen = ({navigation, route}: Props) => {
  const {commonStyles} = useStyles();
  const [shipDeck, setShipDeck] = useState(
    ShipDecks.find(dd => dd.number === Number(route.params?.deckNumber)) || ShipDecks[0],
  );
  const {visible, openMenu, closeMenu} = useMenu();

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
          <AppImage
            mode={'scaledimage'}
            image={{
              dataURI: Image.resolveAssetSource(shipDeck.imageSource).uri,
              mimeType: 'image/png',
              fileName: `deck${shipDeck.number}.png`,
              base64: base64_encode(shipDeck.imageSource as string),
            }}
            style={styles.image}
          />
        </View>
        <MapIndicatorView direction={'Aft'} />
        <PaddedContentView padBottom={false} padTop={true}>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={<PrimaryActionButton buttonText={'Change Deck'} onPress={openMenu} icon={AppIcons.decks} />}>
            {ShipDecks.map(deck => {
              return (
                <SelectableMenuItem
                  key={deck.number}
                  title={`Deck ${deck.number} - ${deck.label}`}
                  onPress={() => {
                    closeMenu();
                    setShipDeck(deck);
                  }}
                  selected={shipDeck.number === deck.number}
                />
              );
            })}
          </Menu>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
