import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {Divider, Menu} from 'react-native-paper';
import React, {useState} from 'react';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';
import {PerformerData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {AppHeaderMenu} from '../AppHeaderMenu.tsx';

interface PerformerActionsMenuProps {
  performerData?: PerformerData;
}

export const PerformerActionsMenu = ({performerData}: PerformerActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {hasTwitarrTeam, hasModerator} = usePrivilege();
  const navigation = useCommonStack();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  // TypeScript + JSX = silly
  const creatorID = performerData?.user?.userID;
  const performerID = performerData?.header.id;

  return (
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      {hasModerator && creatorID && (
        <>
          <Menu.Item
            title={'View Creator Profile'}
            leadingIcon={AppIcons.moderator}
            onPress={() => {
              navigation.push(CommonStackComponents.userProfileScreen, {
                userID: creatorID,
              });
              closeMenu();
            }}
          />
          <Divider bold={true} />
        </>
      )}
      {hasTwitarrTeam && performerID && (
        <>
          <Menu.Item
            title={'Edit Performer'}
            leadingIcon={AppIcons.twitarteam}
            onPress={() => {
              navigation.push(CommonStackComponents.siteUIScreen, {
                resource: 'performer',
                id: `add?performer=${performerID}`,
                admin: true,
              });
              closeMenu();
            }}
          />
          <Divider bold={true} />
        </>
      )}
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.performerHelpScreen);
        }}
      />
    </AppHeaderMenu>
  );
};
