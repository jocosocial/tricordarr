import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {HuntPuzzleListItem} from '#src/Components/Lists/Items/HuntPuzzleListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ContentText} from '#src/Components/Text/ContentText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {getEventTimeString} from '#src/Libraries/DateTime';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useHuntQuery} from '#src/Queries/Hunts/HuntQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.huntScreen>;

/**
 * Hunt detail: markdown description, unlocked puzzles, and next unlock time.
 */
export const HuntScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.huntHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.hunts} urlPath={`/hunt/${props.route.params.huntID}`}>
          <HuntScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

/**
 * Hunt detail body: description, unlocked puzzles, next unlock time.
 */
const HuntScreenInner = ({navigation, route}: Props) => {
  const {data, isLoading, refetch} = useHuntQuery({huntID: route.params.huntID});
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const {tzAtTime} = useTimeZone();
  const {appConfig} = useConfig();
  const {commonStyles} = useStyles();

  const getNavButtons = useCallback(
    () => (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.huntHelpScreen)}
            testID={'headerHelp-headerButton'}
          />
        </MaterialHeaderButtons>
      </View>
    ),
    [navigation],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
      title: data?.title ?? 'Hunt',
    });
  }, [data?.title, getNavButtons, navigation]);

  if (isLoading || !data) {
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
            {data.puzzles.map(puzzle => (
              <HuntPuzzleListItem key={puzzle.puzzleID} puzzle={puzzle} />
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
