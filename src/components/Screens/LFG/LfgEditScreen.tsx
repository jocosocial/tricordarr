import React from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LfgForm} from '../../Forms/LfgForm';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {FezFormValues} from '../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {addMinutes, differenceInMinutes} from 'date-fns';
import {getEventTimezoneOffset, getScheduleItemStartEndTime} from '../../../libraries/DateTime';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {LfgCanceledView} from '../../Views/Static/LfgCanceledView';
import {FezListActions} from '../../Reducers/Fez/FezListReducers';
import {CommonStackComponents, CommonStackParamList} from '../../Navigation/CommonScreens';
import {useQueryClient} from '@tanstack/react-query';
import {useFezUpdateMutation} from '../../Queries/Fez/FezMutations.ts';

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.lfgEditScreen>;
export const LfgEditScreen = ({route, navigation}: Props) => {
  const updateMutation = useFezUpdateMutation();
  const {setLfg, dispatchLfgList} = useTwitarr();
  const {appConfig} = useConfig();
  const offset = getEventTimezoneOffset(
    appConfig.portTimeZoneID,
    route.params.fez.startTime,
    route.params.fez.timeZoneID,
  );
  const queryClient = useQueryClient();

  const onSubmit = (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => {
    let {startTime, endTime} = getScheduleItemStartEndTime(values.startDate, values.startTime, values.duration);

    updateMutation.mutate(
      {
        fezID: route.params.fez.fezID,
        fezContentData: {
          fezType: values.fezType,
          title: values.title,
          info: values.info,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          location: values.location,
          minCapacity: Number(values.minCapacity),
          maxCapacity: Number(values.maxCapacity),
          initialUsers: [],
        },
      },
      {
        onSuccess: response => {
          setLfg(response.data);
          dispatchLfgList({
            type: FezListActions.updateFez,
            fez: response.data,
          });
          navigation.goBack();
          queryClient.invalidateQueries([`/fez/${route.params.fez.fezID}`]);
          queryClient.invalidateQueries(['/fez/owner']);
          queryClient.invalidateQueries(['/fez/joined']);
          queryClient.invalidateQueries(['/notification/global']);
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  let startDate = new Date(route.params.fez.startTime || new Date());
  startDate = addMinutes(startDate, offset);
  let endDate = new Date(route.params.fez.endTime || new Date());
  endDate = addMinutes(endDate, offset);

  const initialValues: FezFormValues = {
    title: route.params.fez.title,
    location: route.params.fez.location || '',
    fezType: route.params.fez.fezType,
    startDate: startDate,
    duration: differenceInMinutes(endDate, startDate).toString(),
    minCapacity: route.params.fez.minParticipants.toString(),
    maxCapacity: route.params.fez.maxParticipants.toString(),
    info: route.params.fez.info,
    startTime: {
      hours: startDate.getHours(),
      minutes: startDate.getMinutes(),
    },
  };

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
