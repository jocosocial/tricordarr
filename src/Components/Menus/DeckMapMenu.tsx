import * as React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {ShipDeck} from '#src/Structs/ShipStructs';

interface DeckMapMenuProps {
  decks: ShipDeck[];
  currentDeckNumber: number;
  onSelect: (deck: ShipDeck) => void;
}

export const DeckMapMenu = ({decks, currentDeckNumber, onSelect}: DeckMapMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();

  const onPress = (deck: ShipDeck) => {
    closeMenu();
    onSelect(deck);
  };

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Decks'} iconName={AppIcons.decks} onPress={openMenu} />}>
      {decks.map(deck => {
        return (
          <SelectableMenuItem
            key={deck.number}
            title={`Deck ${deck.number}${deck.name ? ` - ${deck.name}` : ''}`}
            onPress={() => onPress(deck)}
            selected={currentDeckNumber === deck.number}
          />
        );
      })}
    </AppMenu>
  );
};
