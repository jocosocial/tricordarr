import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';
import {AppView} from '../../Views/AppView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {usePerformerSelfQuery} from '../../Queries/Performer/PerformerQueries.ts';
import {LoadingView} from '../../Views/Static/LoadingView.tsx';
import React from 'react';
import {Text} from 'react-native-paper';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {RefreshControl} from 'react-native';
import {PerformerProfileWarningView} from '../../Views/Warnings/PerformerProfileWarningView.tsx';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton.tsx';
import {useAppTheme} from '../../../styles/Theme.ts';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {PerformerProfileDeleteModalView} from '../../Views/Modals/PerformerProfileDeleteModalView.tsx';
import {useEventQuery} from '../../Queries/Events/EventQueries.ts';
import {usePerformerCreateMutation} from '../../Queries/Performer/PerformerMutations.ts';
import {EventData, PerformerData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useQueryClient} from '@tanstack/react-query';

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

  const performerCreateMutation = usePerformerCreateMutation();
  const theme = useAppTheme();
  const {setModalVisible, setModalContent} = useModal();
  const queryClient = useQueryClient();

  const onRefresh = async () => {
    await Promise.all([refetchEvent(), refetchPerformer()]);
  };

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
              return queryClient.invalidateQueries(key);
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

  return (
    <AppView>
      <PerformerProfileWarningView />
      <ScrollingContentView
        isStack={true}
        refreshControl={
          <RefreshControl
            refreshing={isFetchingSelf || isFetchingEvent || performerCreateMutation.isLoading}
            onRefresh={onRefresh}
          />
        }>
        <PaddedContentView padTop={true}>
          <Text>
            This self-service form allows you, the organizer of a Shadow Event, to create a Bio page for yourself,
            attached to the event you'll be running. This Bio page is not publicly linked to your Twitarr user. The
            intent of this feature is to let people thinking of attending your session know a bit about you.
          </Text>
        </PaddedContentView>
        {performerData?.header.id ? (
          <>
            <PaddedContentView>
              <Text>
                You have already created a Performer Profile. You can either edit it (for all events you're hosting)
                and/or attach it to this event.
              </Text>
            </PaddedContentView>
            <PaddedContentView>
              <PrimaryActionButton
                buttonText={'View or Edit Profile'}
                buttonColor={theme.colors.twitarrPositiveButton}
                onPress={() => navigation.push(CommonStackComponents.performerSelfScreen)}
              />
            </PaddedContentView>
            <PaddedContentView>
              <PrimaryActionButton
                buttonText={alreadyAttached ? 'Already Attached' : 'Attach Profile to Event'}
                buttonColor={theme.colors.twitarrNeutralButton}
                onPress={onAttach}
                disabled={alreadyAttached}
              />
            </PaddedContentView>
            <PaddedContentView>
              <Text>
                If you've decided you don't want an event organizer page after all, tap "Delete Profile" to remove it.
                If you've accidentally attached to the wrong event, you'll have to delete your profile and re-create it
                (sorry!).
              </Text>
            </PaddedContentView>
            <PaddedContentView>
              <PrimaryActionButton
                buttonText={'Delete Profile'}
                buttonColor={theme.colors.twitarrNegativeButton}
                onPress={() => {
                  setModalContent(<PerformerProfileDeleteModalView />);
                  setModalVisible(true);
                }}
              />
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
              />
            </PaddedContentView>
          </>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
