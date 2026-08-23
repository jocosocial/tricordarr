import React, {ReactNode} from 'react';
import {Divider, Menu} from 'react-native-paper';

import {ModerateMenuItem} from '#src/Components/Menus/Items/ModerateMenuItem';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {PhotostreamImageData} from '#src/Structs/ControllerStructs';

interface PhotostreamImageActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
  image: PhotostreamImageData;
}

export const PhotostreamImageActionsMenu = ({visible, closeMenu, anchor, image}: PhotostreamImageActionsMenuProps) => {
  const {hasModerator} = usePrivilege();
  const commonNavigation = useCommonStack();

  const handleReport = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.reportScreen, {
      contentType: ReportContentType.photostreamImage,
      contentID: image.postID,
    });
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
      <Menu.Item dense={false} leadingIcon={AppIcons.report} title={'Report'} onPress={handleReport} />
      {hasModerator && (
        <>
          <Divider bold={true} />
          <ModerateMenuItem
            closeMenu={closeMenu}
            resourceID={image.postID.toString()}
            resource={'photostream'}
            navigation={commonNavigation}
          />
        </>
      )}
    </Menu>
  );
};
