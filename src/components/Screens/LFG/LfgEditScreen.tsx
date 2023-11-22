import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LfgStackParamList} from '../../Navigation/Stacks/LFGStackNavigator';
import {LfgStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {LfgForm} from '../../Forms/LfgForm';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {FezFormValues} from '../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {addMinutes, differenceInMinutes} from 'date-fns';
import {getFezTimezoneOffset} from '../../../libraries/DateTime';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useFezUpdateMutation} from '../../Queries/Fez/FezQueries';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {LfgCanceledView} from '../../Views/LfgCanceledView';

export type Props = NativeStackScreenProps<LfgStackParamList, LfgStackComponents.lfgEditScreen, NavigatorIDs.lfgStack>;

export const LfgEditScreen = ({route, navigation}: Props) => {
  const updateMutation = useFezUpdateMutation();
  const {setFez} = useTwitarr();
  const {appConfig} = useConfig();
  const offset = getFezTimezoneOffset(route.params.fez, appConfig.portTimeZoneID);

  const onSubmit = (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => {
    console.log(values);
    let fezStartTime = new Date(values.startDate);
    fezStartTime.setHours(values.startTime.hours);
    fezStartTime.setMinutes(values.startTime.minutes);

    let fezEndTime = addMinutes(fezStartTime, Number(values.duration));

    updateMutation.mutate(
      {
        fezID: route.params.fez.fezID,
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
          console.log('ZZZZZZZZZZ RESPONSE DATA', response.data.cancelled);
          setFez(response.data);
          navigation.goBack();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  console.log('Start', route.params.fez.startTime, 'End', route.params.fez.endTime);
  console.log('Fez has offset', offset);
  let startDate = new Date(route.params.fez.startTime || new Date());
  startDate = addMinutes(startDate, offset);
  let endDate = new Date(route.params.fez.endTime || new Date());
  endDate = addMinutes(endDate, offset);
  console.log('Duration', differenceInMinutes(endDate, startDate).toString());

  const initialValues: FezFormValues = {
    title: route.params.fez.title,
    location: route.params.fez.location || '',
    fezType: route.params.fez.fezType,
    startDate: startDate.toISOString(),
    duration: differenceInMinutes(endDate, startDate).toString(),
    minCapacity: route.params.fez.minParticipants.toString(),
    maxCapacity: route.params.fez.maxParticipants.toString(),
    info: route.params.fez.info,
    startTime: {
      hours: startDate.getHours(),
      minutes: startDate.getMinutes(),
    },
  };

  console.log(initialValues);

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        {route.params.fez.cancelled && <LfgCanceledView update={true} />}
        <PaddedContentView padTop={true}>
          <LfgForm onSubmit={onSubmit} initialValues={initialValues} buttonText={'Save'} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
