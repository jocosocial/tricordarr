import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {SwiftarrFeature} from '../../../Libraries/Enums/AppFeatures';

export interface FeatureContextType {
  disabledFeatures: SwiftarrFeature[];
  setDisabledFeatures: Dispatch<SetStateAction<SwiftarrFeature[]>>;
  getIsDisabled: (feature: SwiftarrFeature) => boolean;
}

export const FeatureContext = createContext(<FeatureContextType>{});

export const useFeature = () => useContext(FeatureContext);
