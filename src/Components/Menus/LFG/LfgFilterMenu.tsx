import React from 'react';
import {Divider} from 'react-native-paper';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FilterMenuAnchor} from '#src/Components/Menus/FilterMenuAnchor';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {useLfgFilter} from '#src/Context/Contexts/LfgFilterContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
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
 * Filter menu for the unified LFG list. The list shows all LFGs by default; Joined and Owned at the
 * top are toggles that narrow it to one source, and selecting the active one returns to all.
 * Everything below refines whichever source is selected (AND, not OR). Favorites and Unread only
 * ever match joined LFGs, so selecting either lists joined LFGs only.
 *
 * In pre-registration mode users can only list the LFGs they own (LfgFilterProvider holds them
 * on Owned), and can't favorite or read chats, so Joined and the member filters are disabled.
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
    lfgCancelledFilter,
    setLfgCancelledFilter,
    lfgOnlyNew,
    setLfgOnlyNew,
    lfgFavoriteFilter,
    setLfgFavoriteFilter,
    clearLfgFilters,
    anyLfgFilterActive,
  } = useLfgFilter();
  const {data: userNotificationData} = useUserNotificationDataQuery({enabled: false});
  const {preRegistrationMode} = usePreRegistration();

  const supportsMemberFilters = !preRegistrationMode;
  const joinedBadge = getBadgeDisplayValue(userNotificationData?.newFezMessageCount);
  const joinedLabel = joinedBadge ? `Joined (${joinedBadge})` : 'Joined';

  /** Selecting a source narrows to it; selecting the active one again returns to all LFGs. */
  const handleSourceSelection = (newSource: Exclude<LfgListSource, 'all'>) => {
    setLfgSourceFilter(newSource === lfgSourceFilter ? 'all' : newSource);
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

  const handleCancelledOnly = () => {
    setLfgCancelledFilter(!lfgCancelledFilter);
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
        leadingIcon={AppIcons.lfgJoined}
        title={joinedLabel}
        selected={lfgSourceFilter === 'joined'}
        onPress={() => handleSourceSelection('joined')}
        disabled={preRegistrationMode}
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
      <SelectableMenuItem title={'Cancelled'} onPress={handleCancelledOnly} selected={lfgCancelledFilter} />
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
