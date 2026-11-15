import React from 'react';
import {Menu} from 'react-native-paper';

import {EventCardActionsMenuItems} from '#src/Components/Menus/Events/EventCardActionsMenu';
import {FezCardActionsMenuItems} from '#src/Components/Menus/Fez/FezCardActionsMenu';
import {MenuContextBridge, useMenuContextBridge} from '#src/Components/Menus/MenuContextBridge';
import {PersonalEventCardActionsMenuItems} from '#src/Components/Menus/PersonalEvents/PersonalEventCardActionsMenu';
import {DayPlannerItem} from '#src/Types/DayPlanner';

/** The planner item being acted on and the window coordinates of the long press that opened the menu. */
export interface DayPlannerMenuTarget {
  item: DayPlannerItem;
  x: number;
  y: number;
}

interface DayPlannerCardActionsMenuProps {
  /** Null when no item has been long-pressed yet. */
  target: DayPlannerMenuTarget | null;
  visible: boolean;
  closeMenu: () => void;
}

interface DayPlannerCardActionsMenuItemsProps {
  item: DayPlannerItem;
  closeMenu: () => void;
}

/**
 * Picks the day-list menu items matching the planner item's type.
 */
const DayPlannerCardActionsMenuItems = ({item, closeMenu}: DayPlannerCardActionsMenuItemsProps) => {
  if (item.eventData) {
    return <EventCardActionsMenuItems eventData={item.eventData} closeMenu={closeMenu} />;
  }
  if (item.fezData && item.type === 'lfg') {
    return <FezCardActionsMenuItems fezData={item.fezData} closeMenu={closeMenu} />;
  }
  if (item.fezData) {
    return <PersonalEventCardActionsMenuItems eventData={item.fezData} closeMenu={closeMenu} />;
  }
  return null;
};

/**
 * Long-press actions menu for Day Planner cards. One instance serves every card on a page.
 *
 * Unlike the list card menus this does NOT wrap the card as its anchor: Paper's Menu renders an
 * element anchor inside a plain View, which collapses an absolutely positioned planner card
 * (percentage widths resolve against the zero-size wrapper) and measures the anchor as 0x0, so
 * the menu lands in the wrong place. Instead the menu is anchored at the long-press coordinates,
 * which Paper supports natively.
 */
export const DayPlannerCardActionsMenu = ({target, visible, closeMenu}: DayPlannerCardActionsMenuProps) => {
  const bridged = useMenuContextBridge();
  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={{x: target?.x ?? 0, y: target?.y ?? 0}}>
      <MenuContextBridge bridged={bridged}>
        {target && <DayPlannerCardActionsMenuItems item={target.item} closeMenu={closeMenu} />}
      </MenuContextBridge>
    </Menu>
  );
};
