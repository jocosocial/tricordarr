import React from 'react';
import {Menu} from 'react-native-paper';

import {ForumPostDeleteModalView} from '#src/Components/Views/Modals/ForumPostDeleteModalView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {AppIcons} from '#src/Enums/Icons';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsDeleteItemProps {
  forumPost: PostData;
  closeMenu: () => void;
  forumData?: ForumData;
}

export const ForumPostActionsDeleteItem = ({forumPost, closeMenu, forumData}: ForumPostActionsDeleteItemProps) => {
  const {setModalVisible, setModalContent} = useModal();

  const onPress = () => {
    closeMenu();
    setModalContent(<ForumPostDeleteModalView postData={forumPost} forumData={forumData} />);
    setModalVisible(true);
  };

  return <Menu.Item dense={false} leadingIcon={AppIcons.postRemove} title={'Delete'} onPress={onPress} />;
};
