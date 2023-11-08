import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {Linking, RefreshControl, StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScheduleStackParamList} from '../../Navigation/Stacks/ScheduleStackNavigator';
import {NavigatorIDs, ScheduleStackComponents} from '../../../libraries/Enums/Navigation';
import {useSeamailQuery} from '../../Queries/Fez/FezQueries';
import {LfgCard} from '../../Cards/Schedule/LfgCard';
import {ListSection} from '../../Lists/ListSection';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {AppIcon} from '../../Images/AppIcon';
import {getDurationString} from '../../../libraries/DateTime';
import {FezData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {ScheduleLfgMenu} from '../../Menus/ScheduleLfgMenu';

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.lfgScreen,
  NavigatorIDs.scheduleStack
>;

// @TODO twitarrcontext, setfez, figure out what to do with chat.
export const LfgScreen = ({navigation, route}: Props) => {
  const {data, refetch, isFetching} = useSeamailQuery({
    fezID: route.params.fezID,
  });
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    item: {
      ...commonStyles.paddingHorizontal,
    },
    icon: {
      ...commonStyles.paddingTopSmall,
    },
  });

  const getIcon = (icon: string) => <AppIcon icon={icon} style={styles.icon} />;
  const fezData = data?.pages[0];

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          {fezData && (
            <>
              <Item
                title={'Membership'}
                iconName={AppIcons.join}
                onPress={() => console.log('hi')}
              />
              <Item
                title={'Favorite'}
                iconName={AppIcons.leave}
                onPress={() => console.log('hi')}
              />
            </>
          )}
          {fezData && <ScheduleLfgMenu fezData={fezData} />}
        </HeaderButtons>
      </View>
    );
  }, [fezData, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        {fezData && (
          <PaddedContentView padSides={false}>
            <ListSection>
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.events)}
                description={fezData.title}
                title={'Title'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.time)}
                description={getDurationString(fezData.startTime, fezData.endTime, fezData.timeZone, true)}
                title={'Date'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.map)}
                description={fezData.location}
                title={'Location'}
                onPress={() => Linking.openURL(`tricordarr://twitarrtab/${Date.now()}/map`)}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.type)}
                description={fezData.fezType}
                title={'Type'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.user)}
                description={UserHeader.getByline(fezData.owner)}
                title={'Owner'}
                onPress={() => Linking.openURL(`tricordarr://user/${fezData.owner.userID}`)}
              />
              {fezData.members && (
                <DataFieldListItem
                  itemStyle={styles.item}
                  left={() => getIcon(AppIcons.group)}
                  description={FezData.getParticipantLabel(
                    fezData.members.participants.length,
                    fezData.maxParticipants,
                  )}
                  title={'Participation'}
                />
              )}
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.description)}
                description={fezData.info}
                title={'Description'}
              />
            </ListSection>
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
