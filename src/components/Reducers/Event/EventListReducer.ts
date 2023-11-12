import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {useReducer} from 'react';

export enum EventListActions {
  setList = 'SET',
  updateEvent = 'UPDATE_EVENT',
  // toggleFollow = 'TOGGLE_FOLLOW',
}

export type EventListActionsType =
  | {type: EventListActions.setList; eventList: EventData[]}
  | {type: EventListActions.updateEvent; newEvent: EventData};
  // | {type: EventListActions.toggleFollow; eventID: string};

const eventListReducer = (eventList: EventData[], action: EventListActionsType): EventData[] => {
  switch (action.type) {
    case EventListActions.setList: {
      return action.eventList;
    }
    case EventListActions.updateEvent: {
      return eventList.flatMap(e => {
        if (e.eventID === action.newEvent.eventID) {
          return action.newEvent;
        }
        return e;
      });
    }
    // case EventListActions.toggleFollow: {
    //   return eventList.flatMap(e => {
    //     if (e.eventID === action.eventID) {
    //       e.isFavorite = !e.isFavorite;
    //     }
    //     return e;
    //   });
    // }
    default: {
      throw new Error('Unknown EventListActions action');
    }
  }
};

export const useEventListReducer = (initialState: EventData[]) => useReducer(eventListReducer, initialState);
