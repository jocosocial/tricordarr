import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {Linking, RefreshControl, StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScheduleStackParamList} from '../../Navigation/Stacks/ScheduleStackNavigator';
import {NavigatorIDs, ScheduleStackComponents} from '../../../libraries/Enums/Navigation';
import {useSeamailQuery} from '../../Queries/Fez/FezQueries';
import {ListSection} from '../../Lists/ListSection';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {AppIcon} from '../../Images/AppIcon';
import {getDurationString} from '../../../libraries/DateTime';
import {FezData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {ScheduleLfgMenu} from '../../Menus/ScheduleLfgMenu';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useModal} from '../../Context/Contexts/ModalContext';
import {LfgLeaveModal} from '../../Views/Modals/LfgLeaveModal';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useFezMembershipMutation} from '../../Queries/Fez/FezMembershipQueries';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

export type Props = NativeStackScreenProps<
  ScheduleStackParamList,
  ScheduleStackComponents.lfgScreen,
  NavigatorIDs.scheduleStack
>;

export const LfgScreen = ({navigation, route}: Props) => {
  const {data, refetch, isFetching} = useSeamailQuery({
    fezID: route.params.fezID,
  });
  const {commonStyles} = useStyles();
  const {profilePublicData} = useUserData();
  const {setModalVisible, setModalContent} = useModal();
  const {fez, setFez} = useTwitarr();
  const membershipMutation = useFezMembershipMutation();
  const {setErrorMessage} = useErrorHandler();

  const styles = StyleSheet.create({
    item: {
      ...commonStyles.paddingHorizontal,
    },
    icon: {
      ...commonStyles.paddingTopSmall,
    },
  });

  const getIcon = (icon: string) => <AppIcon icon={icon} style={styles.icon} />;

  const handleMembershipPress = useCallback(() => {
    if (!fez || !profilePublicData) {
      return;
    }
    if (FezData.isParticipant(fez, profilePublicData.header)) {
      setModalContent(<LfgLeaveModal fezData={fez} />);
      setModalVisible(true);
    } else {
      membershipMutation.mutate(
        {
          fezID: fez.fezID,
          action: 'join',
        },
        {
          onSuccess: response => {
            setFez(response.data);
            setErrorMessage('Successfully joined LFG!');
          },
          onError: error => {
            setErrorMessage(error.response?.data.reason);
          },
        },
      );
    }
  }, [fez, membershipMutation, profilePublicData, setErrorMessage, setFez, setModalContent, setModalVisible]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          {fez && profilePublicData && (
            <>
              <Item
                title={'Membership'}
                iconName={FezData.isParticipant(fez, profilePublicData.header) ? AppIcons.leave : AppIcons.join}
                onPress={handleMembershipPress}
              />
              <Item
                title={'Chat'}
                iconName={AppIcons.seamail}
                onPress={() => Linking.openURL(`tricordarr://seamail/${fez.fezID}`)}
              />
            </>
          )}
          {fez && <ScheduleLfgMenu fezData={fez} />}
        </HeaderButtons>
      </View>
    );
  }, [fez, handleMembershipPress, profilePublicData]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    if (data) {
      setFez(data.pages[0]);
    }
  }, [data, setFez]);

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        {fez && (
          <PaddedContentView padSides={false}>
            <ListSection>
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.events)}
                description={fez.title}
                title={'Title'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.time)}
                description={getDurationString(fez.startTime, fez.endTime, fez.timeZone, true)}
                title={'Date'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.map)}
                description={fez.location}
                title={'Location'}
                onPress={() => Linking.openURL(`tricordarr://twitarrtab/${Date.now()}/map`)}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.type)}
                description={fez.fezType}
                title={'Type'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.user)}
                description={UserHeader.getByline(fez.owner)}
                title={'Owner'}
                onPress={() => Linking.openURL(`tricordarr://user/${fez.owner.userID}`)}
              />
              {fez.members && (
                <DataFieldListItem
                  itemStyle={styles.item}
                  left={() => getIcon(AppIcons.group)}
                  description={FezData.getParticipantLabel(fez)}
                  title={'Participation'}
                />
              )}
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.description)}
                description={fez.info}
                title={'Description'}
              />
            </ListSection>
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
