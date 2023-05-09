import React, {useState, PropsWithChildren} from 'react';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {TwitarrContext} from '../Contexts/TwitarrContext';
import {InfiniteData} from '@tanstack/react-query';
import {useFezListReducer} from '../../Reducers/FezReducers';

export const TwitarrProvider = ({children}: PropsWithChildren) => {
  const [fez, setFez] = useState<FezData>();
  const [fezList, dispatchFezList] = useFezListReducer();
  const [fezPageData, setFezPageData] = useState<InfiniteData<FezData>>();

  return (
    <TwitarrContext.Provider
      value={{
        fez,
        setFez,
        fezList,
        dispatchFezList,
        fezPageData,
        setFezPageData,
      }}>
      {children}
    </TwitarrContext.Provider>
  );
};
