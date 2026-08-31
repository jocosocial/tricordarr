import {StackScreenProps} from '@react-navigation/stack';
import {AxiosError} from 'axios';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect} from 'react';
import {Linking} from 'react-native';
import {Divider, Text} from 'react-native-paper';

import {HuntHeaderButtons} from '#src/Components/Buttons/HeaderButtons/HuntHeaderButtons';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {HuntPuzzleCallInForm} from '#src/Components/Forms/HuntPuzzleCallInForm';
import {HuntPuzzleCallInListItem} from '#src/Components/Lists/Items/HuntPuzzleCallInListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ContentText} from '#src/Components/Text/ContentText';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {HuntLoadErrorView} from '#src/Components/Views/Hunts/HuntLoadErrorView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {useHuntPuzzleData} from '#src/Hooks/useHuntPuzzleData';
import {useRefresh} from '#src/Hooks/useRefresh';
import {ShareContentType} from '#src/Libraries/Sharing';
import {appUrl} from '#src/Libraries/UrlParser';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useHuntPuzzleCallInMutation} from '#src/Queries/Hunts/HuntMutations';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {ErrorResponse} from '#src/Structs/ControllerStructs';
import {HuntPuzzleCallInFormValues} from '#src/Types/FormValues';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.huntPuzzleScreen>;

/**
 * Puzzle detail: markdown body, answer form if unsolved, and call-in history.
 */
export const HuntPuzzleScreen = (props: Props) => {
  return (
    <PreRegistrationScreen helpScreen={CommonStackComponents.huntHelpScreen}>
      <DisabledFeatureScreen feature={SwiftarrFeature.hunts} urlPath={`/puzzle/${props.route.params.puzzleID}`}>
        <HuntPuzzleScreenInner {...props} />
      </DisabledFeatureScreen>
    </PreRegistrationScreen>
  );
};

/**
 * Puzzle body, call-in form, and prior submissions for one puzzle.
 */
const HuntPuzzleScreenInner = ({navigation, route}: Props) => {
  const {puzzle, isLoading, isError, error, isSolved, callInsNewestFirst, refetch} = useHuntPuzzleData({
    puzzleID: route.params.puzzleID,
  });
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const callInMutation = useHuntPuzzleCallInMutation();
  const {isLoggedIn} = useSession();
  const {commonStyles} = useStyles();

  const getNavButtons = useCallback(() => {
    const state = navigation.getState();
    const previous = state.routes[state.index - 1];
    // Back already returns to the hunt; the Hunt action is for deep links and other entry points.
    const cameFromHuntScreen = previous?.name === CommonStackComponents.huntScreen;

    return (
      <HuntHeaderButtons
        onHelp={() => navigation.push(CommonStackComponents.huntHelpScreen)}
        onHuntPress={
          puzzle && !cameFromHuntScreen
            ? () => navigation.push(CommonStackComponents.huntScreen, {huntID: puzzle.huntID})
            : undefined
        }
        shareContentType={ShareContentType.puzzle}
        shareContentID={route.params.puzzleID}
      />
    );
  }, [navigation, puzzle, route.params.puzzleID]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  const onSubmit = useCallback(
    (values: HuntPuzzleCallInFormValues, helpers: FormikHelpers<HuntPuzzleCallInFormValues>) => {
      if (!puzzle) {
        helpers.setSubmitting(false);
        return;
      }
      callInMutation.mutate(
        {
          puzzleID: puzzle.puzzleID,
          huntID: puzzle.huntID,
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
    [callInMutation, puzzle],
  );

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError && !puzzle) {
    const status = (error as AxiosError<ErrorResponse>)?.response?.status;
    return (
      <HuntLoadErrorView
        resource={'puzzle'}
        status={status}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    );
  }

  if (!puzzle) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ListTitleView title={puzzle.title} subtitle={puzzle.huntTitle} />
        {!!puzzle.body && (
          <PaddedContentView padTop={true}>
            <ContentText text={puzzle.body} forceMarkdown={true} />
          </PaddedContentView>
        )}
        {isLoggedIn && !isSolved && (
          <PaddedContentView padTop={!puzzle.body}>
            <HuntPuzzleCallInForm onSubmit={onSubmit} />
          </PaddedContentView>
        )}
        {!isLoggedIn && (
          <PaddedContentView padTop={!puzzle.body}>
            <Text style={commonStyles.onBackground}>Log in to check your answers and track your progress.</Text>
            <PrimaryActionButton
              testID={'puzzleLogin-button'}
              buttonText={'Login'}
              onPress={() => Linking.openURL(appUrl('login'))}
              style={commonStyles.marginTopSmall}
            />
          </PaddedContentView>
        )}
        {callInsNewestFirst.length > 0 && (
          <ListSection>
            {callInsNewestFirst.map((callIn, index) => (
              <React.Fragment key={`${callIn.creationTime}-${callIn.rawSubmission}-${index}`}>
                {index === 0 && <Divider bold={true} />}
                <HuntPuzzleCallInListItem callIn={callIn} />
                <Divider bold={true} />
              </React.Fragment>
            ))}
          </ListSection>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
