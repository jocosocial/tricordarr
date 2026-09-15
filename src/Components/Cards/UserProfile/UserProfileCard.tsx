import React from 'react';
import {Linking} from 'react-native';
import {Card} from 'react-native-paper';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {DinnerTeam} from '#src/Enums/DinnerTeam';
import {parseRoomNumber} from '#src/Libraries/ShipIndex';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ProfilePublicData} from '#src/Structs/ControllerStructs';

interface UserProfileCardProps {
  user: ProfilePublicData;
}

export const UserProfileCard = ({user}: UserProfileCardProps) => {
  const {commonStyles} = useStyles();
  const navigation = useCommonStack();
  // roomNumber can be a lettered sub-unit ("7000A"), not just digits, so this
  // can't be a plain Number() check — that silently NaNs on the letter.
  const onRoomPress = parseRoomNumber(user.roomNumber)
    ? () => navigation.push(CommonStackComponents.mapScreen, {room: user.roomNumber})
    : undefined;
  return (
    <Card>
      <Card.Title title={'User Profile'} />
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
          {user.roomNumber && (
            <DataFieldListItem title={'Room Number'} description={user.roomNumber} onPress={onRoomPress} />
          )}
          {user.discordUsername && <DataFieldListItem title={'Discord Username'} description={user.discordUsername} />}
        </ListSection>
      </Card.Content>
    </Card>
  );
};
