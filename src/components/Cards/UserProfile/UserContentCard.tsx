import React from 'react';
import {Card, List} from 'react-native-paper';
import {ListSection} from '../../Lists/ListSection';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {AppIcon} from '../../Images/AppIcon';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {BottomTabComponents, LfgStackComponents, RootStackComponents} from '../../../libraries/Enums/Navigation';

interface UserContentCardProps {
  user: ProfilePublicData;
}

export const UserContentCard = ({user}: UserContentCardProps) => {
  const {commonStyles} = useStyles();
  const {profilePublicData} = useUserData();
  const rootNavigation = useRootStack();
  const isSelf = profilePublicData?.header.userID === user.header.userID;

  const getIcon = (icon: string) => <AppIcon style={[commonStyles.marginLeft]} icon={icon} />;

  return (
    <Card>
      <Card.Title title={`Content by @${user.header.username}`} />
      <Card.Content style={[commonStyles.paddingHorizontalZero]}>
        <ListSection>
          <List.Item
            title={'Forums'}
            left={() => getIcon(AppIcons.forum)}
            onPress={() => console.warn('forums', user.header.userID)}
          />
          {isSelf && (
            <List.Item
              title={'LFGs'}
              left={() => getIcon(AppIcons.lfg)}
              onPress={() =>
                rootNavigation.push(RootStackComponents.rootContentScreen, {
                  screen: BottomTabComponents.lfgTab,
                  params: {
                    screen: LfgStackComponents.lfgOwnedScreen,
                    initial: false,
                  },
                })
              }
            />
          )}
        </ListSection>
      </Card.Content>
    </Card>
  );
};
