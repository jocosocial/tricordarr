import {useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {LfgForm} from '#src/Components/Forms/LfgForm';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {getApparentCruiseDate, getScheduleItemStartEndTime} from '#src/Libraries/DateTime';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useFezCreateMutation} from '#src/Queries/Fez/FezMutations';
import {FezFormValues} from '#src/Types/FormValues';

interface Props {
  title?: string;
  info?: string;
  location?: string;
  fezType?: FezType;
  duration?: number;
  minCapacity?: number;
  maxCapacity?: number;
}

export const LfgCreateScreenBase = ({
  title = '',
  info = '',
  location = '',
  fezType = FezType.activity,
  duration = 30,
  minCapacity = 2,
  maxCapacity = 2,
}: Props) => {
  const navigation = useCommonStack();
  const fezMutation = useFezCreateMutation();
  const {startDate, adjustedCruiseDayToday} = useCruise();
  const queryClient = useQueryClient();

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.lfgCreateHelpScreen)}
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

  const onSubmit = (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => {
    helpers.setSubmitting(true);
    let {startTime, endTime} = getScheduleItemStartEndTime(values.startDate, values.startTime, values.duration);

    fezMutation.mutate(
      {
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
        onSuccess: async response => {
          navigation.replace(CommonStackComponents.lfgScreen, {
            fezID: response.data.fezID,
          });
          await queryClient.invalidateQueries({queryKey: ['/notification/global']});
        },
        onSettled: () => {
          helpers.setSubmitting(false);
        },
      },
    );
  };

  // @TODO make this form (and the form components) more generic to take types
  const initialValues: FezFormValues = {
    title: title,
    location: location,
    fezType: fezType,
    startDate: getApparentCruiseDate(startDate, adjustedCruiseDayToday),
    duration: String(duration),
    minCapacity: String(minCapacity),
    maxCapacity: String(maxCapacity),
    info: info,
    startTime: {
      hours: new Date().getHours() + 1,
      minutes: 0,
    },
    initialUsers: [],
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
