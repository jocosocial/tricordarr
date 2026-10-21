import React from 'react';
import {Divider} from 'react-native-paper';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FilterMenuAnchor} from '#src/Components/Menus/FilterMenuAnchor';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {useLfgFilter} from '#src/Context/Contexts/LfgFilterContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {getBadgeDisplayValue} from '#src/Libraries/StringUtils';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {LfgListSource} from '#src/Types';

interface LfgFilterMenuProps {
  showTypes?: boolean;
}

/**
 * Filter menu for the unified LFG list. The Find/Joined/Owned source is a single-select group at
 * the top; everything below it refines whichever source is selected (AND, not OR). Favorites and
 * Unread require a FezParticipant pivot, which only exists once you've joined, so both are
 * disabled on Find.
 */
export const LfgFilterMenu = ({showTypes = true}: LfgFilterMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {
    lfgSourceFilter,
    setLfgSourceFilter,
    lfgTypeFilter,
    setLfgTypeFilter,
    lfgHidePastFilter,
    setLfgHidePastFilter,
    lfgOnlyNew,
    setLfgOnlyNew,
    lfgFavoriteFilter,
    setLfgFavoriteFilter,
    clearLfgFilters,
    anyLfgFilterActive,
  } = useLfgFilter();
  const {data: userNotificationData} = useUserNotificationDataQuery({enabled: false});

  const supportsMemberFilters = lfgSourceFilter !== 'open';
  const joinedBadge = getBadgeDisplayValue(userNotificationData?.newFezMessageCount);
  const joinedLabel = joinedBadge ? `Joined (${joinedBadge})` : 'Joined';

  const handleSourceSelection = (newSource: LfgListSource) => {
    if (newSource !== lfgSourceFilter) {
      setLfgSourceFilter(newSource);
    }
    closeMenu();
  };

  const handleUnreadOnly = () => {
    setLfgOnlyNew(prev => (prev === true ? undefined : true));
    closeMenu();
  };

  const handleFavoriteOnly = () => {
    setLfgFavoriteFilter(prev => (prev === true ? undefined : true));
    closeMenu();
  };

  const handleHidePast = () => {
    setLfgHidePastFilter(!lfgHidePastFilter);
    closeMenu();
  };

  const handleFilterSelection = (newValue: FezType) => {
    if (newValue === lfgTypeFilter) {
      setLfgTypeFilter(undefined);
    } else {
      setLfgTypeFilter(newValue);
    }
    closeMenu();
  };

  const menuAnchor = <FilterMenuAnchor active={anyLfgFilterActive} onPress={openMenu} onLongPress={clearLfgFilters} />;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <SelectableMenuItem
        leadingIcon={AppIcons.lfgFind}
        title={'Find'}
        selected={lfgSourceFilter === 'open'}
        onPress={() => handleSourceSelection('open')}
      />
      <SelectableMenuItem
        leadingIcon={AppIcons.lfgJoined}
        title={joinedLabel}
        selected={lfgSourceFilter === 'joined'}
        onPress={() => handleSourceSelection('joined')}
      />
      <SelectableMenuItem
        leadingIcon={AppIcons.lfgOwned}
        title={'Owned'}
        selected={lfgSourceFilter === 'owner'}
        onPress={() => handleSourceSelection('owner')}
      />
      <Divider bold={true} />
      <SelectableMenuItem
        title={'Favorites'}
        onPress={handleFavoriteOnly}
        selected={lfgFavoriteFilter}
        disabled={!supportsMemberFilters}
      />
      <SelectableMenuItem
        title={'Unread'}
        onPress={handleUnreadOnly}
        selected={lfgOnlyNew}
        disabled={!supportsMemberFilters}
      />
      <SelectableMenuItem title={'Hide Past'} onPress={handleHidePast} selected={lfgHidePastFilter} />
      {showTypes && (
        <>
          <Divider bold={true} />
          {FezType.lfgTypes.map(fezType => {
            return (
              <SelectableMenuItem
                key={fezType}
                selected={lfgTypeFilter === fezType}
                title={FezType.getLabel(fezType)}
                onPress={() => handleFilterSelection(fezType)}
              />
            );
          })}
        </>
      )}
    </AppMenu>
  );
};
