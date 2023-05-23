import {UserNotificationData} from '../../../libraries/Structs/ControllerStructs';

export enum UserNotificationDataActions {
  set = 'SET',
  markSeamailRead = 'MARK_SEAMAIL_READ',
  clear = 'CLEAR',
}

export type UserNotificationDataActionsType =
  | {type: UserNotificationDataActions.set; userNotificationData: UserNotificationData}
  | {type: UserNotificationDataActions.markSeamailRead}
  | {type: UserNotificationDataActions.clear};

export const userNotificationDataReducer = (
  currentData: UserNotificationData | undefined,
  action: UserNotificationDataActionsType,
): UserNotificationData | undefined => {
  switch (action.type) {
    case UserNotificationDataActions.set: {
      return action.userNotificationData;
    }
    // This is invalid because of idempotency issues. Disabling until it maybe comes back
    // in some other fashion or use.
    // case UserNotificationDataActions.markSeamailRead: {
    //   const oldCount = currentData?.newSeamailMessageCount;
    //   if (oldCount && oldCount > 0) {
    //     return {
    //       ...currentData,
    //       newSeamailMessageCount: oldCount - 1,
    //     };
    //   }
    //   return currentData;
    // }
    case UserNotificationDataActions.clear: {
      return undefined;
    }
    default: {
      throw new Error('Bad UND action');
    }
  }
};
