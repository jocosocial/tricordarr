import {QueryClient, useQueryClient} from '@tanstack/react-query';
import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {AppIcons} from '#src/Enums/Icons';
import {getScheduleItemStartEndTime} from '#src/Libraries/DateTime';
import {HelpScreenComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useFezCreateMutation} from '#src/Queries/Fez/FezMutations';
import {FezContentData, FezData} from '#src/Structs/ControllerStructs';
import {FezFormValues} from '#src/Types/FormValues';

export interface FezCreateScreenBaseFormProps {
  onSubmit: (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => void;
  initialValues: FezFormValues;
}

interface FezCreateScreenBaseProps {
  renderForm: (props: FezCreateScreenBaseFormProps) => React.ReactNode;
  initialValues: FezFormValues;
  buildFezContentData: (values: FezFormValues, startTime: Date, endTime: Date) => FezContentData;
  onSuccess: (response: FezData, queryClient: QueryClient) => Promise<void>;
  helpScreen?: HelpScreenComponents;
  screenTitle?: string;
}

export const FezCreateScreenBase = ({
  renderForm,
  initialValues,
  buildFezContentData,
  onSuccess,
  helpScreen,
  screenTitle,
}: FezCreateScreenBaseProps) => {
  const navigation = useCommonStack();
  const createMutation = useFezCreateMutation();
  const queryClient = useQueryClient();

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
    helpers.setSubmitting(true);
    const {startTime, endTime} = getScheduleItemStartEndTime(
      values.startDate,
      values.startTime,
      values.duration,
    );
    const fezContentData = buildFezContentData(values, startTime, endTime);

    createMutation.mutate(
      {fezContentData},
      {
        onSuccess: async response => {
          await onSuccess(response.data, queryClient);
        },
        onSettled: () => {
          helpers.setSubmitting(false);
        },
      },
    );
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>{renderForm({onSubmit, initialValues})}</PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
