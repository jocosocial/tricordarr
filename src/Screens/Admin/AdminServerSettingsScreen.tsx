import {Formik, FormikHelpers} from 'formik';
import React from 'react';
import * as Yup from 'yup';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {DirtyDetectionField} from '#src/Components/Forms/Fields/DirtyDetectionField';
import {PickerField} from '#src/Components/Forms/Fields/PickerField';
import {TextField} from '#src/Components/Forms/Fields/TextField';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {ServerSettingsReadOnlyWarningView} from '#src/Components/Views/Warnings/ServerSettingsReadOnlyWarningView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {EventNotificationSetting} from '#src/Enums/EventNotificationSetting';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {useAdminAccess} from '#src/Hooks/Admin/useAdminAccess';
import {useAdminHelpButton} from '#src/Hooks/Admin/useAdminHelpButton';
import {useRefresh} from '#src/Hooks/useRefresh';
import {IntegerValidation} from '#src/Libraries/ValidationSchema';
import {useAdminSettingsUpdateMutation} from '#src/Queries/Admin/SettingsMutations';
import {useAdminSettingsQuery} from '#src/Queries/Admin/SettingsQueries';
import {AdminAccessScreen} from '#src/Screens/Checkpoint/AdminAccessScreen';
import {SettingsAdminData, SettingsUpdateData} from '#src/Structs/AdminControllerStructs';

const MIN_ACCESS_CHOICES = [
  UserAccessLevel.banned,
  UserAccessLevel.moderator,
  UserAccessLevel.twitarrteam,
  UserAccessLevel.tho,
  UserAccessLevel.admin,
];

interface SettingsFormValues {
  minUserAccessLevel: string;
  enablePreregistration: boolean;
  maxAlternateAccounts: string;
  maximumTwarrts: string;
  maximumForums: string;
  maximumForumPosts: string;
  maxImageSize: string;
  maxForumPostImages: string;
  photostreamUploadRateLimit: string;
  forumAutoQuarantineThreshold: string;
  postAutoQuarantineThreshold: string;
  userAutoQuarantineThreshold: string;
  allowAnimatedImages: boolean;
  shipWifiSSID: string;
  scheduleUpdateURL: string;
  upcomingEventNotificationSeconds: string;
  upcomingEventNotificationSetting: EventNotificationSetting;
  upcomingLFGNotificationSetting: EventNotificationSetting;
  enableSiteNotificationDataCaching: boolean;
}

const validationSchema = Yup.object().shape({
  maxAlternateAccounts: IntegerValidation,
  maximumTwarrts: IntegerValidation,
  maximumForums: IntegerValidation,
  maximumForumPosts: IntegerValidation,
  maxImageSize: IntegerValidation,
  maxForumPostImages: IntegerValidation,
  photostreamUploadRateLimit: IntegerValidation,
  forumAutoQuarantineThreshold: IntegerValidation,
  postAutoQuarantineThreshold: IntegerValidation,
  userAutoQuarantineThreshold: IntegerValidation,
  upcomingEventNotificationSeconds: IntegerValidation,
});

const toFormValues = (data: SettingsAdminData): SettingsFormValues => ({
  minUserAccessLevel: data.minAccessUserLevel,
  enablePreregistration: data.enablePreregistration,
  maxAlternateAccounts: String(data.maxAlternateAccounts),
  maximumTwarrts: String(data.maximumTwarrts),
  maximumForums: String(data.maximumForums),
  maximumForumPosts: String(data.maximumForumPosts),
  maxImageSize: String(data.maxImageSize),
  maxForumPostImages: String(data.maxForumPostImages),
  photostreamUploadRateLimit: String(data.photostreamUploadRateLimit),
  forumAutoQuarantineThreshold: String(data.forumAutoQuarantineThreshold),
  postAutoQuarantineThreshold: String(data.postAutoQuarantineThreshold),
  userAutoQuarantineThreshold: String(data.userAutoQuarantineThreshold),
  allowAnimatedImages: data.allowAnimatedImages,
  shipWifiSSID: data.shipWifiSSID ?? '',
  scheduleUpdateURL: data.scheduleUpdateURL,
  upcomingEventNotificationSeconds: String(data.upcomingEventNotificationSeconds),
  upcomingEventNotificationSetting: data.upcomingEventNotificationSetting,
  upcomingLFGNotificationSetting: data.upcomingLFGNotificationSetting,
  enableSiteNotificationDataCaching: data.enableSiteNotificationDataCaching,
});

export const AdminServerSettingsScreen = () => {
  return (
    <AdminAccessScreen minAccess={'twitarrteam'}>
      <AdminServerSettingsScreenInner />
    </AdminAccessScreen>
  );
};

const AdminServerSettingsScreenInner = () => {
  const {data, refetch, isLoading} = useAdminSettingsQuery();
  const {refreshing, onRefresh} = useRefresh({refresh: refetch});
  const mutation = useAdminSettingsUpdateMutation();
  const {canEditSettings} = useAdminAccess();
  const {setSnackbarPayload} = useSnackbar();
  const {commonStyles} = useStyles();
  useAdminHelpButton();

  const onSubmit = (values: SettingsFormValues, helpers: FormikHelpers<SettingsFormValues>) => {
    const payload: SettingsUpdateData = {
      minUserAccessLevel: values.minUserAccessLevel,
      enablePreregistration: values.enablePreregistration,
      maxAlternateAccounts: Number(values.maxAlternateAccounts),
      maximumTwarrts: Number(values.maximumTwarrts),
      maximumForums: Number(values.maximumForums),
      maximumForumPosts: Number(values.maximumForumPosts),
      maxImageSize: Number(values.maxImageSize),
      maxForumPostImages: Number(values.maxForumPostImages),
      photostreamUploadRateLimit: Number(values.photostreamUploadRateLimit),
      forumAutoQuarantineThreshold: Number(values.forumAutoQuarantineThreshold),
      postAutoQuarantineThreshold: Number(values.postAutoQuarantineThreshold),
      userAutoQuarantineThreshold: Number(values.userAutoQuarantineThreshold),
      allowAnimatedImages: values.allowAnimatedImages,
      enableFeatures: [],
      disableFeatures: [],
      shipWifiSSID: values.shipWifiSSID,
      scheduleUpdateURL: values.scheduleUpdateURL,
      upcomingEventNotificationSeconds: Number(values.upcomingEventNotificationSeconds),
      upcomingEventNotificationSetting: values.upcomingEventNotificationSetting,
      upcomingLFGNotificationSetting: values.upcomingLFGNotificationSetting,
      enableSiteNotificationDataCaching: values.enableSiteNotificationDataCaching,
    };
    mutation.mutate(payload, {
      onSuccess: () => {
        setSnackbarPayload({message: 'Server settings saved.', messageType: 'success'});
        helpers.resetForm({values});
      },
      onSettled: () => helpers.setSubmitting(false),
    });
  };

  if (isLoading && !data) {
    return <LoadingView />;
  }
  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ServerSettingsReadOnlyWarningView />
      <ScrollingContentView refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <Formik
            initialValues={toFormValues(data)}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
            enableReinitialize={true}>
            {({handleSubmit, isSubmitting, isValid, values}) => (
              <>
                <DirtyDetectionField />
                <PickerField
                  name={'minUserAccessLevel'}
                  testID={'minAccess-picker'}
                  label={'Minimum Access Level'}
                  value={values.minUserAccessLevel}
                  choices={MIN_ACCESS_CHOICES}
                  getTitle={value => UserAccessLevel.getLabel(value as UserAccessLevel)}
                  disabled={!canEditSettings}
                />
                <BooleanField
                  name={'enablePreregistration'}
                  testID={'prereg-switch'}
                  label={'Enable Pre-Registration'}
                  disabled={!canEditSettings}
                />
                <BooleanField
                  name={'allowAnimatedImages'}
                  testID={'animated-switch'}
                  label={'Allow Animated Images'}
                  disabled={!canEditSettings}
                />
                <BooleanField
                  name={'enableSiteNotificationDataCaching'}
                  testID={'siteCache-switch'}
                  label={'Site Notification Data Caching'}
                  disabled={!canEditSettings}
                />
                <TextField
                  name={'maxAlternateAccounts'}
                  testID={'maxAlts-field'}
                  label={'Max Alternate Accounts'}
                  keyboardType={'number-pad'}
                  disabled={!canEditSettings}
                />
                <TextField
                  name={'maximumTwarrts'}
                  testID={'maxTwarrts-field'}
                  label={'Maximum Twarrts'}
                  keyboardType={'number-pad'}
                  disabled={!canEditSettings}
                />
                <TextField
                  name={'maximumForums'}
                  testID={'maxForums-field'}
                  label={'Maximum Forums'}
                  keyboardType={'number-pad'}
                  disabled={!canEditSettings}
                />
                <TextField
                  name={'maximumForumPosts'}
                  testID={'maxForumPosts-field'}
                  label={'Maximum Forum Posts'}
                  keyboardType={'number-pad'}
                  disabled={!canEditSettings}
                />
                <TextField
                  name={'maxImageSize'}
                  testID={'maxImageSize-field'}
                  label={'Max Image Size (bytes)'}
                  keyboardType={'number-pad'}
                  disabled={!canEditSettings}
                />
                <TextField
                  name={'maxForumPostImages'}
                  testID={'maxForumPostImages-field'}
                  label={'Max Images Per Forum Post'}
                  keyboardType={'number-pad'}
                  disabled={!canEditSettings}
                />
                <TextField
                  name={'photostreamUploadRateLimit'}
                  testID={'photostreamRate-field'}
                  label={'Photostream Upload Rate Limit (seconds)'}
                  keyboardType={'number-pad'}
                  infoText={'0 disables the limit.'}
                  disabled={!canEditSettings}
                />
                <TextField
                  name={'forumAutoQuarantineThreshold'}
                  testID={'forumQuarantine-field'}
                  label={'Forum Auto-Quarantine Threshold'}
                  keyboardType={'number-pad'}
                  disabled={!canEditSettings}
                />
                <TextField
                  name={'postAutoQuarantineThreshold'}
                  testID={'postQuarantine-field'}
                  label={'Post Auto-Quarantine Threshold'}
                  keyboardType={'number-pad'}
                  disabled={!canEditSettings}
                />
                <TextField
                  name={'userAutoQuarantineThreshold'}
                  testID={'userQuarantine-field'}
                  label={'User Auto-Quarantine Threshold'}
                  keyboardType={'number-pad'}
                  disabled={!canEditSettings}
                />
                <TextField
                  name={'shipWifiSSID'}
                  testID={'ssid-field'}
                  label={'Ship Wi-Fi SSID'}
                  disabled={!canEditSettings}
                />
                <TextField
                  name={'scheduleUpdateURL'}
                  testID={'scheduleUrl-field'}
                  label={'Schedule Update URL'}
                  disabled={!canEditSettings}
                />
                <TextField
                  name={'upcomingEventNotificationSeconds'}
                  testID={'eventNotifySeconds-field'}
                  label={'Upcoming Event Notification (seconds)'}
                  keyboardType={'number-pad'}
                  disabled={!canEditSettings}
                />
                <PickerField
                  name={'upcomingEventNotificationSetting'}
                  testID={'eventNotify-picker'}
                  label={'Upcoming Event Notifications'}
                  value={values.upcomingEventNotificationSetting}
                  choices={EventNotificationSetting.all}
                  getTitle={value => EventNotificationSetting.getLabel(value as EventNotificationSetting)}
                  disabled={!canEditSettings}
                  viewStyle={commonStyles.marginBottom}
                />
                <PickerField
                  name={'upcomingLFGNotificationSetting'}
                  testID={'lfgNotify-picker'}
                  label={'Upcoming LFG Notifications'}
                  value={values.upcomingLFGNotificationSetting}
                  choices={EventNotificationSetting.all}
                  getTitle={value => EventNotificationSetting.getLabel(value as EventNotificationSetting)}
                  disabled={!canEditSettings}
                />
                {canEditSettings && (
                  <PrimaryActionButton
                    testID={'settingsSave-button'}
                    buttonText={'Save'}
                    onPress={handleSubmit}
                    disabled={!isValid || isSubmitting}
                    isLoading={isSubmitting}
                  />
                )}
              </>
            )}
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
