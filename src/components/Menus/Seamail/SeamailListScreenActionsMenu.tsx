import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Divider, Menu} from 'react-native-paper';
import * as React from 'react';
import {ChatStackScreenComponents, useChatStack} from '../../Navigation/Stacks/ChatStackNavigator.tsx';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {AppHeaderMenu} from '../AppHeaderMenu.tsx';
import {Dispatch, SetStateAction} from 'react';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

interface SeamailListScreenActionsMenuProps {
  archived: boolean;
  setArchived: Dispatch<SetStateAction<boolean>>;
}

export const SeamailListScreenActionsMenu = (props: SeamailListScreenActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const navigation = useChatStack();
  const {commonStyles} = useStyles();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const {asPrivilegedUser} = usePrivilege();

  return (
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      {!asPrivilegedUser && (
        <>
          <Menu.Item
            leadingIcon={AppIcons.archive}
            title={'Archived'}
            onPress={() => {
              closeMenu();
              props.setArchived(!props.archived);
            }}
            style={props.archived ? commonStyles.surfaceVariant : undefined}
          />
          <Divider bold={true} />
        </>
      )}
      <Menu.Item
        leadingIcon={AppIcons.settings}
        title={'Settings'}
        onPress={() => {
          closeMenu();
          navigation.push(ChatStackScreenComponents.seamailSettingsScreen);
        }}
      />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.seamailHelpScreen);
        }}
      />
    </AppHeaderMenu>
  );
};
