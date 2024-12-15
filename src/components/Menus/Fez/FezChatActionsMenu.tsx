import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {Item} from 'react-navigation-header-buttons';
import {PostAsModeratorMenuItem} from '../Items/PostAsModeratorMenuItem.tsx';
import {PostAsTwitarrTeamMenuItem} from '../Items/PostAsTwitarrTeamMenuItem.tsx';
import {useFezMuteMutation} from '../../Queries/Fez/FezMuteMutations.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';
import {ReloadMenuItem} from '../Items/ReloadMenuItem.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {FezType} from '../../../libraries/Enums/FezType.ts';

interface FezChatActionsMenuProps {
  fez: FezData;
  enableDetails?: boolean;
  onRefresh: () => void;
}

export const FezChatActionsMenu = ({fez, enableDetails = true, onRefresh}: FezChatActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const navigation = useCommonStack();
  const {hasModerator, hasTwitarrTeam} = usePrivilege();
  const muteMutation = useFezMuteMutation();
  const {commonStyles} = useStyles();
  const commonNavigation = useCommonStack();
  const queryClient = useQueryClient();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const detailsAction = () => {
    navigation.push(CommonStackComponents.fezChatDetailsScreen, {fezID: fez.fezID});
    closeMenu();
  };

  const handleMute = () => {
    if (!fez.members) {
      return;
    }
    const action = fez.members.isMuted ? 'unmute' : 'mute';
    muteMutation.mutate(
      {
        action: action,
        fezID: fez.fezID,
      },
      {
        onSuccess: async () => {
          const invalidations = FezData.getCacheKeys(fez.fezID).map(key => {
            return queryClient.invalidateQueries(key);
          });
          await Promise.all(invalidations);
        },
        onSettled: () => closeMenu(),
      },
    );
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <ReloadMenuItem closeMenu={closeMenu} onReload={onRefresh} />
      <Divider bold={true} />
      {enableDetails && <Menu.Item leadingIcon={AppIcons.details} onPress={detailsAction} title={'Details'} />}
      {fez.members && (
        <Menu.Item
          leadingIcon={AppIcons.mute}
          onPress={handleMute}
          title={'Mute'}
          style={fez.members.isMuted ? commonStyles.surfaceVariant : undefined}
        />
      )}
      {(hasModerator || hasTwitarrTeam) && (
        <>
          <Divider bold={true} />
          <PostAsModeratorMenuItem closeMenu={closeMenu} />
          <PostAsTwitarrTeamMenuItem closeMenu={closeMenu} />
          <Divider bold={true} />
        </>
      )}
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => {
          closeMenu();
          const helpRoute = FezType.getHelpRoute(fez.fezType);
          if (helpRoute) {
            commonNavigation.push(helpRoute);
          }
        }}
      />
    </Menu>
  );
};
