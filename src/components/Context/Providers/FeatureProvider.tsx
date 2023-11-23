import React, {PropsWithChildren, useEffect, useState} from 'react';
import {SwiftarrClientApp, SwiftarrFeature} from '../../../libraries/Enums/AppFeatures';
import {FeatureContext} from '../Contexts/FeatureContext';
import {useUserNotificationData} from '../Contexts/UserNotificationDataContext';

export const FeatureProvider = ({children}: PropsWithChildren) => {
  const [disabledFeatures, setDisabledFeatures] = useState<SwiftarrFeature[]>([]);
  const {userNotificationData} = useUserNotificationData();

  useEffect(() => {
    if (userNotificationData) {
      const ourFeatures = userNotificationData.disabledFeatures
        .filter(disabledFeature => {
          if (disabledFeature.appName === SwiftarrClientApp.tricordarr) {
            return disabledFeature.featureName;
          }
        })
        .map(disabledFeature => {
          return disabledFeature.featureName;
        });
      setDisabledFeatures(ourFeatures);
    }
  }, [userNotificationData]);

  const getIsDisabled = (feature: SwiftarrFeature) => {
    return disabledFeatures.includes(feature) || disabledFeatures.includes(SwiftarrFeature.all);
  };

  return (
    <FeatureContext.Provider
      value={{
        disabledFeatures,
        setDisabledFeatures,
        getIsDisabled,
      }}>
      {children}
    </FeatureContext.Provider>
  );
};
