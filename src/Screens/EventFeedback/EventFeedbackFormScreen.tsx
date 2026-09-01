import {StackScreenProps} from '@react-navigation/stack';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {EventFeedbackForm} from '#src/Components/Forms/EventFeedbackForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {EventFeedbackHostWarningView} from '#src/Components/Views/Warnings/EventFeedbackHostWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useEventFeedbackCreateMutation} from '#src/Queries/EventFeedback/EventFeedbackMutations';
import {useEventFeedbackByUidQuery} from '#src/Queries/EventFeedback/EventFeedbackQueries';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';
import {EventFeedbackData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.eventFeedbackFormScreen>;

/**
 * Native replacement for `/eventfeedback/form/:event_uid`. Prefills from GET by UID, upserts via POST `/feedback`.
 */
export const EventFeedbackFormScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.eventFeedbackHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.eventFeedback} urlPath={'/eventfeedback'}>
          <EventFeedbackFormScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const EventFeedbackFormScreenInner = ({navigation, route}: Props) => {
  const {eventUID} = route.params;
  const {data, refetch, isLoading, isFetching} = useEventFeedbackByUidQuery({eventUID});
  const {refreshing, onRefresh} = useRefresh({refresh: refetch, isRefreshing: isFetching});
  const createMutation = useEventFeedbackCreateMutation();
  const {setSnackbarPayload} = useSnackbar();

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.eventFeedbackHelpScreen)}
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

  const initialValues: EventFeedbackData | undefined = useMemo(() => {
    if (!data) {
      return undefined;
    }
    return {
      eventUID,
      eventTitle: data.eventTitle,
      eventLocation: data.eventLocation,
      eventTime: data.eventTime,
      hostName: data.hostName,
      attendance: data.attendance,
      recapString: data.recapString,
      issuesString: data.issuesString,
    };
  }, [data, eventUID]);

  const isEdit = !!data?.reportModDate;

  const onSubmit = (values: EventFeedbackData, helpers: FormikHelpers<EventFeedbackData>) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        helpers.resetForm();
        setSnackbarPayload({
          message: isEdit ? 'Feedback updated successfully!' : 'Feedback submitted successfully!',
          messageType: 'success',
        });
        navigation.goBack();
      },
      onSettled: () => {
        helpers.setSubmitting(false);
      },
    });
  };

  if (isLoading || !initialValues) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <EventFeedbackHostWarningView />
      <ScrollingContentView
        isStack={true}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <EventFeedbackForm
            onSubmit={onSubmit}
            initialValues={initialValues}
            buttonText={isEdit ? 'Update' : 'Submit'}
            isEdit={isEdit}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
