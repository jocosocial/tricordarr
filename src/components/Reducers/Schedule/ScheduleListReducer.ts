import {EventData, FezData} from '../../../libraries/Structs/ControllerStructs';
import {useReducer} from 'react';

export enum ScheduleListActions {
  setList = 'SET',
  updateEvent = 'UPDATE_EVENT',
}

export type ScheduleListActionsType =
  | {type: ScheduleListActions.setList; eventList: EventData[]; fezList: FezData[]}
  | {type: ScheduleListActions.updateEvent; newEvent: EventData};

const scheduleListReducer = (
  scheduleList: (EventData | FezData)[],
  action: ScheduleListActionsType,
): (EventData | FezData)[] => {
  console.log('scheduleListReducer got action', action.type);
  switch (action.type) {
    case ScheduleListActions.setList: {
      let itemList: (EventData | FezData)[] = action.eventList;
      itemList = itemList.concat(action.fezList);
      return itemList.sort(
        (a, b) => new Date(a.startTime || new Date()).getTime() - new Date(b.startTime || new Date()).getTime(),
      );
    }
    case ScheduleListActions.updateEvent: {
      return scheduleList.flatMap(item => {
        if ('eventID' in item && item.eventID === action.newEvent.eventID) {
          console.log('Updating event', item.eventID, item.title);
          return action.newEvent;
        }
        return item;
      });
    }
    default: {
      throw new Error('Unknown ScheduleListActions action');
    }
  }
};

export const useScheduleListReducer = (initialState: (EventData | FezData)[]) =>
  useReducer(scheduleListReducer, initialState);
