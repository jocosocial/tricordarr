import * as React from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {Dispatch, SetStateAction, useState} from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {DeckData, ShipDecks} from '../../libraries/Ship';

interface DeckMapMenuProps {
  shipDeck: DeckData;
  setShipDeck: Dispatch<SetStateAction<DeckData>>;
}

export const DeckMapMenu = (props: DeckMapMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {commonStyles} = useStyles();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const onPress = (value: DeckData) => {
    closeMenu();
    props.setShipDeck(value);
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.decks} onPress={openMenu} />}>
      {ShipDecks.map(deck => {
        return (
          <Menu.Item
            key={deck.number}
            title={`Deck ${deck.number} - ${deck.label}`}
            onPress={() => onPress(deck)}
            style={props.shipDeck.number === deck.number ? commonStyles.surfaceVariant : undefined}
            titleStyle={props.shipDeck.number === deck.number ? commonStyles.bold : undefined}
          />
        );
      })}
    </Menu>
  );
};
