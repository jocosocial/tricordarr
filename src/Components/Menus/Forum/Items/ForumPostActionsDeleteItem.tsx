import React from 'react';
import {Menu} from 'react-native-paper';

import {ForumPostDeleteModalView} from '#src/Components/Views/Modals/ForumPostDeleteModalView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {AppIcons} from '#src/Enums/Icons';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsDeleteItemProps {
  forumPost: PostData;
  closeMenu: () => void;
  forumData?: ForumData;
}

export const ForumPostActionsDeleteItem = ({forumPost, closeMenu, forumData}: ForumPostActionsDeleteItemProps) => {
  const {data: profilePublicData} = useUserProfileQuery();
  const bySelf = profilePublicData?.header.userID === forumPost.author.userID;
  const {setModalVisible, setModalContent} = useModal();

  const onPress = () => {
    closeMenu();
    setModalContent(<ForumPostDeleteModalView postData={forumPost} forumData={forumData} />);
    setModalVisible(true);
  };

  if (!bySelf) {
    return null;
  }

  return <Menu.Item dense={false} leadingIcon={AppIcons.postRemove} title={'Delete'} onPress={onPress} />;
};
