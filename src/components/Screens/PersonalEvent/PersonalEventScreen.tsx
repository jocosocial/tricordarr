import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {RefreshControl, StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {DataFieldListItem} from '../../Lists/Items/DataFieldListItem';
import {ListSection} from '../../Lists/ListSection';
import {AppIcon} from '../../Icons/AppIcon';
import {getDurationString} from '../../../libraries/DateTime';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LoadingView} from '../../Views/Static/LoadingView';
import {guessDeckNumber} from '../../../libraries/Ship';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {HeaderEditButton} from '../../Buttons/HeaderButtons/HeaderEditButton.tsx';
import {PersonalEventScreenActionsMenu} from '../../Menus/PersonalEvents/PersonalEventScreenActionsMenu.tsx';
import {UserChipsListItem} from '../../Lists/Items/UserChipsListItem.tsx';
import {FezType} from '../../../libraries/Enums/FezType.ts';
import {useFezQuery} from '../../Queries/Fez/FezQueries.ts';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.personalEventScreen>;

export const PersonalEventScreen = ({navigation, route}: Props) => {
  const {data, refetch, isFetching} = useFezQuery({
    fezID: route.params.eventID,
  });
  const eventData = data?.pages[0];
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    item: {
      ...commonStyles.paddingHorizontal,
    },
    icon: {
      ...commonStyles.paddingTopSmall,
    },
  });

  const handleLocation = () => {
    if (!eventData) {
      return;
    }
    const deck = guessDeckNumber(eventData.location);
    navigation.push(CommonStackComponents.mapScreen, {
      deckNumber: deck,
    });
  };

  const getIcon = (icon: string) => <AppIcon icon={icon} style={styles.icon} />;

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons left HeaderButtonComponent={MaterialHeaderButton}>
          {eventData && (
            <>
              <HeaderEditButton
                iconName={AppIcons.eventEdit}
                onPress={() =>
                  navigation.push(CommonStackComponents.personalEventEditScreen, {
                    personalEvent: eventData,
                  })
                }
              />
              <PersonalEventScreenActionsMenu event={eventData} />
            </>
          )}
        </HeaderButtons>
      </View>
    );
  }, [eventData, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        {eventData && (
          <PaddedContentView padSides={false}>
            <ListSection>
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.events)}
                description={eventData.title}
                title={'Title'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.time)}
                description={getDurationString(eventData.startTime, eventData.endTime, eventData.timeZoneID, true)}
                title={'Date'}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.map)}
                description={eventData.location}
                title={'Location'}
                onPress={handleLocation}
              />
              <DataFieldListItem
                itemStyle={styles.item}
                left={() => getIcon(AppIcons.description)}
                description={eventData.info}
                title={'Description'}
              />
              {eventData.fezType === FezType.privateEvent && (
                <UserChipsListItem
                  users={eventData.members?.participants}
                  itemStyle={styles.item}
                  title={'Participants'}
                  onPress={() =>
                    navigation.push(CommonStackComponents.lfgParticipationScreen, {
                      fezID: eventData.fezID,
                    })
                  }
                />
              )}
            </ListSection>
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
