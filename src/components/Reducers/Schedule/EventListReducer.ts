import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {useReducer} from 'react';

export enum EventListActions {
  setList = 'SET',
  updateEvent = 'UPDATE_EVENT',
}

export type EventListActionsType =
  | {type: EventListActions.setList; eventList: EventData[]}
  | {type: EventListActions.updateEvent; newEvent: EventData};

const eventListReducer = (eventList: EventData[], action: EventListActionsType): EventData[] => {
  console.log('[EventListReducer.ts] Got action:', action.type);
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
    default: {
      throw new Error('Unknown EventListActions action');
    }
  }
};

export const useEventListReducer = (initialState: EventData[]) => useReducer(eventListReducer, initialState);
