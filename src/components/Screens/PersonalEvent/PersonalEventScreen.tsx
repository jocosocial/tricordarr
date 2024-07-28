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
import {usePersonalEventQuery} from '../../Queries/PersonalEventQueries.tsx';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton.tsx';
import {EventScreenActionsMenu} from '../../Menus/Events/EventScreenActionsMenu.tsx';
import {HeaderEditButton} from '../../Buttons/HeaderButtons/HeaderEditButton.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.personalEventScreen>;

export const PersonalEventScreen = ({navigation, route}: Props) => {
  const {
    data: eventData,
    refetch,
    isFetching,
  } = usePersonalEventQuery({
    eventID: route.params.eventID,
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
              <HeaderEditButton iconName={AppIcons.eventEdit} onPress={() => console.log('woo')} />
              <EventScreenActionsMenu event={eventData} />
            </>
          )}
        </HeaderButtons>
      </View>
    );
  }, [eventData, handleFavorite, navigation, theme.colors.twitarrYellow]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (!eventData) {
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
              {eventData.description && (
                <DataFieldListItem
                  itemStyle={styles.item}
                  left={() => getIcon(AppIcons.description)}
                  description={eventData.description}
                  title={'Description'}
                />
              )}
            </ListSection>
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
