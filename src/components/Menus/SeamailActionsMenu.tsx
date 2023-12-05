import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {SeamailStackScreenComponents} from '../../libraries/Enums/Navigation';
import {AppIcons} from '../../libraries/Enums/Icons';
import {HelpModalView} from '../Views/Modals/HelpModalView';
import {useModal} from '../Context/Contexts/ModalContext';
import {FezData} from '../../libraries/Structs/ControllerStructs';
import {useSeamailStack} from '../Navigation/Stacks/SeamailStack';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {Item} from 'react-navigation-header-buttons';
import {PostAsModeratorMenuItem} from './Items/PostAsModeratorMenuItem';
import {PostAsTwitarrTeamMenuItem} from './Items/PostAsTwitarrTeamMenuItem';

interface SeamailActionsMenuProps {
  fez: FezData;
  enableDetails?: boolean;
}

const helpContent = [
  'You can long press on a message for additional actions.',
  'Press the title to easily access details.',
];

export const SeamailActionsMenu = ({fez, enableDetails = true}: SeamailActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const seamailNavigation = useSeamailStack();
  const {setModalContent, setModalVisible} = useModal();
  const {hasModerator, hasTwitarrTeam, setAsModerator, setAsTwitarrTeam, asModerator, asTwitarrTeam} = usePrivilege();
  const {profilePublicData} = useUserData();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const postAsModerator = () => {
    setAsTwitarrTeam(false);
    setAsModerator(!asModerator);
    closeMenu();
  };

  const postAsTwitarrTeam = () => {
    setAsModerator(false);
    setAsTwitarrTeam(!asTwitarrTeam);
    closeMenu();
  };

  const postAsSelf = () => {
    setAsModerator(false);
    setAsTwitarrTeam(false);
    closeMenu();
  };

  const detailsAction = () => {
    seamailNavigation.push(SeamailStackScreenComponents.seamailDetailsScreen, {fezID: fez.fezID});
    closeMenu();
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      {enableDetails && <Menu.Item leadingIcon={AppIcons.details} onPress={detailsAction} title={'Details'} />}
      {(hasModerator || hasTwitarrTeam) && (
        <>
          <Divider bold={true} />
          <PostAsModeratorMenuItem closeMenu={closeMenu} />
          <PostAsTwitarrTeamMenuItem closeMenu={closeMenu} />
          <Divider bold={true} />
        </>
      )}
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          closeMenu();
          setModalContent(<HelpModalView text={helpContent} />);
          setModalVisible(true);
        }}
      />
    </Menu>
  );
};
