import React, {ReactNode} from 'react';
import {Menu} from 'react-native-paper';

import {MenuContextBridge, useMenuContextBridge} from '#src/Components/Menus/MenuContextBridge';
import {PrivilegedMenuGroup} from '#src/Components/Menus/PrivilegedMenuGroup';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {useClipboard} from '#src/Hooks/useClipboard';
import {useMenuBottomInset} from '#src/Hooks/useMenuBottomInset';
import {pushModerateResource} from '#src/Libraries/ModerationNavigation';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {FezData, FezPostData} from '#src/Structs/ControllerStructs';

interface FezPostActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
  fezPost: FezPostData;
  fez?: FezData;
}

/**
 * Overflow actions for a fez post. `fez` is optional; Report is hidden when it is omitted.
 */
export const FezPostActionsMenu = ({visible, closeMenu, anchor, fezPost, fez}: FezPostActionsMenuProps) => {
  const {setString} = useClipboard();
  const bridged = useMenuContextBridge();
  const bottomInset = useMenuBottomInset();
  const commonNavigation = useCommonStack();
  const {hasModerator} = usePrivilege();

  const handleReport = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.reportScreen, {
      contentType: ReportContentType.fezPost,
      contentID: fezPost.postID,
    });
  };

  return (
    <Menu bottomInset={bottomInset} visible={visible} onDismiss={closeMenu} anchor={anchor}>
      <MenuContextBridge bridged={bridged}>
        <Menu.Item
          dense={false}
          leadingIcon={AppIcons.copy}
          title={'Copy'}
          onPress={() => {
            setString(fezPost.text);
            closeMenu();
          }}
        />
        {fez && fez.fezType !== FezType.closed && (
          <Menu.Item dense={false} leadingIcon={AppIcons.report} title={'Report'} onPress={handleReport} />
        )}
        <PrivilegedMenuGroup trailingDivider={false}>
          {hasModerator && (
            <Menu.Item
              dense={false}
              leadingIcon={AppIcons.moderator}
              title={'Moderate'}
              onPress={() => {
                closeMenu();
                pushModerateResource(commonNavigation, 'fezpost', fezPost.postID.toString());
              }}
            />
          )}
        </PrivilegedMenuGroup>
      </MenuContextBridge>
    </Menu>
  );
};
