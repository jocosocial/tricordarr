import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PerformerTypeButtons} from '#src/Components/Buttons/SegmentedButtons/PerformerTypeButtons';
import {EventLinkedPerformerListItem} from '#src/Components/Lists/Items/Event/EventLinkedPerformerListItem';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {PerformerSearchBar} from '#src/Components/Search/PerformerSearchBar';
import {EventPerformerListItemSwipeable} from '#src/Components/Swipeables/EventPerformerListItemSwipeable';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {EventType} from '#src/Enums/EventType';
import {AppIcons} from '#src/Enums/Icons';
import {usePerformerCacheReducer} from '#src/Hooks/Performer/usePerformerCacheReducer';
import {alertLinkPerformer} from '#src/Libraries/Alerts/PerformerAlerts';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventQuery} from '#src/Queries/Events/EventQueries';
import {usePerformerEventLinkMutation} from '#src/Queries/Performer/PerformerMutations';
import {PerformerType} from '#src/Queries/Performer/PerformerQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {NoAccessScreen} from '#src/Screens/Checkpoint/NoAccessScreen';
import {PerformerHeaderData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.eventPerformersManageScreen>;

/**
 * TwitarrTeam: manually link performers (official or shadow) to an event and unlink them.
 * App equivalent of the site's `/admin/performer/event/:eventID` page.
 */
export const EventPerformersManageScreen = (props: Props) => {
  const {hasTwitarrTeam} = usePrivilege();

  return (
    <LoggedInScreen>
      <DisabledFeatureScreen
        feature={SwiftarrFeature.performers}
        urlPath={`/admin/performer/event/${props.route.params.eventID}`}>
        <NoAccessScreen hasAccess={hasTwitarrTeam}>
          <EventPerformersManageScreenInner {...props} />
        </NoAccessScreen>
      </DisabledFeatureScreen>
    </LoggedInScreen>
  );
};

const EventPerformersManageScreenInner = ({navigation, route}: Props) => {
  const {data: eventData, isLoading} = useEventQuery({eventID: route.params.eventID});
  // Undefined until the user picks a type; until then search the type matching the event.
  const [selectedPerformerType, setSelectedPerformerType] = useState<PerformerType>();
  const performerType: PerformerType =
    selectedPerformerType ?? (eventData?.eventType === EventType.shadow ? 'shadow' : 'official');
  const {mutate: linkMutate, isPending: linkIsPending} = usePerformerEventLinkMutation();
  const {linkPerformerToEvent} = usePerformerCacheReducer();
  const {setSnackbarPayload} = useSnackbar();
  const {commonStyles} = useStyles();

  // Not PaddedContentView: it applies flex:1, which would starve the search results list.
  // Same reason as PerformerSearchScreen.
  const styles = useMemo(
    () =>
      StyleSheet.create({
        buttonContainer: {
          ...commonStyles.paddingSmall,
        },
      }),
    [commonStyles.paddingSmall],
  );

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.performerHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  /**
   * Search result tap: confirm, then link the performer to this event. Ignored while a
   * link is in flight so a second tap can't send a duplicate request.
   */
  const onSelectPerformer = useCallback(
    (header: PerformerHeaderData) => {
      const performerID = header.id;
      if (!eventData || !performerID || linkIsPending) {
        return;
      }
      if (eventData.performers.some(p => p.id === performerID)) {
        setSnackbarPayload({message: `${header.name} is already linked to this event.`, messageType: 'info'});
        return;
      }
      alertLinkPerformer(header.name, eventData.title, () => {
        linkMutate(
          {performerID, eventID: eventData.eventID},
          {
            onSuccess: () => linkPerformerToEvent(header, eventData),
          },
        );
      });
    },
    [eventData, linkIsPending, setSnackbarPayload, linkMutate, linkPerformerToEvent],
  );

  if (isLoading || !eventData) {
    return (
      <AppView>
        <LoadingView />
      </AppView>
    );
  }

  return (
    <AppView>
      <ScrollingContentView isStack={true} overScroll={true}>
        <ListTitleView title={eventData.title} subtitle={eventData.location} />
        <PaddedContentView padTop={true}>
          <Text>
            Manage manually linked performers for this event. This should only be done in consultation with THO.
          </Text>
        </PaddedContentView>
        <ListSubheader>Linked Performers</ListSubheader>
        {eventData.performers.length === 0 ? (
          <View style={styles.buttonContainer}>
            <Text>No performers are linked to this event.</Text>
          </View>
        ) : (
          eventData.performers.map(performer => (
            <EventPerformerListItemSwipeable
              key={performer.id ?? performer.name}
              performer={performer}
              eventID={eventData.eventID}>
              <EventLinkedPerformerListItem performer={performer} />
            </EventPerformerListItemSwipeable>
          ))
        )}
        <ListSubheader>Link Performer</ListSubheader>
        <View style={styles.buttonContainer}>
          <PerformerTypeButtons performerType={performerType} setPerformerType={setSelectedPerformerType} />
        </View>
        <PerformerSearchBar performerType={performerType} onPress={onSelectPerformer} />
      </ScrollingContentView>
    </AppView>
  );
};
