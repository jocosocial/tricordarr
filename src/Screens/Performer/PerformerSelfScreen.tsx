import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {usePerformerCacheReducer} from '#src/Hooks/Performer/usePerformerCacheReducer';
import {useRefresh} from '#src/Hooks/useRefresh';
import {alertDeleteProfile} from '#src/Libraries/Alerts/PerformerAlerts';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {usePerformerDeleteMutation} from '#src/Queries/Performer/PerformerMutations';
import {usePerformerSelfQuery} from '#src/Queries/Performer/PerformerQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {NoAccessScreen} from '#src/Screens/Checkpoint/NoAccessScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.performerSelfScreen>;

/**
 * Lets a user with the Shadow Event Performer role (or TwitarrTeam) manage their own performer
 * bio without attaching it to an event. TwitarrTeam can link it to events later.
 */
export const PerformerSelfScreen = (props: Props) => {
  const {hasPerformerSelfEditor} = useRoles();
  const {hasTwitarrTeam} = usePrivilege();

  return (
    <LoggedInScreen>
      <DisabledFeatureScreen feature={SwiftarrFeature.performers} urlPath={'/performer/shadow/self'}>
        <NoAccessScreen hasAccess={hasPerformerSelfEditor || hasTwitarrTeam}>
          <PerformerSelfScreenInner {...props} />
        </NoAccessScreen>
      </DisabledFeatureScreen>
    </LoggedInScreen>
  );
};

const PerformerSelfScreenInner = ({navigation}: Props) => {
  const {data: performerData, refetch, isLoading, isRefetching} = usePerformerSelfQuery();
  const performerDeleteMutation = usePerformerDeleteMutation();
  const {deletePerformer} = usePerformerCacheReducer();
  const {theme} = useAppTheme();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch, isRefreshing: isRefetching});

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
   * Confirm, then delete the profile and remove it from every cache it appears in.
   */
  const onDeleteProfile = () => {
    if (!performerData) {
      return;
    }
    const deletedPerformer = performerData;
    alertDeleteProfile(() => {
      performerDeleteMutation.mutate(
        {},
        {
          onSuccess: () => {
            deletePerformer(deletedPerformer);
          },
        },
      );
    });
  };

  if (isLoading) {
    return (
      <AppView>
        <LoadingView />
      </AppView>
    );
  }

  // The server returns an empty profile (no id) when the user hasn't made one yet.
  const performerID = performerData?.header?.id;

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <Text>
            This form lets you create a Shadow Performer Bio page for yourself without attaching it to an event. This
            Bio page is not publicly linked to your Twitarr user. The TwitarrTeam can attach it to the events you'll be
            running so that people thinking of attending know a bit about you.
          </Text>
        </PaddedContentView>
        {performerID ? (
          <>
            <PaddedContentView>
              <PrimaryActionButton
                testID={'viewEditPerformerProfile-button'}
                buttonText={'View/Edit Performer Profile'}
                buttonColor={theme.colors.twitarrPositiveButton}
                onPress={() => navigation.push(CommonStackComponents.performerScreen, {id: performerID})}
                disabled={performerDeleteMutation.isPending}
              />
            </PaddedContentView>
            <PaddedContentView>
              <PrimaryActionButton
                testID={'deletePerformerProfile-button'}
                buttonText={'Delete Performer Profile'}
                buttonColor={theme.colors.twitarrNegativeButton}
                onPress={onDeleteProfile}
                disabled={performerDeleteMutation.isPending}
                isLoading={performerDeleteMutation.isPending}
              />
            </PaddedContentView>
          </>
        ) : (
          <>
            <PaddedContentView>
              <Text>You have not created a Performer Profile.</Text>
            </PaddedContentView>
            <PaddedContentView>
              <PrimaryActionButton
                testID={'createProfile-button'}
                buttonText={'Create Profile'}
                buttonColor={theme.colors.twitarrPositiveButton}
                onPress={() => navigation.push(CommonStackComponents.performerCreateScreen, {performerType: 'shadow'})}
              />
            </PaddedContentView>
          </>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
