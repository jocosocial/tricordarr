import React from 'react';
import {Card, List} from 'react-native-paper';
import {ListSection} from '../../Lists/ListSection';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ProfilePublicData} from '../../../Libraries/Structs/ControllerStructs';
import {AppIcon} from '../../Icons/AppIcon';
import {AppIcons} from '../../../Libraries/Enums/Icons';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';

interface UserContentCardProps {
  user: ProfilePublicData;
}

/**
 * This used to have a button to your owned LFGs. But doing that with the common screens pattern
 * got super complicated and not worth it. Maybe some day.
 */
export const UserContentCard = ({user}: UserContentCardProps) => {
  const {commonStyles} = useStyles();
  const commonNavigation = useCommonStack();
  const {hasModerator} = usePrivilege();

  const getIcon = (icon: string) => <AppIcon style={[commonStyles.marginLeft]} icon={icon} />;

  return (
    <Card>
      <Card.Title title={`Content by @${user.header.username}`} />
      <Card.Content style={[commonStyles.paddingHorizontalZero]}>
        <ListSection>
          <List.Item
            title={'Forums'}
            left={() => getIcon(AppIcons.forum)}
            onPress={() => commonNavigation.push(CommonStackComponents.forumThreadUserScreen, {user: user.header})}
          />
          {hasModerator && (
            <List.Item
              title={'Forum Posts'}
              left={() => getIcon(AppIcons.moderator)}
              onPress={() => commonNavigation.push(CommonStackComponents.forumPostUserScreen, {user: user.header})}
            />
          )}
        </ListSection>
      </Card.Content>
    </Card>
  );
};
