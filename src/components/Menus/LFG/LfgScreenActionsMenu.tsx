import React, {ReactNode, useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '#src/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {FezData} from '#src/Structs/ControllerStructs';
import {ReportModalView} from '#src/Components/Views/Modals/ReportModalView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {FezCancelModal} from '#src/Components/Views/Modals/FezCancelModal';
import {useLFGStackNavigation} from '#src/Navigation/Stacks/LFGStackNavigator';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

export const LfgScreenActionsMenu = ({fezData}: {fezData: FezData}) => {
  const [visible, setVisible] = useState(false);
  const navigation = useLFGStackNavigation();
  const {hasModerator} = usePrivilege();
  const {setModalContent, setModalVisible} = useModal();
  const {data: profilePublicData} = useUserProfileQuery();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = <Item title={'LFG Menu'} iconName={AppIcons.menu} onPress={openMenu} />;

  const handleModal = (content: ReactNode) => {
    closeMenu();
    setModalContent(content);
    setModalVisible(true);
  };

  return (
    <AppHeaderMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {fezData.owner.userID === profilePublicData?.header.userID && (
        <Menu.Item
          leadingIcon={AppIcons.cancel}
          title={'Cancel'}
          onPress={() => handleModal(<FezCancelModal fezData={fezData} />)}
          disabled={fezData.cancelled}
        />
      )}
      <Menu.Item
        leadingIcon={AppIcons.report}
        title={'Report'}
        onPress={() => handleModal(<ReportModalView fez={fezData} />)}
      />
      {hasModerator && (
        <Menu.Item
          leadingIcon={AppIcons.moderator}
          title={'Moderate'}
          onPress={() => {
            navigation.push(CommonStackComponents.siteUIScreen, {
              resource: 'lfg',
              id: fezData.fezID,
              moderate: true,
            });
            closeMenu();
          }}
        />
      )}
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          navigation.push(CommonStackComponents.lfgHelpScreen);
          closeMenu();
        }}
      />
    </AppHeaderMenu>
  );
};
