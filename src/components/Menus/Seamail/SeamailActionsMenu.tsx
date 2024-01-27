import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {useModal} from '../../Context/Contexts/ModalContext';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {useSeamailStack} from '../../Navigation/Stacks/SeamailStackNavigator';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {Item} from 'react-navigation-header-buttons';
import {PostAsModeratorMenuItem} from '../Items/PostAsModeratorMenuItem';
import {PostAsTwitarrTeamMenuItem} from '../Items/PostAsTwitarrTeamMenuItem';
import {useFezMuteMutation} from '../../Queries/Fez/FezMuteQueries';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {FezListActions} from '../../Reducers/Fez/FezListReducers';
import {useSeamailQuery} from '../../Queries/Fez/FezQueries';

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
  const {hasModerator, hasTwitarrTeam} = usePrivilege();
  const muteMutation = useFezMuteMutation();
  const {commonStyles} = useStyles();
  const {dispatchFezList, setFez} = useTwitarr();
  const {remove} = useSeamailQuery({fezID: fez.fezID});

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const detailsAction = () => {
    seamailNavigation.push(SeamailStackScreenComponents.seamailDetailsScreen, {fezID: fez.fezID});
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
