import {FormikHelpers} from 'formik';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {FezCanceledView} from '#src/Components/Views/Static/FezCanceledView';
import {TimezoneWarningView} from '#src/Components/Views/Warnings/TimezoneWarningView';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFezForm} from '#src/Hooks/Fez/useFezForm';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {getScheduleItemStartEndTime} from '#src/Libraries/DateTime';
import {HelpScreenComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {LfgStackComponents} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';
import {useFezUpdateMutation} from '#src/Queries/Fez/FezMutations';
import {useFezParticipantMutation} from '#src/Queries/Fez/Management/FezManagementUserMutations';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {FezData} from '#src/Structs/ControllerStructs';
import {FezFormValues} from '#src/Types/FormValues';

export interface FezEditScreenBaseFormProps {
  onSubmit: (values: FezFormValues, helpers: FormikHelpers<FezFormValues>) => void | Promise<void>;
  initialValues: FezFormValues;
}

interface FezEditScreenBaseProps {
  fez: FezData;
  renderForm: (props: FezEditScreenBaseFormProps) => React.ReactNode;
  helpScreen?: HelpScreenComponents;
  screenTitle?: string;
  intent?: 'moderate';
}

export const FezEditScreenBase = ({fez, renderForm, helpScreen, screenTitle, intent}: FezEditScreenBaseProps) => {
  const navigation = useCommonStack();
  const updateMutation = useFezUpdateMutation();
  const participantMutation = useFezParticipantMutation();
  const {updateFez, updateFezModeration, updateMembership, invalidateFez} = useFezCacheReducer();
  const dispatchScrollToTop = useScrollToTopIntent();
  const {getInitialValuesFromFez, personalEventRequiresPrivate} = useFezForm();
  const {data: profilePublicData} = useUserProfileQuery();

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

  /**
   * Submit the edited fez, then patch fez caches and (when launched from
   * the moderate screen) the fez moderation cache before going back.
   *
   * A personalEvent that gains participants or is made unlisted is converted into a privateEvent.
   * The conversion is one-way and uses the same personalEventRequiresPrivate rule as creating one.
   * Swiftarr's update ignores `initialUsers`, so any invitees are added one at a time after the
   * conversion succeeds.
   */
  const onSubmit = async (values: FezFormValues) => {
    const {startTime, endTime} = getScheduleItemStartEndTime(values.startDate, values.startTime, values.duration);
    const convertToPrivate = fez.fezType === FezType.personalEvent && personalEventRequiresPrivate(values);

    let updatedFez;
    try {
      const response = await updateMutation.mutateAsync({
        fezID: fez.fezID,
        fezContentData: {
          title: values.title,
          info: values.info,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          location: values.location,
          fezType: convertToPrivate ? FezType.privateEvent : values.fezType,
          // Seeded from the fez, so an unchanged value is a no-op server-side. Only the personal
          // event form can actually change it; every other type rejects a change.
          visibility: values.visibility,
          minCapacity: Number(values.minCapacity),
          maxCapacity: Number(values.maxCapacity),
          initialUsers: [],
        },
      });
      updatedFez = response.data;
    } catch {
      // useTokenAuthMutation surfaces the error in a snackbar.
      return;
    }
    updateFez(fez.fezID, updatedFez);
    if (intent === 'moderate' && profilePublicData) {
      updateFezModeration(fez.fezID, fez, updatedFez, profilePublicData.header);
    }

    if (convertToPrivate && values.initialUsers.length > 0) {
      try {
        for (const user of values.initialUsers) {
          const response = await participantMutation.mutateAsync({
            fezID: fez.fezID,
            userID: user.userID,
            action: 'add',
          });
          updatedFez = response.data;
        }
        updateMembership(fez.fezID, updatedFez);
      } catch {
        // The conversion landed but not every invitee did. Resync rather than guess at what the
        // server has; the error itself is surfaced in a snackbar.
        invalidateFez(fez.fezID);
      }
    }

    dispatchScrollToTop(LfgStackComponents.lfgListScreen, {key: 'endpoint', value: 'joined'});
    navigation.goBack();
  };

  const initialValues = getInitialValuesFromFez(fez);

  return (
    <AppView>
      <TimezoneWarningView />
      <ScrollingContentView isStack={true}>
        {fez.cancelled && <FezCanceledView update={true} fezType={fez.fezType} />}
        <PaddedContentView padTop={true}>{renderForm({onSubmit, initialValues})}</PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
