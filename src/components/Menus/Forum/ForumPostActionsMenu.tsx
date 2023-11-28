import React, {ReactNode} from 'react';
import {useModal} from '../../Context/Contexts/ModalContext';
import {PostData} from '../../../libraries/Structs/ControllerStructs';
import {ReportModalView} from '../../Views/Modals/ReportModalView';
import {Divider, IconButton, Menu, Text} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import Clipboard from '@react-native-clipboard/clipboard';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {View} from 'react-native';
import {LaughReaction, LoveReaction, ThumbsUpReaction} from '../../Text/Reactions';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {BottomTabComponents, MainStackComponents, RootStackComponents} from '../../../libraries/Enums/Navigation';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';

interface ForumPostActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
  forumPost: PostData;
  enableShowInThread?: boolean;
}

export const ForumPostActionsMenu = ({
  visible,
  closeMenu,
  anchor,
  forumPost,
  enableShowInThread,
}: ForumPostActionsMenuProps) => {
  const {setModalContent, setModalVisible} = useModal();
  // const {fez} = useTwitarr();
  const {hasModerator} = usePrivilege();
  const {commonStyles} = useStyles();
  const rootStackNavigation = useRootStack();

  const handleReport = () => {
    closeMenu();
    setModalContent(<ReportModalView forumPost={forumPost} />);
    setModalVisible(true);
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
      <Menu.Item
        dense={false}
        leadingIcon={AppIcons.copy}
        title={'Copy'}
        onPress={() => {
          Clipboard.setString(forumPost.text);
          closeMenu();
        }}
      />
      <Divider bold={true} />
      {enableShowInThread && (
        <Menu.Item dense={false} leadingIcon={AppIcons.forum} title={'View Thread'} onPress={handleReport} />
      )}
      <Menu.Item title={'Favorite'} dense={false} leadingIcon={AppIcons.favorite} />
      <Menu.Item title={'Report'} dense={false} leadingIcon={AppIcons.report} onPress={handleReport} />
      {hasModerator && (
        <Menu.Item
          title={'Moderate'}
          dense={false}
          leadingIcon={AppIcons.moderator}
          onPress={() => {
            closeMenu();
            rootStackNavigation.push(RootStackComponents.rootContentScreen, {
              screen: BottomTabComponents.homeTab,
              params: {
                screen: MainStackComponents.siteUIScreen,
                params: {
                  resource: 'forumpost',
                  id: forumPost.postID.toString(),
                  moderate: true,
                },
                initial: false,
              },
            });
          }}
        />
      )}
      <Divider bold={true} />
      <View style={commonStyles.flexRow}>
        <IconButton icon={LaughReaction} />
        <IconButton icon={ThumbsUpReaction} />
        <IconButton icon={LoveReaction} />
      </View>
    </Menu>
  );
};
