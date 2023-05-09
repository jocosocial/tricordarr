import React, {useState, PropsWithChildren} from 'react';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {TwitarrContext} from '../Contexts/TwitarrContext';
import {useFezListReducer} from '../../Reducers/FezListReducers';
import {useFezPageDataReducer} from '../../Reducers/FezPageDataReducers';

export const TwitarrProvider = ({children}: PropsWithChildren) => {
  const [fez, setFez] = useState<FezData>();
  const [fezList, dispatchFezList] = useFezListReducer();
  const [fezPageData, dispatchFezPageData] = useFezPageDataReducer();

  return (
    <TwitarrContext.Provider
      value={{
        fez,
        setFez,
        fezList,
        dispatchFezList,
        fezPageData,
        dispatchFezPageData,
      }}>
      {children}
    </TwitarrContext.Provider>
  );
};
