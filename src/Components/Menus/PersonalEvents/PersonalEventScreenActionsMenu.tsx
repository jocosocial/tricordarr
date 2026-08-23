import React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {useFezAlert} from '#src/Hooks/Fez/useFezAlert';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useScheduleStackNavigation} from '#src/Navigation/Stacks/Schedule/ScheduleStackComponents';
import {FezData} from '#src/Structs/ControllerStructs';

interface PersonalEventScreenActionsMenuProps {
  event: FezData;
}

export const PersonalEventScreenActionsMenu = (props: PersonalEventScreenActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {currentUserID} = useSession();
  const navigation = useScheduleStackNavigation();
  const {confirmCancel, confirmDelete} = useFezAlert(props.event);

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item
        title={'Overlapping'}
        leadingIcon={AppIcons.calendarMultiple}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.scheduleOverlapScreen, {eventData: props.event});
        }}
      />
      <Divider bold={true} />
      {props.event.owner.userID === currentUserID && (
        <>
          {props.event.fezType === FezType.personalEvent ? (
            <Menu.Item
              leadingIcon={AppIcons.delete}
              title={'Delete'}
              onPress={() => {
                closeMenu();
                confirmDelete();
              }}
            />
          ) : (
            <Menu.Item
              leadingIcon={AppIcons.cancel}
              title={'Cancel'}
              onPress={() => {
                closeMenu();
                confirmCancel();
              }}
              disabled={props.event.cancelled}
            />
          )}
        </>
      )}
      <Menu.Item
        leadingIcon={AppIcons.report}
        title={'Report'}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.reportScreen, {
            contentType: ReportContentType.fez,
            contentID: props.event.fezID,
          });
        }}
      />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.personalEventHelpScreen);
        }}
      />
    </AppMenu>
  );
};
