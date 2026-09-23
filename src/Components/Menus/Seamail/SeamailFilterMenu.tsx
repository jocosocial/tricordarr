import React from 'react';
import {Divider} from 'react-native-paper';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FilterMenuAnchor} from '#src/Components/Menus/FilterMenuAnchor';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {useSeamailFilter} from '#src/Context/Contexts/SeamailFilterContext';
import {FezChatCategory, FezType} from '#src/Enums/FezType';
import {useMenu} from '#src/Hooks/useMenu';

export const SeamailFilterMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {
    seamailChatCategories,
    setSeamailChatCategories,
    seamailOnlyNew,
    setSeamailOnlyNew,
    seamailFavorite,
    setSeamailFavorite,
    allowedChatCategories,
  } = useSeamailFilter();

  const handleUnreadOnly = () => {
    setSeamailOnlyNew(prev => (prev === true ? undefined : true));
  };

  const handleFavoriteOnly = () => {
    setSeamailFavorite(prev => (prev === true ? undefined : true));
  };

  const handleCategoryToggle = (category: FezChatCategory) => {
    if (!allowedChatCategories.includes(category)) {
      return;
    }
    setSeamailChatCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  };

  const clearFilters = () => {
    setSeamailChatCategories([]);
    setSeamailOnlyNew(undefined);
    setSeamailFavorite(undefined);
  };

  const anyActiveFilter = seamailChatCategories.length > 0 || seamailOnlyNew === true || seamailFavorite === true;

  const menuAnchor = <FilterMenuAnchor active={anyActiveFilter} onPress={openMenu} onLongPress={clearFilters} />;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <SelectableMenuItem title={'Favorites'} onPress={handleFavoriteOnly} selected={seamailFavorite} />
      <SelectableMenuItem title={'Unread'} onPress={handleUnreadOnly} selected={seamailOnlyNew} />
      <Divider bold={true} />
      {FezType.chatCategories.map(category => (
        <SelectableMenuItem
          key={category}
          title={FezType.getChatCategoryLabel(category)}
          selected={seamailChatCategories.includes(category)}
          onPress={() => handleCategoryToggle(category)}
          disabled={!allowedChatCategories.includes(category)}
        />
      ))}
    </AppMenu>
  );
};
