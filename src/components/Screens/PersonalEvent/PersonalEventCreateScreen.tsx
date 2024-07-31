import {AppView} from '../../Views/AppView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {PersonalEventForm} from '../../Forms/PersonalEventForm.tsx';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import React from 'react';
import {FezFormValues, PersonalEventFormValues} from '../../../libraries/Types/FormValues.ts';
import {FezType} from '../../../libraries/Enums/FezType.ts';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {
  usePersonalEventCreateMutation,
  usePersonalEventUpdateMutation,
} from '../../Queries/PersonalEvent/PersonalEventMutations.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import {addMinutes} from 'date-fns';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens.tsx';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.personalEventEditScreen>;
export const PersonalEventCreateScreen = ({navigation}: Props) => {
  const {appConfig} = useConfig();
  const createMutation = usePersonalEventCreateMutation();
  const queryClient = useQueryClient();

  const onSubmit = (values: PersonalEventFormValues, helpers: FormikHelpers<PersonalEventFormValues>) => {
    let eventStartTime = new Date(values.startDate);
    eventStartTime.setHours(values.startTime.hours);
    eventStartTime.setMinutes(values.startTime.minutes);

    let eventEndTime = addMinutes(eventStartTime, Number(values.duration));

    createMutation.mutate(
      {
        personalEventContentData: {
          title: values.title,
          description: values.description,
          startTime: eventStartTime.toISOString(),
          endTime: eventEndTime.toISOString(),
          location: values.location,
          participants: values.participants.map(p => p.userID),
        },
      },
      {
        onSuccess: async response => {
          await queryClient.invalidateQueries(['/personalevents']);
          navigation.replace(CommonStackComponents.personalEventScreen, {
            eventID: response.data.personalEventID,
          });
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };
  const initialValues: PersonalEventFormValues = {
    title: '',
    startDate: new Date(),
    duration: '30',
    description: undefined,
    startTime: {
      hours: new Date().getHours() + 1,
      minutes: 0,
    },
    participants: [],
  };
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <PersonalEventForm initialValues={initialValues} onSubmit={onSubmit} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
