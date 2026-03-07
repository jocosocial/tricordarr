import notifee from '@notifee/react-native';

import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('InitialNotification');

/**
 * Sometimes the app is launched from a notification (like if the user pressed one or an action on one).
 * Grab that notification and do exactly nothing with it other than cancel it.
 */
export async function setupInitialNotification() {
  logger.debug('Processing initial launch notification (if any)');
  const initialNotification = await notifee.getInitialNotification();

  if (initialNotification) {
    logger.info('Notification caused application to open', initialNotification.notification);
    logger.info('Press action used to open the app', initialNotification.pressAction);
    if (initialNotification.notification.id != null) {
      logger.debug('Canceling initial notification', initialNotification.notification.id);
      await notifee.cancelNotification(initialNotification.notification.id);
    }
  }
}
