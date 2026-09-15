import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {Menu} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';
import {ReportContentType} from '#src/Enums/ReportContentType';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsReportItemProps {
  closeMenu: () => void;
  forumPost: PostData;
  navigation: StackNavigationProp<CommonStackParamList>;
}

export const ForumPostActionsReportItem = ({closeMenu, forumPost, navigation}: ForumPostActionsReportItemProps) => {
  const handleReport = () => {
    closeMenu();
    navigation.push(CommonStackComponents.reportScreen, {
      contentType: ReportContentType.forumPost,
      contentID: forumPost.postID,
    });
  };

  return <Menu.Item title={'Report'} dense={false} leadingIcon={AppIcons.report} onPress={handleReport} />;
};
