import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {FezCanceledView} from '#src/Components/Views/Static/FezCanceledView';
import {AppIcons} from '#src/Enums/Icons';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFezForm} from '#src/Hooks/useFezForm';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {getScheduleItemStartEndTime} from '#src/Libraries/DateTime';
import {HelpScreenComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {LfgStackComponents} from '#src/Navigation/Stacks/LFGStackNavigator';
import {useFezUpdateMutation} from '#src/Queries/Fez/FezMutations';
import {FezData} from '#src/Structs/ControllerStructs';
import {FezFormValues} from '#src/Types/FormValues';

export interface FezEditScreenBaseFormProps {
  onSubmit: (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => void;
  initialValues: FezFormValues;
}

interface FezEditScreenBaseProps {
  fez: FezData;
  renderForm: (props: FezEditScreenBaseFormProps) => React.ReactNode;
  helpScreen?: HelpScreenComponents;
  screenTitle?: string;
}

export const FezEditScreenBase = ({fez, renderForm, helpScreen, screenTitle}: FezEditScreenBaseProps) => {
  const navigation = useCommonStack();
  const updateMutation = useFezUpdateMutation();
  const {updateFez} = useFezCacheReducer();
  const dispatchScrollToTop = useScrollToTopIntent();
  const {tzAtTime} = useTimeZone();
  const {getInitialValuesFromFez} = useFezForm();

  const getNavButtons = useCallback(() => {
    if (helpScreen === undefined) return undefined;
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => (navigation.push as (name: HelpScreenComponents) => void)(helpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [helpScreen, navigation]);

  useEffect(() => {
    const options: {title?: string; headerRight?: () => React.ReactNode} = {};
    if (screenTitle !== undefined) options.title = screenTitle;
    if (helpScreen !== undefined) options.headerRight = getNavButtons;
    navigation.setOptions(options);
  }, [navigation, screenTitle, helpScreen, getNavButtons]);

  const onSubmit = (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => {
    const {startTime, endTime} = getScheduleItemStartEndTime(
      values.startDate,
      values.startTime,
      values.duration,
      tzAtTime(values.startDate),
    );

    updateMutation.mutate(
      {
        fezID: fez.fezID,
        fezContentData: {
          title: values.title,
          info: values.info,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          location: values.location,
          fezType: values.fezType,
          minCapacity: Number(values.minCapacity),
          maxCapacity: Number(values.maxCapacity),
          initialUsers: [],
        },
      },
      {
        onSuccess: response => {
          updateFez(fez.fezID, response.data);
          dispatchScrollToTop(LfgStackComponents.lfgListScreen, {key: 'endpoint', value: 'joined'});
          navigation.goBack();
        },
        onSettled: () => helpers.setSubmitting(false),
      },
    );
  };

  const initialValues = getInitialValuesFromFez(fez);

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        {fez.cancelled && <FezCanceledView update={true} fezType={fez.fezType} />}
        <PaddedContentView padTop={true}>{renderForm({onSubmit, initialValues})}</PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
