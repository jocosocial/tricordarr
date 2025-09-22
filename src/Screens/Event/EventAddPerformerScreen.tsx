import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {RefreshControl} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PerformerProfileDeleteModalView} from '#src/Components/Views/Modals/PerformerProfileDeleteModalView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {PerformerProfileWarningView} from '#src/Components/Views/Warnings/PerformerProfileWarningView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {useEventQuery} from '#src/Queries/Events/EventQueries';
import {
  usePerformerDeleteForEventMutation,
  usePerformerUpsertMutation,
} from '#src/Queries/Performer/PerformerMutations';
import {usePerformerSelfQuery} from '#src/Queries/Performer/PerformerQueries';
import {EventData, PerformerData} from '#src/Structs/ControllerStructs';
import {useAppTheme} from '#src/Styles/Theme';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.eventAddPerformerScreen>;

export const EventAddPerformerScreen = ({navigation, route}: Props) => {
  const {
    data: performerData,
    refetch: refetchPerformer,
    isLoading: isLoadingPerformer,
    isFetching: isFetchingSelf,
  } = usePerformerSelfQuery();
  const {
    data: eventData,
    refetch: refetchEvent,
    isFetching: isFetchingEvent,
    isLoading: isLoadingEvent,
  } = useEventQuery({eventID: route.params.eventID});

  const performerCreateMutation = usePerformerUpsertMutation();
  const performerRemoveMutation = usePerformerDeleteForEventMutation();
  const theme = useAppTheme();
  const {setModalVisible, setModalContent} = useModal();
  const queryClient = useQueryClient();

  const onRefresh = async () => {
    await Promise.all([refetchEvent(), refetchPerformer()]);
  };

  // const onRemove = () => {
  //   if (!performerData) {
  //     return;
  //   }
  //   performerRemoveMutation.mutate(
  //     {
  //       eventID: route.params.eventID,
  //     },
  //     {
  //       onSuccess: async () => {
  //         const invalidations = EventData.getCacheKeys(route.params.eventID)
  //           .concat(PerformerData.getCacheKeys())
  //           .map(key => {
  //             return queryClient.invalidateQueries(key);
  //           });
  //         await Promise.all(invalidations);
  //       },
  //     },
  //   );
  // };

  const onAttach = () => {
    if (!performerData) {
      return;
    }
    performerCreateMutation.mutate(
      {
        performerData: {
          ...performerData,
          name: performerData.header.name,
          eventUIDs: performerData.events.map(e => e.eventID),
          isOfficialPerformer: performerData.header.isOfficialPerformer,
          photo: {
            filename: performerData.header.photo,
          },
        },
        eventID: route.params.eventID,
      },
      {
        onSuccess: async () => {
          const invalidations = EventData.getCacheKeys(route.params.eventID)
            .concat(PerformerData.getCacheKeys())
            .map(key => {
              return queryClient.invalidateQueries({queryKey: key});
            });
          await Promise.all(invalidations);
        },
      },
    );
  };

  if (isLoadingPerformer || isLoadingEvent) {
    return <LoadingView />;
  }

  const alreadyAttached = eventData?.performers.find(p => p.id)?.id === performerData?.header.id;

  const isMutating = performerCreateMutation.isLoading || performerRemoveMutation.isLoading;
  const isRefreshing = isFetchingSelf || isFetchingEvent || isMutating;

  // Makes JSX+TypeScript happy
  const performerID = performerData?.header?.id;

  return (
    <AppView>
      <PerformerProfileWarningView />
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <Text>
            This self-service form allows you, the organizer of a Shadow Event, to create a Bio page for yourself,
            attached to the event you'll be running. This Bio page is not publicly linked to your Twitarr user. The
            intent of this feature is to let people thinking of attending your session know a bit about you.
          </Text>
        </PaddedContentView>
        {performerID ? (
          <>
            <PaddedContentView>
              <PrimaryActionButton
                buttonText={'View/Edit Performer Profile'}
                buttonColor={theme.colors.twitarrPositiveButton}
                onPress={() => {
                  navigation.push(CommonStackComponents.performerScreen, {
                    id: performerID,
                    eventID: route.params.eventID,
                  });
                }}
                disabled={isMutating}
              />
            </PaddedContentView>
            <PaddedContentView>
              <PrimaryActionButton
                buttonText={'Delete Performer Profile'}
                buttonColor={theme.colors.twitarrNegativeButton}
                onPress={() => {
                  setModalContent(<PerformerProfileDeleteModalView />);
                  setModalVisible(true);
                }}
                disabled={isMutating}
              />
            </PaddedContentView>
            <ListSubheader>Attach to Event</ListSubheader>
            <PaddedContentView padTop={true}>
              {alreadyAttached ? (
                <Text>
                  Your profile is already attached to this event. To detach it you must delete your performer profile.
                </Text>
              ) : (
                <Text>Your profile is not associated with the event.</Text>
              )}
            </PaddedContentView>
            <PaddedContentView>
              {!alreadyAttached && (
                <PrimaryActionButton
                  buttonText={'Attach to Event'}
                  buttonColor={theme.colors.twitarrNeutralButton}
                  onPress={onAttach}
                  disabled={isMutating}
                />
              )}
            </PaddedContentView>
          </>
        ) : (
          <>
            <PaddedContentView>
              <Text>You have not created a Performer Profile. You must do this first.</Text>
            </PaddedContentView>
            <PaddedContentView>
              <PrimaryActionButton
                buttonText={'Create Profile'}
                buttonColor={theme.colors.twitarrPositiveButton}
                onPress={() =>
                  navigation.push(CommonStackComponents.performerCreateScreen, {
                    performerType: 'shadow',
                    eventID: route.params.eventID,
                  })
                }
                disabled={isMutating}
              />
            </PaddedContentView>
          </>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
