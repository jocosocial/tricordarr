import * as React from 'react';
import {Menu} from 'react-native-paper';
import {NavBarIconButton} from '../Buttons/IconButtons/NavBarIconButton';
import {SeamailStackScreenComponents} from '../../libraries/Enums/Navigation';
import {AppIcons} from '../../libraries/Enums/Icons';
import {HelpModalView} from '../Views/Modals/HelpModalView';
import {useModal} from '../Context/Contexts/ModalContext';
import {FezData} from '../../libraries/Structs/ControllerStructs';
import {useSeamailStack} from '../Navigation/Stacks/SeamailStack';

interface SeamailActionsMenuProps {
  fez: FezData;
}

const helpContent = [
  'You can long press on a message for additional actions.',
  'Press the title to easily access details.',
];

export const SeamailActionsMenu = ({fez}: SeamailActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const navigation = useSeamailStack();
  const {setModalContent, setModalVisible} = useModal();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const detailsAction = () => {
    navigation.push(SeamailStackScreenComponents.seamailDetailsScreen, {fezID: fez.fezID});
    closeMenu();
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={<NavBarIconButton icon={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item leadingIcon={AppIcons.details} onPress={detailsAction} title={'Details'} />
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
