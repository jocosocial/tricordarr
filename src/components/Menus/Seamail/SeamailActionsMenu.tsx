import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {useChatStack} from '../../Navigation/Stacks/ChatStackNavigator.tsx';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {Item} from 'react-navigation-header-buttons';
import {PostAsModeratorMenuItem} from '../Items/PostAsModeratorMenuItem';
import {PostAsTwitarrTeamMenuItem} from '../Items/PostAsTwitarrTeamMenuItem';
import {useFezMuteMutation} from '../../Queries/Fez/FezMuteQueries';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {FezListActions} from '../../Reducers/Fez/FezListReducers';
import {useSeamailQuery} from '../../Queries/Fez/FezQueries';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';
import {ReloadMenuItem} from '../Items/ReloadMenuItem';

interface SeamailActionsMenuProps {
  fez: FezData;
  enableDetails?: boolean;
  onRefresh: () => void;
}

export const SeamailActionsMenu = ({fez, enableDetails = true, onRefresh}: SeamailActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const seamailNavigation = useChatStack();
  const {hasModerator, hasTwitarrTeam} = usePrivilege();
  const muteMutation = useFezMuteMutation();
  const {commonStyles} = useStyles();
  const {dispatchFezList, setFez} = useTwitarr();
  const {remove} = useSeamailQuery({fezID: fez.fezID});
  const commonNavigation = useCommonStack();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const detailsAction = () => {
    seamailNavigation.push(CommonStackComponents.seamailDetailsScreen, {fezID: fez.fezID});
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
        onSuccess: () => {
          if (fez.members) {
            const newFezData: FezData = {
              ...fez,
              members: {
                ...fez.members,
                isMuted: !fez.members?.isMuted,
              },
            };
            setFez(newFezData);
            dispatchFezList({
              type: FezListActions.updateFez,
              fez: newFezData,
            });
            remove();
          }
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
          commonNavigation.push(CommonStackComponents.seamailHelpScreen);
        }}
      />
    </Menu>
  );
};
