import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {HuntPuzzleCallInForm} from '#src/Components/Forms/HuntPuzzleCallInForm';
import {HuntPuzzleCallInListItem} from '#src/Components/Lists/Items/HuntPuzzleCallInListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ContentText} from '#src/Components/Text/ContentText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useHuntPuzzleCallInMutation} from '#src/Queries/Hunts/HuntMutations';
import {useHuntPuzzleQuery} from '#src/Queries/Hunts/HuntQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {HuntPuzzleDetailData} from '#src/Structs/ControllerStructs';
import {HuntPuzzleCallInFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.huntPuzzleScreen>;

/**
 * Puzzle detail: markdown body, answer form if unsolved, and call-in history.
 */
export const HuntPuzzleScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.huntHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.hunts} urlPath={`/puzzle/${props.route.params.puzzleID}`}>
          <HuntPuzzleScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

/**
 * Puzzle body, call-in form, and prior submissions for one puzzle.
 */
const HuntPuzzleScreenInner = ({navigation, route}: Props) => {
  const {data, isLoading, refetch} = useHuntPuzzleQuery({puzzleID: route.params.puzzleID});
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const callInMutation = useHuntPuzzleCallInMutation();

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
      title: data?.title ?? 'Puzzle',
    });
  }, [data?.title, getNavButtons, navigation]);

  const onSubmit = useCallback(
    (values: HuntPuzzleCallInFormValues, helpers: FormikHelpers<HuntPuzzleCallInFormValues>) => {
      if (!data) {
        helpers.setSubmitting(false);
        return;
      }
      callInMutation.mutate(
        {
          puzzleID: data.puzzleID,
          huntID: data.huntID,
          answer: values.puzzleAnswer.trim(),
        },
        {
          onSuccess: () => {
            helpers.resetForm();
          },
          onSettled: () => helpers.setSubmitting(false),
        },
      );
    },
    [callInMutation, data],
  );

  if (isLoading || !data) {
    return <LoadingView />;
  }

  const solved = HuntPuzzleDetailData.isSolved(data);

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListTitleView title={data.title} subtitle={data.huntTitle} />
        {!!data.body && (
          <PaddedContentView padTop={true}>
            <ContentText text={data.body} forceMarkdown={true} />
          </PaddedContentView>
        )}
        {!solved && (
          <PaddedContentView padTop={!data.body}>
            <HuntPuzzleCallInForm onSubmit={onSubmit} />
          </PaddedContentView>
        )}
        {data.callIns.length > 0 && (
          <ListSection>
            {data.callIns.map((callIn, index) => (
              <HuntPuzzleCallInListItem
                key={`${callIn.creationTime}-${callIn.rawSubmission}-${index}`}
                callIn={callIn}
              />
            ))}
          </ListSection>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
