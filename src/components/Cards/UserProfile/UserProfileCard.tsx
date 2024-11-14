import React from 'react';
import {Card} from 'react-native-paper';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {ListSection} from '../../Lists/ListSection';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {Linking} from 'react-native';
import {DinnerTeam} from '../../../libraries/Enums/DinnerTeam';

interface UserProfileCardProps {
  user: ProfilePublicData;
}

export const UserProfileCard = ({user}: UserProfileCardProps) => {
  const {commonStyles} = useStyles();
  return (
    <Card>
      <Card.Title title="User Profile" />
      <Card.Content style={[commonStyles.paddingHorizontalZero]}>
        <ListSection>
          {user.header.displayName && (
            <DataFieldListItem title={'Display Name'} description={user.header.displayName} />
          )}
          {user.realName && <DataFieldListItem title={'Real Name'} description={user.realName} />}
          {user.header.username && <DataFieldListItem title={'Username'} description={user.header.username} />}
          {user.header.preferredPronoun && (
            <DataFieldListItem title={'Pronouns'} description={user.header.preferredPronoun} />
          )}
          {user.dinnerTeam && (
            <DataFieldListItem title={'Dinner Team'} description={DinnerTeam.getLabel(user.dinnerTeam)} />
          )}
          {user.email && (
            <DataFieldListItem
              title={'Email'}
              description={user.email}
              onPress={() => Linking.openURL(`mailto:${user.email}`)}
            />
          )}
          {user.homeLocation && <DataFieldListItem title={'Home Location'} description={user.homeLocation} />}
          {user.roomNumber && <DataFieldListItem title={'Room Number'} description={user.roomNumber} />}
        </ListSection>
      </Card.Content>
    </Card>
  );
};
