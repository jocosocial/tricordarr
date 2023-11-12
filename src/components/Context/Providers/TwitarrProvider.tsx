import React, {useState, PropsWithChildren} from 'react';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {TwitarrContext} from '../Contexts/TwitarrContext';
import {useFezListReducer} from '../../Reducers/Fez/FezListReducers';
import {useFezPostsReducer} from '../../Reducers/Fez/FezPostsReducers';
import {useEventListReducer} from '../../Reducers/Schedule/EventListReducer';
import {useScheduleListReducer} from '../../Reducers/Schedule/ScheduleListReducer';

export const TwitarrProvider = ({children}: PropsWithChildren) => {
  const [fez, setFez] = useState<FezData>();
  const [fezList, dispatchFezList] = useFezListReducer([]);
  const [fezPostsData, dispatchFezPostsData] = useFezPostsReducer();
  const [searchString, setSearchString] = useState('');
  const [eventList, dispatchEventList] = useEventListReducer([]);
  const [scheduleList, dispatchScheduleList] = useScheduleListReducer([]);

  return (
    <TwitarrContext.Provider
      value={{
        fez,
        setFez,
        fezList,
        dispatchFezList,
        fezPostsData,
        dispatchFezPostsData,
        searchString,
        setSearchString,
        eventList,
        dispatchEventList,
        scheduleList,
        dispatchScheduleList,
      }}>
      {children}
    </TwitarrContext.Provider>
  );
};
