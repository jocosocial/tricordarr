import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LfgStackParamList} from '../../Navigation/Stacks/LFGStackNavigator';
import {LfgStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {LfgForm} from '../../Forms/LfgForm';
import {FezFormValues} from '../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {addMinutes} from 'date-fns';
import {useFezCreateMutation} from '../../Queries/Fez/FezQueries';
import {FezType} from '../../../libraries/Enums/FezType';
import {useCruise} from '../../Context/Contexts/CruiseContext';

export type Props = NativeStackScreenProps<
  LfgStackParamList,
  LfgStackComponents.lfgCreateScreen,
  NavigatorIDs.lfgStack
>;

export const LfgCreateScreen = ({navigation}: Props) => {
  const fezMutation = useFezCreateMutation();
  const {startDate, cruiseDayToday} = useCruise();

  const onSubmit = (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => {
    console.log(values);
    helpers.setSubmitting(true);
    let fezStartTime = new Date(values.startDate);
    fezStartTime.setHours(values.startTime.hours);
    fezStartTime.setMinutes(values.startTime.minutes);

    let fezEndTime = addMinutes(fezStartTime, Number(values.duration));
    console.log('Start: ', fezStartTime, 'End: ', fezEndTime);

    fezMutation.mutate(
      {
        fezContentData: {
          fezType: values.fezType,
          title: values.title,
          info: values.info,
          startTime: fezStartTime.toISOString(),
          endTime: fezEndTime.toISOString(),
          location: values.location,
          minCapacity: Number(values.minCapacity),
          maxCapacity: Number(values.maxCapacity),
          initialUsers: [],
        },
      },
      {
        onSuccess: response => {
          navigation.replace(LfgStackComponents.lfgScreen, {
            fezID: response.data.fezID,
          });
        },
        onSettled: () => {
          helpers.setSubmitting(false);
        },
      },
    );
  };

  const apparentCruiseDate = new Date(startDate);
  apparentCruiseDate.setDate(startDate.getDate() + (cruiseDayToday - 1));

  const initialValues: FezFormValues = {
    title: '',
    location: '',
    fezType: FezType.activity,
    startDate: apparentCruiseDate.toISOString(),
    duration: '30',
    minCapacity: '2',
    maxCapacity: '2',
    info: '',
    startTime: {
      hours: new Date().getHours() + 1,
      minutes: 0,
    },
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <LfgForm onSubmit={onSubmit} initialValues={initialValues} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
