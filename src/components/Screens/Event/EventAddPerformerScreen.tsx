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

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.eventAddPerformerScreen>;

export const EventAddPerformerScreen = ({navigation, route}: Props) => {
  const {data, refetch, isLoading, isFetching} = usePerformerSelfQuery();
  const theme = useAppTheme();

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <PerformerProfileWarningView />
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <PaddedContentView padTop={true}>
          <Text>
            This self-service form allows you, the organizer of a Shadow Event, to create a Bio page for yourself,
            attached to the event you'll be running. This Bio page is not publicly linked to your Twitarr user. The
            intent of this feature is to let people thinking of attending your session know a bit about you.
          </Text>
        </PaddedContentView>
        {data?.header.id ? (
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
                onPress={() => navigation.push(CommonStackComponents.performerEditScreen)}
              />
            </PaddedContentView>
            <PaddedContentView>
              <PrimaryActionButton
                buttonText={'Attach Profile to Event'}
                buttonColor={theme.colors.twitarrNeutralButton}
                onPress={() => console.log('attach')}
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
                onPress={() => console.log('delete')}
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
