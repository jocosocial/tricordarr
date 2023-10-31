// https://www.reddit.com/r/typescript/comments/vdk8we/is_there_a_type_for_objects_with_arbitrary_keys/
export interface KvObject {
  [key: string]: string | null;
}

export type StringOrError = string | Error;

// Taken from the WebSocket class.
export type WebSocketOptions = {
  headers: {[headerName: string]: string};
  [optionName: string]: any;
} | null;

export type KeywordAction = 'add' | 'remove';

export type KeywordType = 'alertwords' | 'mutewords';

export type CruiseDayData = {
  date: Date;
  cruiseDay: number;
};

export type CruiseDayTime = {
  dayMinutes: number;
  cruiseDay: number;
};

export type ScheduleItem = {
  title: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  location: string;
  itemType: 'official' | 'shadow' | 'lfg';
};
