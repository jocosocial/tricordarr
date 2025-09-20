import React, {ReactNode} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {ReportModalView} from '../../Views/Modals/ReportModalView.tsx';
import {PhotostreamImageData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {ModerateMenuItem} from '../Items/ModerateMenuItem.tsx';
import {useCommonStack} from '../../Navigation/CommonScreens.tsx';

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
