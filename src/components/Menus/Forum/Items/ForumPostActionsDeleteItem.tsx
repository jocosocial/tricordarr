import {AppIcons} from '../../../../libraries/Enums/Icons';
import {Menu} from 'react-native-paper';
import React from 'react';
import {ForumData, PostData} from '../../../../libraries/Structs/ControllerStructs';
import {useModal} from '../../../Context/Contexts/ModalContext';
import {ForumPostDeleteModalView} from '../../../Views/Modals/ForumPostDeleteModalView';
import {useUserProfileQuery} from '../../../Queries/User/UserQueries.ts';

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
