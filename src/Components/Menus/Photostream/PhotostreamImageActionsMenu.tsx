import React, {ReactNode} from 'react';
import {Menu} from 'react-native-paper';

import {ModerateMenuItem} from '#src/Components/Menus/Items/ModerateMenuItem';
import {MenuContextBridge, useMenuContextBridge} from '#src/Components/Menus/MenuContextBridge';
import {PrivilegedMenuGroup} from '#src/Components/Menus/PrivilegedMenuGroup';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {useMenuBottomInset} from '#src/Hooks/useMenuBottomInset';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {PhotostreamImageData} from '#src/Structs/ControllerStructs';

interface PhotostreamImageActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
  image: PhotostreamImageData;
}

/**
 * Actions menu for a photostream image, anchored on the element passed in as `anchor`.
 */
export const PhotostreamImageActionsMenu = ({visible, closeMenu, anchor, image}: PhotostreamImageActionsMenuProps) => {
  const {hasModerator} = usePrivilege();
  const bridged = useMenuContextBridge();
  const bottomInset = useMenuBottomInset();
  const commonNavigation = useCommonStack();

  const handleReport = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.reportScreen, {
      contentType: ReportContentType.photostreamImage,
      contentID: image.postID,
    });
  };

  return (
    <Menu bottomInset={bottomInset} visible={visible} onDismiss={closeMenu} anchor={anchor}>
      <MenuContextBridge bridged={bridged}>
        <Menu.Item dense={false} leadingIcon={AppIcons.report} title={'Report'} onPress={handleReport} />
        <PrivilegedMenuGroup trailingDivider={false}>
          {hasModerator && (
            <ModerateMenuItem closeMenu={closeMenu} resourceID={image.postID.toString()} resource={'photostream'} />
          )}
        </PrivilegedMenuGroup>
      </MenuContextBridge>
    </Menu>
  );
};
