import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {Linking, RefreshControl, StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LfgStackComponents} from '../../../libraries/Enums/Navigation';
import {useSeamailQuery} from '../../Queries/Fez/FezQueries';
import {ListSection} from '../../Lists/ListSection';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {AppIcon} from '../../Icons/AppIcon';
import {getDurationString} from '../../../libraries/DateTime';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';
import {ScheduleLfgMenu} from '../../Menus/LFG/ScheduleLfgMenu';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useModal} from '../../Context/Contexts/ModalContext';
import {LfgLeaveModal} from '../../Views/Modals/LfgLeaveModal';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useFezMembershipMutation} from '../../Queries/Fez/FezMembershipQueries';
import {Badge, Text} from 'react-native-paper';
import {LoadingView} from '../../Views/Static/LoadingView';
import pluralize from 'pluralize';
import {LfgCanceledView} from '../../Views/Static/LfgCanceledView';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../styles/Theme';
import {LfgStackParamList} from '../../Navigation/Stacks/LFGStackNavigator';
import {useSocket} from '../../Context/Contexts/SocketContext';
import {useIsFocused} from '@react-navigation/native';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {NotificationTypeData, SocketNotificationData} from '../../../libraries/Structs/SocketStructs';
import {getUserBylineString} from '../../Text/Tags/UserBylineTag';
import {guessDeckNumber} from '../../../libraries/Ship';
import {CommonStackComponents} from '../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<LfgStackParamList, LfgStackComponents.lfgScreen>;

export const LfgScreen = ({navigation, route}: Props) => {
  const {data, refetch, isFetching} = useSeamailQuery({
    fezID: route.params.fezID,
  });
  const {commonStyles} = useStyles();
  const {profilePublicData} = useUserData();
  const {setModalVisible, setModalContent} = useModal();
  const {lfg, setLfg} = useTwitarr();
  const membershipMutation = useFezMembershipMutation();
  const theme = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const {closeFezSocket, notificationSocket} = useSocket();
  const isFocused = useIsFocused();
  const {hasModerator} = usePrivilege();

  const showChat =
    hasModerator ||
    FezData.isParticipant(lfg, profilePublicData?.header) ||
    FezData.isWaitlist(lfg, profilePublicData?.header);

  const styles = StyleSheet.create({
    item: {
      ...commonStyles.paddingHorizontal,
    },
    icon: {
      ...commonStyles.paddingTopSmall,
    },
    badge: {
      ...commonStyles.bold,
      ...commonStyles.paddingHorizontalSmall,
      ...commonStyles.marginLeftSmall,
    },
    chatCountContainer: {
      ...commonStyles.flexRow,
    },
  });

  const getIcon = (icon: string) => <AppIcon icon={icon} style={styles.icon} />;

  const handleMembershipPress = useCallback(() => {
    if (!lfg || !profilePublicData) {
      return;
    }
    if (FezData.isParticipant(lfg, profilePublicData.header) || FezData.isWaitlist(lfg, profilePublicData.header)) {
      setModalContent(<LfgLeaveModal fezData={lfg} />);
      setModalVisible(true);
    } else {
      setRefreshing(true);
      membershipMutation.mutate(
        {
          fezID: lfg.fezID,
          action: 'join',
        },
        {
          onSuccess: response => {
            setLfg(response.data);
          },
          onSettled: () => {
            setRefreshing(false);
          },
        },
      );
    }
  }, [lfg, membershipMutation, profilePublicData, setLfg, setModalContent, setModalVisible]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          {lfg && profilePublicData && showChat && (
            <Item
              title={'Chat'}
              iconName={AppIcons.chat}
              onPress={() => navigation.push(LfgStackComponents.lfgChatScreen, {fezID: lfg.fezID})}
            />
          )}
          {lfg && <ScheduleLfgMenu fezData={lfg} />}
        </HeaderButtons>
      </View>
    );
  }, [lfg, navigation, profilePublicData, showChat]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  useEffect(() => {
    if (data && isFocused) {
      setLfg(data.pages[0]);
      closeFezSocket();
    }
  }, [closeFezSocket, data, setLfg, isFocused]);

  // Mark as Read. Even though you may not have "read" it (tapping the Chat screen)
  // the API considers the GET in this screen as you reading it.
  // useEffect(() => {
  //   if (lfg && lfg.members && lfg.members.readCount !== lfg.members.postCount) {
  //     refetchUserNotificationData();
  //   }
  //   // @TODO this is still leaking. Is it?
  //   if (isFocused) {
  //     closeFezSocket();
  //   }
  // }, [closeFezSocket, lfg, isFocused, refetchUserNotificationData]);

  const notificationHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      const socketMessage = JSON.parse(event.data) as SocketNotificationData;
      if (SocketNotificationData.getType(socketMessage) === NotificationTypeData.fezUnreadMsg) {
        if (lfg && lfg.members && lfg.fezID === socketMessage.contentID) {
          setLfg({
            ...lfg,
            members: {
              ...lfg.members,
              postCount: lfg.members.postCount + 1,
            },
          });
        }
      }
    },
    [lfg, setLfg],
  );

  useEffect(() => {
    if (notificationSocket && isFocused) {
      notificationSocket.addEventListener('message', notificationHandler);
    } else if (notificationSocket && !isFocused) {
      notificationSocket.removeEventListener('message', notificationHandler);
    }
    return () => {
      if (notificationSocket) {
        notificationSocket.removeEventListener('message', notificationHandler);
      }
    };
  }, [isFocused, notificationHandler, notificationSocket]);

  if (!lfg) {
    return <LoadingView />;
  }

  const getChatDescription = () => {
    if (!lfg.members) {
      return;
    }
    const unreadCount = lfg.members.postCount - lfg.members.readCount;
    return (
      <View style={styles.chatCountContainer}>
        <Text>
          {lfg.members.postCount} {pluralize('post', lfg.members.postCount)}
        </Text>
        {unreadCount !== 0 && <Badge style={styles.badge}>{`${unreadCount} new`}</Badge>}
      </View>
    );
  };

  return (
    <AppView>
      {lfg.cancelled && (
        <View style={[commonStyles.displayFlex, commonStyles.flexColumn]}>
          <LfgCanceledView />
        </View>
      )}
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching || refreshing} onRefresh={refetch} />}>
        {lfg && (
          <>
            <PaddedContentView padSides={false}>
              <ListSection>
                <DataFieldListItem
                  itemStyle={styles.item}
                  left={() => getIcon(AppIcons.events)}
                  description={lfg.title}
                  title={'Title'}
                />
                <DataFieldListItem
                  itemStyle={styles.item}
                  left={() => getIcon(AppIcons.time)}
                  description={getDurationString(lfg.startTime, lfg.endTime, lfg.timeZoneID, true)}
                  title={'Date'}
                />
                <DataFieldListItem
                  itemStyle={styles.item}
                  left={() => getIcon(AppIcons.map)}
                  description={lfg.location}
                  title={'Location'}
                  onPress={() => {
                    const deck = guessDeckNumber(lfg.location);
                    let url = 'tricordarr://map';
                    if (deck) {
                      url = `${url}/${deck}`;
                    }
                    Linking.openURL(url);
                  }}
                />
                <DataFieldListItem
                  itemStyle={styles.item}
                  left={() => getIcon(AppIcons.user)}
                  description={getUserBylineString(lfg.owner, true, true)}
                  title={'Owner'}
                  onPress={() => navigation.push(CommonStackComponents.userProfileScreen, {userID: lfg.owner.userID})}
                />
                {lfg.members && (
                  <DataFieldListItem
                    itemStyle={styles.item}
                    left={() => getIcon(AppIcons.group)}
                    description={FezData.getParticipantLabel(lfg)}
                    title={'Participation'}
                    onPress={() => navigation.push(LfgStackComponents.lfgParticipationScreen, {fezID: lfg?.fezID})}
                  />
                )}
                {showChat && (
                  <DataFieldListItem
                    itemStyle={styles.item}
                    left={() => getIcon(AppIcons.chat)}
                    description={getChatDescription}
                    title={'Chat'}
                    onPress={() => navigation.push(LfgStackComponents.lfgChatScreen, {fezID: lfg.fezID})}
                  />
                )}
                <DataFieldListItem
                  itemStyle={styles.item}
                  left={() => getIcon(AppIcons.description)}
                  description={lfg.info}
                  title={'Description'}
                />
                <DataFieldListItem
                  itemStyle={styles.item}
                  left={() => getIcon(AppIcons.type)}
                  description={lfg.fezType}
                  title={'Type'}
                />
              </ListSection>
            </PaddedContentView>
          </>
        )}
      </ScrollingContentView>
      <View style={[commonStyles.displayFlex, commonStyles.flexRow, commonStyles.marginTopSmall]}>
        {profilePublicData && lfg.owner.userID !== profilePublicData.header.userID && (
          <PaddedContentView>
            {(FezData.isParticipant(lfg, profilePublicData?.header) ||
              FezData.isWaitlist(lfg, profilePublicData?.header)) && (
              <PrimaryActionButton
                buttonText={FezData.isWaitlist(lfg, profilePublicData.header) ? 'Leave the waitlist' : 'Leave this LFG'}
                onPress={handleMembershipPress}
                buttonColor={theme.colors.twitarrNegativeButton}
                isLoading={refreshing}
              />
            )}
            {!FezData.isParticipant(lfg, profilePublicData?.header) &&
              !FezData.isWaitlist(lfg, profilePublicData?.header) && (
                <PrimaryActionButton
                  buttonText={FezData.isFull(lfg) ? 'Join the waitlist' : 'Join this LFG'}
                  onPress={handleMembershipPress}
                  buttonColor={theme.colors.twitarrPositiveButton}
                  isLoading={refreshing}
                />
              )}
          </PaddedContentView>
        )}
        {profilePublicData && lfg.owner.userID === profilePublicData.header.userID && (
          <PaddedContentView>
            <PrimaryActionButton
              buttonText={'Edit'}
              onPress={() => navigation.push(LfgStackComponents.lfgEditScreen, {fez: lfg})}
              buttonColor={theme.colors.twitarrNeutralButton}
            />
          </PaddedContentView>
        )}
      </View>
    </AppView>
  );
};
