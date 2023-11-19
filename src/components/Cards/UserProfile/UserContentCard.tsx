import React from 'react';
import {Card, List} from 'react-native-paper';
import {ListSection} from '../../Lists/ListSection';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {AppIcon} from '../../Images/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';

interface UserContentCardProps {
  user: ProfilePublicData;
}

export const UserContentCard = ({user}: UserContentCardProps) => {
  const {commonStyles} = useStyles();
  return (
    <Card>
      <Card.Title title={`Content by @${user.header.username}`} />
      <Card.Content style={[commonStyles.paddingHorizontalZero]}>
        <ListSection>
          <List.Item
            title={'Forums'}
            left={() => <AppIcon style={[commonStyles.marginLeft]} icon={AppIcons.forum} />}
            onPress={() => console.log('forums', user.header.userID)}
          />
          <List.Item
            title={'LFGs'}
            left={() => <AppIcon style={[commonStyles.marginLeft]} icon={AppIcons.group} />}
            onPress={() => console.log('LFGs', user.header.userID)}
          />
        </ListSection>
      </Card.Content>
    </Card>
  );
};
