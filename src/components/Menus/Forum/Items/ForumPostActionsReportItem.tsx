import {ReportModalView} from '#src/Components/Views/Modals/ReportModalView';
import React from 'react';
import {PostData} from '#src/Structs/ControllerStructs';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {Menu} from 'react-native-paper';
import {AppIcons} from '#src/Enums/Icons';

interface ForumPostActionsReportItemProps {
  closeMenu: () => void;
  forumPost: PostData;
}

export const ForumPostActionsReportItem = ({closeMenu, forumPost}: ForumPostActionsReportItemProps) => {
  const {setModalContent, setModalVisible} = useModal();
  const handleReport = () => {
    closeMenu();
    setModalContent(<ReportModalView forumPost={forumPost} />);
    setModalVisible(true);
  };

  return <Menu.Item title={'Report'} dense={false} leadingIcon={AppIcons.report} onPress={handleReport} />;
};
