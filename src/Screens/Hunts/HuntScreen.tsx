import {useIsFocused} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {AxiosError} from 'axios';
import React, {useCallback, useEffect} from 'react';
import {Divider, Text} from 'react-native-paper';

import {HuntHeaderButtons} from '#src/Components/Buttons/HeaderButtons/HuntHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {HuntPuzzleListItem} from '#src/Components/Lists/Items/HuntPuzzleListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ContentText} from '#src/Components/Text/ContentText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HuntLoadErrorView} from '#src/Components/Views/Hunts/HuntLoadErrorView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {getEventTimeString} from '#src/Libraries/DateTime';
import {ShareContentType} from '#src/Libraries/Sharing';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useHuntQuery} from '#src/Queries/Hunts/HuntQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ErrorResponse} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.huntScreen>;

/** Floor so a device clock ahead of the server cannot pin this to a 2s poll. */
const MIN_UNLOCK_REFETCH_MS = 30_000;

/**
 * Hunt detail: markdown description, unlocked puzzles, and next unlock time.
 */
export const HuntScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.huntHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.hunts} urlPath={`/hunt/${props.route.params.huntID}`}>
        <HuntScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

/**
 * Hunt detail body: description, unlocked puzzles, next unlock time.
 */
const HuntScreenInner = ({navigation, route}: Props) => {
  const isFocused = useIsFocused();
  const {data, isLoading, isError, error, refetch} = useHuntQuery({
    huntID: route.params.huntID,
    options: {
      // Schedule the next fetch so newly unlocked puzzles appear without pull-to-refresh.
      refetchInterval: query => {
        // Background screens should not keep hitting the API.
        if (!isFocused) {
          return false;
        }
        const nextUnlockTime = query.state.data?.nextUnlockTime;
        // No pending unlock: either everything is out or nothing is scheduled.
        if (!nextUnlockTime) {
          return false;
        }
        const msUntilUnlock = new Date(nextUnlockTime).getTime() - Date.now();
        // Unlock is due (or our clock is ahead of the server). Poll at the floor until
        // the response includes the new puzzle; a shorter interval would tight-loop on skew.
        if (msUntilUnlock <= 0) {
          return MIN_UNLOCK_REFETCH_MS;
        }
        // Wait until the advertised unlock, but never faster than the floor — a device
        // a few seconds ahead would otherwise collapse this into a 2s poll.
        return Math.max(msUntilUnlock, MIN_UNLOCK_REFETCH_MS);
      },
    },
  });
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const {tzAtTime} = useTimeZone();
  const {appConfig} = useConfig();
  const {commonStyles} = useStyles();

  const getNavButtons = useCallback(
    () => (
      <HuntHeaderButtons
        onHelp={() => navigation.push(CommonStackComponents.huntHelpScreen)}
        shareContentType={ShareContentType.hunt}
        shareContentID={route.params.huntID}
      />
    ),
    [navigation, route.params.huntID],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError && !data) {
    return (
      <HuntLoadErrorView
        resource={'hunt'}
        status={(error as AxiosError<ErrorResponse>)?.response?.status}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    );
  }

  if (!data) {
    return <LoadingView />;
  }

  const nextUnlockLabel = data.nextUnlockTime
    ? getEventTimeString(
        data.nextUnlockTime,
        tzAtTime(new Date(data.nextUnlockTime)),
        appConfig.schedule.timeZoneLabelMode,
      )
    : undefined;

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListTitleView title={data.title} />
        {!!data.description && (
          <PaddedContentView padTop={true}>
            <ContentText text={data.description} forceMarkdown={true} />
          </PaddedContentView>
        )}
        {data.puzzles.length > 0 && (
          <ListSection>
            {data.puzzles.map((puzzle, index) => (
              <React.Fragment key={puzzle.puzzleID}>
                {index === 0 && <Divider bold={true} />}
                <HuntPuzzleListItem puzzle={puzzle} />
                <Divider bold={true} />
              </React.Fragment>
            ))}
          </ListSection>
        )}
        {!!nextUnlockLabel && (
          <PaddedContentView padTop={data.puzzles.length === 0}>
            <Text style={commonStyles.onBackground}>Next puzzle unlocks at {nextUnlockLabel}</Text>
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
