import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Menu} from 'react-native-paper';
import * as React from 'react';
import {AppHeaderMenu} from '../AppHeaderMenu.tsx';
import {Dispatch, SetStateAction} from 'react';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {MenuAnchor} from '../MenuAnchor.tsx';

interface SeamailFilterMenuProps {
  archived: boolean;
  setArchived: Dispatch<SetStateAction<boolean>>;
}

export const SeamailFilterMenu = (props: SeamailFilterMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const {commonStyles} = useStyles();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const {asPrivilegedUser} = usePrivilege();

  if (asPrivilegedUser) {
    return <></>;
  }

  const menuAnchor = (
    <MenuAnchor
      title={'Filter'}
      active={props.archived}
      iconName={AppIcons.filter}
      onPress={openMenu}
      onLongPress={() => props.setArchived(false)}
    />
  );

  return (
    <AppHeaderMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item
        leadingIcon={AppIcons.archive}
        title={'Archived'}
        onPress={() => {
          closeMenu();
          props.setArchived(!props.archived);
        }}
        style={props.archived ? commonStyles.surfaceVariant : undefined}
      />
    </AppHeaderMenu>
  );
};
