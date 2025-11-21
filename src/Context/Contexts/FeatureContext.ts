import {createContext, Dispatch, SetStateAction, useContext} from 'react';

import {SwiftarrClientApp, SwiftarrFeature} from '#src/Enums/AppFeatures';

export interface FeatureContextType {
  disabledFeatures: SwiftarrFeature[];
  setDisabledFeatures: Dispatch<SetStateAction<SwiftarrFeature[]>>;
  getIsDisabled: (feature: SwiftarrFeature, clientApp?: SwiftarrClientApp) => boolean;
}

export const FeatureContext = createContext(<FeatureContextType>{});

export const useFeature = () => useContext(FeatureContext);
