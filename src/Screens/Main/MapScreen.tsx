import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '#src/Views/AppView.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {useStyles} from '#src/Context/Contexts/StyleContext.ts';
import {Image, StyleSheet, View} from 'react-native';
import {MaterialHeaderButton} from '#src/Buttons/MaterialHeaderButton.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {DeckMapMenu} from '#src/Menus/DeckMapMenu.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ShipDecks} from '../../../Libraries/Ship.ts';
import {ListTitleView} from '#src/Views/ListTitleView.tsx';
import {MapIndicatorView} from '#src/Views/MapIndicatorView.tsx';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens.tsx';
import {encode as base64_encode} from 'base-64';
import {AppImage} from '#src/Images/AppImage.tsx';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {PrimaryActionButton} from '#src/Buttons/PrimaryActionButton.tsx';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {SelectableMenuItem} from '#src/Menus/Items/SelectableMenuItem.tsx';
import {Menu} from 'react-native-paper';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.mapScreen>;

export const MapScreen = ({navigation, route}: Props) => {
  const {commonStyles} = useStyles();
  const [shipDeck, setShipDeck] = useState(
    ShipDecks.find(dd => dd.number === Number(route.params?.deckNumber)) || ShipDecks[0],
  );
  const [visible, setVisible] = useState<boolean>(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

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
