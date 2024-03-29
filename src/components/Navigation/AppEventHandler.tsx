import {useEffect} from 'react';
import {Linking} from 'react-native';
import notifee, {Event, EventType} from '@notifee/react-native';
import {useLinkTo} from '@react-navigation/native';
import {getUrlForEvent} from '../../libraries/Events';

/**
 * High level functional component to handle app events that are generated by reactions to notifications.
 * Usually used when the user taps on a notification or hits one of its action buttons.
 */
export const AppEventHandler = () => {
  const linkTo = useLinkTo();

  // Foreground events occur when the app is front and center in the users view.
  // This has to be a useEffect otherwise the navigator could be used before it's
  // initialized. Which still functions but throws an error.
  useEffect(() => {
    const handleForegroundEvent = (event: Event) => {
      const {notification, pressAction} = event.detail;
      const url = getUrlForEvent(event.type, notification, pressAction);
      if (url) {
        console.log('[AppEventHandler.tsx] handleForegroundEvent responding to url', url);
        linkTo(url);
      }
    };

    // We get the unsubscribe function returned from registering the handler.
    const unsubscribe = notifee.onForegroundEvent(handleForegroundEvent);

    return () => {
      unsubscribe();
    };
  }, [linkTo]);

  // Background events occur when the app is still running but not in the users view.
  // The OS may kill the app at any time.
  notifee.onBackgroundEvent(async (event: Event) => {
    const {notification, pressAction} = event.detail;
    const url = getUrlForEvent(event.type, notification, pressAction) || '/home';
    console.log('[AppEventHandler.tsx] onBackgroundEvent responding to event', event.type, 'with url', url);

    // When I made notification permissions optional, I started seeing EventType.DELIVERED events make
    // it in here. This caused the app to launch whenever a notification was received which is unacceptable.
    // Limiting the actions that can trigger the app made it better.
    if (event.type === EventType.ACTION_PRESS || event.type === EventType.PRESS) {
      const linkingUrl = `tricordarr:/${url}`;
      console.log('[AppEventHandler.tsx] onBackgroundEvent launching url', linkingUrl);
      await Linking.openURL(linkingUrl); // url starts with a /, so only add one.
    } else {
      console.log('[AppEventHandler.tsx] onBackgroundEvent event was not a respondable action. Skipping...');
    }
  });

  // Void is not a valid React component.
  return null;
};
