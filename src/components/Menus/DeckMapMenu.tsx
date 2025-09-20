import * as React from 'react';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {Item} from 'react-navigation-header-buttons';
import {Dispatch, SetStateAction, useState} from 'react';
import {DeckData, ShipDecks} from '#src/Libraries/Ship.ts';
import {SelectableMenuItem} from './Items/SelectableMenuItem.tsx';
import {AppHeaderMenu} from './AppHeaderMenu.tsx';

interface DeckMapMenuProps {
  shipDeck: DeckData;
  setShipDeck: Dispatch<SetStateAction<DeckData>>;
}

export const DeckMapMenu = (props: DeckMapMenuProps) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const onPress = (value: DeckData) => {
    closeMenu();
    props.setShipDeck(value);
  };

  return (
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.decks} onPress={openMenu} />}>
      {ShipDecks.map(deck => {
        return (
          <SelectableMenuItem
            key={deck.number}
            title={`Deck ${deck.number} - ${deck.label}`}
            onPress={() => onPress(deck)}
            selected={props.shipDeck.number === deck.number}
          />
        );
      })}
    </AppHeaderMenu>
  );
};
