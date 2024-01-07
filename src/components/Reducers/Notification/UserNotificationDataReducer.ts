import {UserNotificationData} from '../../../libraries/Structs/ControllerStructs';

export enum UserNotificationDataActions {
  set = 'SET',
  markAlertwordRead = 'MARK_ALERTWORD_READ',
  removeAlertword = 'REMOVE_ALERTWORD',
  clear = 'CLEAR',
}

export type UserNotificationDataActionsType =
  | {type: UserNotificationDataActions.set; userNotificationData: UserNotificationData}
  | {type: UserNotificationDataActions.markAlertwordRead; alertWord: string}
  | {type: UserNotificationDataActions.removeAlertword; alertWord: string}
  | {type: UserNotificationDataActions.clear};

export const userNotificationDataReducer = (
  currentData: UserNotificationData | undefined,
  action: UserNotificationDataActionsType,
): UserNotificationData | undefined => {
  console.log('[UserNotificationDataReducer.ts] Got action:', action.type);
  switch (action.type) {
    case UserNotificationDataActions.set: {
      return action.userNotificationData;
    }
    case UserNotificationDataActions.markAlertwordRead: {
      if (!currentData) {
        return undefined;
      }
      const newAlertWordData = currentData.alertWords.map(aw => {
        if (aw.alertword === action.alertWord) {
          return {
            ...aw,
            newForumMentionCount: 0,
          };
        }
        return aw;
      });
      return {
        ...currentData,
        alertWords: newAlertWordData,
      };
    }
    case UserNotificationDataActions.removeAlertword: {
      if (!currentData) {
        return undefined;
      }
      const newAlertWordData = currentData.alertWords.filter(aw => {
        return aw.alertword !== action.alertWord;
      });
      return {
        ...currentData,
        alertWords: newAlertWordData,
      };
    }
    case UserNotificationDataActions.clear: {
      return undefined;
    }
    default: {
      throw new Error('Bad UND action');
    }
  }
};
