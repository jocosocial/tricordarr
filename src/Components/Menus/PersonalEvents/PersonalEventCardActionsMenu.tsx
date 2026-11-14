import React, {Dispatch, SetStateAction} from 'react';
import {Divider, Menu} from 'react-native-paper';

import {MenuContextBridge, useMenuContextBridge} from '#src/Components/Menus/MenuContextBridge';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {useFezAlert} from '#src/Hooks/Fez/useFezAlert';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {FezData} from '#src/Structs/ControllerStructs';

interface PersonalEventCardActionsMenuItemsProps {
  eventData: FezData;
  closeMenu: () => void;
}

/**
 * The items of a personal/private event's long-press actions menu, without the surrounding Menu.
 * Shared by PersonalEventCardActionsMenu (list cards, anchored on the card) and
 * DayPlannerCardActionsMenu (planner cards, anchored at the touch point) so both offer the same actions.
 * Must render inside a MenuContextBridge.
 */
export const PersonalEventCardActionsMenuItems = ({eventData, closeMenu}: PersonalEventCardActionsMenuItemsProps) => {
  const {currentUserID} = useSession();
  const navigation = useCommonStack();
  const {confirmDelete} = useFezAlert(eventData);
  const {preRegistrationMode} = usePreRegistration();

  return (
    <>
      <Menu.Item
        leadingIcon={AppIcons.calendarMultiple}
        title={'Overlapping'}
        onPress={() => navigation.push(CommonStackComponents.scheduleOverlapScreen, {eventData: eventData})}
      />
      {eventData.owner.userID === currentUserID && (
        <>
          <Menu.Item
            leadingIcon={AppIcons.edit}
            title={'Edit'}
            onPress={() =>
              navigation.push(CommonStackComponents.personalEventEditScreen, {
                personalEvent: eventData,
              })
            }
          />
          <Menu.Item
            leadingIcon={AppIcons.delete}
            title={'Delete'}
            onPress={() => {
              closeMenu();
              confirmDelete(false);
            }}
          />
          <Divider bold={true} />
        </>
      )}
      {/* Reporting isn't available to pre-registration users. */}
      {!preRegistrationMode && (
        <Menu.Item
          leadingIcon={AppIcons.report}
          title={'Report'}
          onPress={() =>
            navigation.push(CommonStackComponents.reportScreen, {
              contentType: ReportContentType.fez,
              contentID: eventData.fezID,
            })
          }
        />
      )}
    </>
  );
};

interface PersonalEventCardActionsMenuProps {
  anchor: React.JSX.Element;
  eventData: FezData;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

/**
 * Long-press actions menu for a personal/private event list card. The anchor card gets an
 * `onLongPress` injected that opens the menu.
 */
export const PersonalEventCardActionsMenu = (props: PersonalEventCardActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const bridged = useMenuContextBridge();

  const anchorWithMenu = React.cloneElement(props.anchor, {
    onLongPress: openMenu,
  });

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={anchorWithMenu}>
      <MenuContextBridge bridged={bridged}>
        <PersonalEventCardActionsMenuItems eventData={props.eventData} closeMenu={closeMenu} />
      </MenuContextBridge>
    </Menu>
  );
};
