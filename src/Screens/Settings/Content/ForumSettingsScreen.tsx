import {Formik} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {PickerField} from '#src/Components/Forms/Fields/PickerField';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {usePermissions} from '#src/Context/Contexts/PermissionsContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ForumSort, ForumSortDirection} from '#src/Enums/ForumSortFilter';
import {AppIcons} from '#src/Enums/Icons';
import {PushNotificationConfig} from '#src/Libraries/AppConfig';
import {contentNotificationCategories} from '#src/Libraries/Notifications/Content';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const ForumSettingsScreen = () => {
  const {commonStyles} = useStyles();
  const {appConfig, updateAppConfig} = useConfig();
  const {hasNotificationPermission} = usePermissions();
  const navigation = useCommonStack();
  const [defaultSortOrder, setDefaultSortOrder] = useState(appConfig.userPreferences.defaultForumSortOrder);
  const [defaultSortDirection, setDefaultSortDirection] = useState(appConfig.userPreferences.defaultForumSortDirection);
  const {setForumSortOrder, setForumSortDirection} = useFilter();
  const [highlightAlertWords, setHighlightAlertWords] = useState(appConfig.userPreferences.highlightForumAlertWords);

  const handleSortOrder = (value: ForumSort | undefined) => {
    updateAppConfig({
      ...appConfig,
      userPreferences: {
        ...appConfig.userPreferences,
        defaultForumSortOrder: value,
      },
    });
    setDefaultSortOrder(value);
    setForumSortOrder(value);
  };

  const handleSortDirection = (value: ForumSortDirection | undefined) => {
    updateAppConfig({
      ...appConfig,
      userPreferences: {
        ...appConfig.userPreferences,
        defaultForumSortDirection: value,
      },
    });
    setDefaultSortDirection(value);
    setForumSortDirection(value);
  };

  const toggleValue = (configKey: keyof PushNotificationConfig) => {
    let pushConfig = appConfig.pushNotifications;
    // https://bobbyhadz.com/blog/typescript-cannot-assign-to-because-it-is-read-only-property
    (pushConfig[configKey] as boolean) = !appConfig.pushNotifications[configKey];
    updateAppConfig({
      ...appConfig,
      pushNotifications: pushConfig,
    });
  };

  const handleHighlightAlerts = () => {
    updateAppConfig({
      ...appConfig,
      userPreferences: {
        ...appConfig.userPreferences,
        highlightForumAlertWords: !highlightAlertWords,
      },
    });
    setHighlightAlertWords(!highlightAlertWords);
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.forumHelpScreen)}
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

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <ListSection>
                <ListSubheader>General</ListSubheader>
                <PickerField<ForumSort | undefined>
                  name={'defaultForumSortOrder'}
                  label={'Default Sort Order'}
                  value={defaultSortOrder}
                  choices={[ForumSort.create, ForumSort.title, ForumSort.update, ForumSort.event, undefined]}
                  getTitle={value => ForumSort.getLabel(value)}
                  anchorButtonMode={'contained'}
                  helperText={
                    'Optionally specify the ordering you would like to see forum threads appear in. You can always change or disable this in the screen but your default will reset when the app re-launches. By default (or if set to None) the server will return results in Most Recent Post order.'
                  }
                  onSelect={handleSortOrder}
                />
                <PickerField<ForumSortDirection | undefined>
                  name={'defaultForumSortDirection'}
                  label={'Default Sort Direction'}
                  value={defaultSortDirection}
                  choices={[ForumSortDirection.ascending, ForumSortDirection.descending, undefined]}
                  getTitle={value => ForumSortDirection.getLabel(value)}
                  anchorButtonMode={'contained'}
                  helperText={
                    'Optionally specify the sort direction you would like to see forum threads appear in. You can always change or disable this in the screen but your default will reset when the app re-launches. By default (or if set to None) the server will return results in the Descending direction.'
                  }
                  onSelect={handleSortDirection}
                  viewStyle={commonStyles.paddingBottomSmall}
                />
                <BooleanField
                  name={'highlightForumAlertWords'}
                  label={'Highlight Forum Alert Words'}
                  value={highlightAlertWords}
                  helperText={
                    'Visually identify your alert keywords in forums like 🚨this🚨. Disabling this has no effect on your notifications for the alert words.'
                  }
                  onPress={handleHighlightAlerts}
                  style={commonStyles.paddingHorizontalSmall}
                />
              </ListSection>
              <ListSection>
                <ListSubheader>Push Notifications</ListSubheader>
              </ListSection>
              <BooleanField
                key={contentNotificationCategories.forumMention.configKey}
                name={contentNotificationCategories.forumMention.configKey}
                label={contentNotificationCategories.forumMention.title}
                value={appConfig.pushNotifications.forumMention}
                onPress={() => toggleValue(contentNotificationCategories.forumMention.configKey)}
                disabled={!hasNotificationPermission}
                helperText={contentNotificationCategories.forumMention.description}
                style={commonStyles.paddingHorizontalSmall}
              />
              <BooleanField
                key={contentNotificationCategories.alertwordPost.configKey}
                name={contentNotificationCategories.alertwordPost.configKey}
                label={contentNotificationCategories.alertwordPost.title}
                value={appConfig.pushNotifications.alertwordPost}
                onPress={() => toggleValue(contentNotificationCategories.alertwordPost.configKey)}
                disabled={!hasNotificationPermission}
                helperText={contentNotificationCategories.alertwordPost.description}
                style={commonStyles.paddingHorizontalSmall}
              />
              <BooleanField
                key={contentNotificationCategories.twitarrTeamForumMention.configKey}
                name={contentNotificationCategories.twitarrTeamForumMention.configKey}
                label={contentNotificationCategories.twitarrTeamForumMention.title}
                value={appConfig.pushNotifications.twitarrTeamForumMention}
                onPress={() => toggleValue(contentNotificationCategories.twitarrTeamForumMention.configKey)}
                disabled={!hasNotificationPermission}
                helperText={contentNotificationCategories.twitarrTeamForumMention.description}
                style={commonStyles.paddingHorizontalSmall}
              />
              <BooleanField
                key={contentNotificationCategories.moderatorForumMention.configKey}
                name={contentNotificationCategories.moderatorForumMention.configKey}
                label={contentNotificationCategories.moderatorForumMention.title}
                value={appConfig.pushNotifications.moderatorForumMention}
                onPress={() => toggleValue(contentNotificationCategories.moderatorForumMention.configKey)}
                disabled={!hasNotificationPermission}
                helperText={contentNotificationCategories.moderatorForumMention.description}
                style={commonStyles.paddingHorizontalSmall}
              />
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
