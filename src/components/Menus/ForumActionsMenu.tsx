import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {SeamailStackScreenComponents} from '../../libraries/Enums/Navigation';
import {AppIcons} from '../../libraries/Enums/Icons';
import {HelpModalView} from '../Views/Modals/HelpModalView';
import {useModal} from '../Context/Contexts/ModalContext';
import {FezData, ForumData} from '../../libraries/Structs/ControllerStructs';
import {useSeamailStack} from '../Navigation/Stacks/SeamailStack';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {Item} from 'react-navigation-header-buttons';

interface ForumActionsMenuProps {
  forumData?: ForumData;
}

const helpContent = [
  'You can long press on a message for additional actions.',
  'Press the title to easily access details.',
];

export const ForumActionsMenu = ({forumData}: ForumActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const {hasModerator, hasTwitarrTeam, setAsModerator, setAsTwitarrTeam, asModerator, asTwitarrTeam} = usePrivilege();
  const {profilePublicData} = useUserData();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      {forumData?.creator.username !== profilePublicData?.header.username && (
        <>
          <Menu.Item dense={false} leadingIcon={AppIcons.report} title={'Report'} onPress={() => console.log('report')} />
          <Divider bold={true} />
        </>
      )}
      {hasModerator && (
        <>
          <Menu.Item
            dense={false}
            leadingIcon={AppIcons.moderator}
            title={'Moderate'}
            onPress={() => console.log('mod')}
          />
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
