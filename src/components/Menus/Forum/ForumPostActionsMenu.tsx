import React, {ReactNode} from 'react';
import {PostData} from '../../../libraries/Structs/ControllerStructs';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import Clipboard from '@react-native-clipboard/clipboard';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {ForumPostActionsFavoriteItem} from './Items/ForumPostActionsFavoriteItem';
import {ForumPostActionsReactionItem} from './Items/ForumPostActionsReactionItem';
import {ForumPostActionsReportItem} from './Items/ForumPostActionsReportItem';
import {ForumPostActionsModerateItem} from './Items/ForumPostActionsModerateItem';

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
  const {profilePublicData} = useUserData();
  const bySelf = profilePublicData?.header.userID === forumPost.author.userID;

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
      {enableShowInThread && (
        <>
          <Menu.Item
            dense={false}
            leadingIcon={AppIcons.forum}
            title={'View In Thread'}
            onPress={() => console.log('view')}
          />
          <Divider bold={true} />
        </>
      )}
      <Menu.Item
        dense={false}
        leadingIcon={AppIcons.copy}
        title={'Copy'}
        onPress={() => {
          Clipboard.setString(forumPost.text);
          closeMenu();
        }}
      />
      {bySelf && (
        <Menu.Item dense={false} leadingIcon={AppIcons.postEdit} title={'Edit'} onPress={() => console.log('edit')} />
      )}
      {bySelf && (
        <Menu.Item
          dense={false}
          leadingIcon={AppIcons.postRemove}
          title={'Delete'}
          onPress={() => console.log('delete')}
        />
      )}
      <Divider bold={true} />
      <ForumPostActionsFavoriteItem forumPost={forumPost} />
      <ForumPostActionsReportItem forumPost={forumPost} closeMenu={closeMenu} />
      <ForumPostActionsModerateItem forumPost={forumPost} closeMenu={closeMenu} />
      <Divider bold={true} />
      <ForumPostActionsReactionItem forumPost={forumPost} />
    </Menu>
  );
};
