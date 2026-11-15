import React from 'react';

import {CallOverlay} from '#src/Components/Call/CallOverlay';
import {AccountCookieSync} from '#src/Components/Libraries/AccountCookieSync';
import {AccountIdentitySync} from '#src/Components/Libraries/AccountIdentitySync';
import {AppEventHandler} from '#src/Components/Libraries/AppEventHandler';
import {AppFocusHandler} from '#src/Components/Libraries/AppFocusHandler';
import {ForeignLinkHandler} from '#src/Components/Libraries/ForeignLinkHandler';
import {NotificationDataListener} from '#src/Components/Libraries/Notifications/NotificationDataListener';
import {NotificationDataPoller} from '#src/Components/Libraries/Notifications/NotificationDataPoller';
import {PushNotificationService} from '#src/Components/Libraries/Notifications/PushNotificationService';
import {RootStackNavigator} from '#src/Navigation/Stacks/Root/RootStackNavigator';

/**
 * The app proper: the background sync/event handlers, the root navigator, and the call overlay.
 * Rendered inside all of the providers in App.tsx.
 */
export const TricordarrApp = () => {
  return (
    <>
      <AccountCookieSync />
      <AccountIdentitySync />
      <AppEventHandler />
      <AppFocusHandler />
      <ForeignLinkHandler />
      <PushNotificationService />
      <NotificationDataListener />
      <NotificationDataPoller />
      <RootStackNavigator />
      <CallOverlay />
    </>
  );
};
