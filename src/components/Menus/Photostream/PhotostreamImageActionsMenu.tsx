import React, {ReactNode} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {useModal} from '#src/Components/Context/Contexts/ModalContext.ts';
import {ReportModalView} from '#src/Components/Views/Modals/ReportModalView.tsx';
import {PhotostreamImageData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {usePrivilege} from '#src/Components/Context/Contexts/PrivilegeContext.ts';
import {ModerateMenuItem} from '#src/Components/Menus/Items/ModerateMenuItem.tsx';
import {useCommonStack} from '#src/Components/Navigation/CommonScreens.tsx';

interface PhotostreamImageActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
  image: PhotostreamImageData;
}

export const PhotostreamImageActionsMenu = ({visible, closeMenu, anchor, image}: PhotostreamImageActionsMenuProps) => {
  const {setModalContent, setModalVisible} = useModal();
  const {hasModerator} = usePrivilege();
  const commonNavigation = useCommonStack();

  const handleReport = () => {
    closeMenu();
    setModalContent(<ReportModalView photostreamImage={image} />);
    setModalVisible(true);
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
