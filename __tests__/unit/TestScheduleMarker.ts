import {getScheduleItemMarker} from '@tricordarr/libraries/Schedule.ts';
import {EventData} from '@tricordarr/libraries/Structs/ControllerStructs.tsx';

describe('getScheduleItemMarker', () => {
  const portTimeZoneID = 'America/New_York';
  it('BLAH', () => {
    const testEvent: EventData = {
      description: '',
      endTime: '2025-03-06T21:30:00.000Z',
      eventID: '42554B5D-09CA-4FC9-BC4E-BA260DEFEA07',
      eventType: 'Official',
      forum: 'BAA88457-FAC8-48F2-8C94-910758458EAE',
      isFavorite: false,
      lastUpdateTime: '2025-03-02T14:21:03.406Z',
      location: 'Lido Market, Deck 9, Aft',
      performers: [],
      startTime: '2025-03-06T15:30:00.000Z',
      timeZone: 'GMT-4',
      timeZoneID: 'America/Lower_Princes',
      title: 'Lido Market Pasta & Salad Stations',
      uid: '2a2884fb76c87a62854e44b8947cd4ac',
    };
    const nowDate = new Date('2025-03-06T16:29:00.000Z');
    const startDate = new Date('2025-03-02T05:00:00.000Z');
    const endDate = new Date('2025-03-09T05:00:00.000Z');
    // const result = calcCruiseDayTime(new Date('2024-03-09T06:00:00.000Z'));
    // expect(result).toEqual({
    //   dayMinutes: 1320, // 22 hours * 60 minutes
    //   cruiseDay: 7,
    // });
    const result = getScheduleItemMarker(testEvent, portTimeZoneID, nowDate, startDate, endDate);
    expect(result).toEqual('soon');
  });
});
