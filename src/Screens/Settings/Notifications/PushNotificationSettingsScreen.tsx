import {StackScreenProps} from '@react-navigation/stack';
import {Formik} from 'formik';
import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {DataTable, SegmentedButtons, Text} from 'react-native-paper';
import {requestNotifications, RESULTS} from 'react-native-permissions';
import Animated from 'react-native-reanimated';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {usePermissions} from '#src/Context/Contexts/PermissionsContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useHighlightAnimation} from '#src/Hooks/useHighlightAnimation';
import {PushNotificationConfig} from '#src/Libraries/AppConfig';
import {createLogger} from '#src/Libraries/Logger';
import {contentNotificationCategories} from '#src/Libraries/Notifications/Content';
import {startPushProvider} from '#src/Libraries/Notifications/Push';
import {isAndroid} from '#src/Libraries/Platform/Detection';
import {SettingsStackParamList, SettingsStackScreenComponents} from '#src/Navigation/Stacks/SettingsStackNavigator';
import {SegmentedButtonType} from '#src/Types';

const logger = createLogger('PushNotificationSettingsScreen.tsx');

export type Props = StackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.pushNotificationSettings>;

export const PushNotificationSettingsScreen = ({route}: Props) => {
  const {appConfig, updateAppConfig} = useConfig();
  const {
    hasNotificationPermission,
    setNotificationPermissionStatus,
    notificationPermissionStatus,
    setHasNotificationPermission,
  } = usePermissions();
  const {theme} = useAppTheme();
  const [muteDuration] = useState(0);
  const [muteNotifications, setMuteNotifications] = useState(appConfig.muteNotifications);
  const [markReadCancelPush, setMarkReadCancelPush] = useState(appConfig.markReadCancelPush);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollContentRef = useRef<View | null>(null);
  const categoryRefs = useRef<Record<string, View | null>>({});
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
  const notificationType = route.params?.notificationType;
  const hasScrolledToCategory = useRef(false);
  const {commonStyles} = useStyles();

  const {triggerPulseAnimation, pulseAnimatedStyle} = useHighlightAnimation({
    onComplete: () => {
      setHighlightedCategory(null);
    },
  });

  const muteButtons: SegmentedButtonType[] = [
    {value: '5', label: '5m'},
    {value: '10', label: '10m'},
    {value: '15', label: '15m'},
    {value: '30', label: '30m'},
    {value: '60', label: '1h'},
  ];

  const toggleMuteDuration = (value: string) => {
    const muteUntilDate = new Date(new Date().getTime() + Number(value) * 60 * 1000);
    setMuteNotifications(muteUntilDate);
    updateAppConfig({
      ...appConfig,
      muteNotifications: muteUntilDate,
    });
  };

  const resumeNotifications = () => {
    setMuteNotifications(undefined);
    updateAppConfig({
      ...appConfig,
      muteNotifications: undefined,
    });
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

  const setAllValue = (value: boolean) => {
    let pushConfig = appConfig.pushNotifications;
    Object.values(contentNotificationCategories).flatMap(c => {
      if (!c.disabled) {
        (pushConfig[c.configKey] as boolean) = value;
      }
    });
    updateAppConfig({
      ...appConfig,
      pushNotifications: pushConfig,
    });
  };

  const handleEnable = () => {
    requestNotifications([]).then(({status}) => {
      setNotificationPermissionStatus(status);
      setHasNotificationPermission(status === RESULTS.GRANTED);
      if (status === RESULTS.GRANTED) {
        startPushProvider();
      }
    });
  };

  /**
   * This is not supported on iOS. Notifications are automatically dusmissed on push.
   */
  const toggleMarkReadCancelPush = () => {
    const newValue = !markReadCancelPush;
    updateAppConfig({
      ...appConfig,
      markReadCancelPush: newValue,
    });
    setMarkReadCancelPush(newValue);
  };

  useEffect(() => {
    if (appConfig.muteNotifications && new Date() >= appConfig.muteNotifications) {
      logger.debug('muteNotifications expired, clearing');
      setMuteNotifications(undefined);
      updateAppConfig({
        ...appConfig,
        muteNotifications: undefined,
      });
    }
  }, [appConfig, updateAppConfig]);

  // Auto-scroll to and highlight notification type when opened from notification
  const handleContentLayout = () => {
    if (!notificationType || !scrollViewRef.current || !scrollContentRef.current || hasScrolledToCategory.current) {
      return;
    }

    const categoryRef = categoryRefs.current[notificationType];
    if (categoryRef && scrollViewRef.current && scrollContentRef.current) {
      categoryRef.measureLayout(
        scrollContentRef.current,
        (x, y) => {
          // Scroll to the category with some offset for better visibility
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, y - 20),
            animated: true,
          });

          // Highlight the category
          setHighlightedCategory(notificationType);

          // Mark as handled to prevent re-scrolling on subsequent layout changes
          hasScrolledToCategory.current = true;

          // Trigger pulse animation after scroll completes (scroll animation typically takes ~300-500ms)
          // onScrollAnimationEnd is not reliable for programmatic scrolls, so we have to use a timeout.
          setTimeout(() => {
            triggerPulseAnimation();
          }, 500);
        },
        () => {
          logger.warn('Failed to measure layout for category:', notificationType);
        },
      );
    }
  };

  // Reset scroll flag when notificationType changes
  useEffect(() => {
    hasScrolledToCategory.current = false;
  }, [notificationType]);

  // Group notifications by feature area, sorted alphabetically
  const notificationGroups = [
    {
      title: 'Announcements',
      categories: ['announcement'] as const,
    },
    {
      title: 'Events',
      categories: ['followedEventStarting'] as const,
    },
    {
      title: 'Forum',
      categories: ['alertwordPost', 'forumMention', 'moderatorForumMention', 'twitarrTeamForumMention'] as const,
    },
    {
      title: 'KrakenTalk',
      categories: ['incomingPhoneCall', 'phoneCallAnswered', 'phoneCallEnded'] as const,
    },
    {
      title: 'LFG',
      categories: ['fezUnreadMsg', 'addedToLFG', 'joinedLFGStarting', 'lfgCanceled'] as const,
    },
    {
      title: 'MicroKaraoke',
      categories: ['microKaraokeSongReady'] as const,
    },
    {
      title: 'Personal Events',
      categories: [
        'personalEventStarting',
        'addedToPrivateEvent',
        'privateEventUnreadMsg',
        'privateEventCanceled',
      ] as const,
    },
    {
      title: 'Seamail',
      categories: ['seamailUnreadMsg', 'addedToSeamail'] as const,
    },
  ];

  return (
    <AppView>
      <ScrollingContentView isStack={true} ref={scrollViewRef} onLayout={handleContentLayout}>
        <ListSection>
          <ListSubheader>Permissions</ListSubheader>
          <PaddedContentView padTop={true}>
            <DataTable>
              {notificationPermissionStatus === RESULTS.BLOCKED && (
                <Text>
                  Notifications have been blocked by your device. You'll need to enable them for this app manually.
                </Text>
              )}
              {notificationPermissionStatus !== RESULTS.BLOCKED && (
                <PrimaryActionButton
                  buttonText={hasNotificationPermission ? 'Already Allowed' : 'Allow Push Notifications'}
                  onPress={handleEnable}
                  disabled={hasNotificationPermission}
                />
              )}
            </DataTable>
          </PaddedContentView>
        </ListSection>
        <ListSection>
          <ListSubheader>Categories</ListSubheader>
          <PaddedContentView padTop={true}>
            <Text variant={'bodyMedium'}>
              Pick the types of actions you want to receive as push notifications. This only controls what generates a
              notification on your device, not what to get notified for within Twitarr.
            </Text>
          </PaddedContentView>
          <PaddedContentView padTop={true}>
            <PrimaryActionButton
              buttonColor={theme.colors.twitarrPositiveButton}
              buttonText={'Enable All Categories'}
              onPress={() => setAllValue(true)}
              disabled={notificationPermissionStatus !== RESULTS.GRANTED}
            />
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton
              buttonColor={theme.colors.twitarrNegativeButton}
              buttonText={'Disable All Categories'}
              onPress={() => setAllValue(false)}
              disabled={notificationPermissionStatus !== RESULTS.GRANTED}
            />
          </PaddedContentView>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View
              ref={ref => {
                scrollContentRef.current = ref;
              }}>
              {notificationGroups.map(group => {
                const groupCategories = group.categories
                  .map(key => contentNotificationCategories[key])
                  .filter(category => category && !category.disabled)
                  .sort((a, b) => a.title.localeCompare(b.title));

                if (groupCategories.length === 0) {
                  return null;
                }

                return (
                  <View key={group.title}>
                    <ListSubheader>{group.title}</ListSubheader>
                    <View>
                      {groupCategories.map(category => {
                        const isHighlighted = highlightedCategory === category.configKey;
                        return (
                          <Animated.View
                            key={category.configKey}
                            ref={(ref: React.ComponentRef<typeof Animated.View> | null) => {
                              categoryRefs.current[category.configKey] = ref as View | null;
                            }}
                            style={[
                              isHighlighted ? pulseAnimatedStyle : undefined,
                              commonStyles.paddingHorizontalSmall,
                            ]}>
                            <BooleanField
                              name={category.configKey}
                              label={category.title}
                              value={appConfig.pushNotifications[category.configKey]}
                              onPress={() => toggleValue(category.configKey)}
                              disabled={!hasNotificationPermission || category.disabled}
                              helperText={category.description}
                            />
                          </Animated.View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          </Formik>
        </ListSection>
        <ListSection>
          <ListSubheader>Temporary Mute</ListSubheader>
          <PaddedContentView padTop={true}>
            <Text variant={'bodyMedium'}>
              Temporarily mute push notifications from this app. This can be useful if there is a chat that is
              particularly distracting or you do not wish to be disturbed for a bit.
            </Text>
            {muteNotifications && (
              <PaddedContentView padTop={true}>
                <Text>
                  Resuming in <RelativeTimeTag date={muteNotifications} />
                </Text>
              </PaddedContentView>
            )}
          </PaddedContentView>
          <PaddedContentView>
            <SegmentedButtons
              buttons={muteButtons}
              value={muteDuration.toString()}
              onValueChange={toggleMuteDuration}
            />
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton buttonText={'Resume'} onPress={resumeNotifications} disabled={!muteNotifications} />
          </PaddedContentView>
        </ListSection>
        {isAndroid && (
          <ListSection>
            <ListSubheader>Auto Cancel</ListSubheader>
            <PaddedContentView padTop={true}>
              <Text variant={'bodyMedium'}>
                Automatically dismiss push notifications for unread content when you have read the content. This can be
                useful if you tend to navigate to content (such as a Seamail conversation) without tapping on the
                notification and want the notification to go away.
              </Text>
              <Formik initialValues={{}} onSubmit={() => {}}>
                <View>
                  <BooleanField
                    name={'markReadCancelPush'}
                    label={'Dismiss Notifications on Read'}
                    value={markReadCancelPush}
                    onPress={toggleMarkReadCancelPush}
                    helperText={'This setting only applies to Seamails and LFGs at this time.'}
                  />
                </View>
              </Formik>
            </PaddedContentView>
          </ListSection>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
