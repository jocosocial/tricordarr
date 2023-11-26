import React, {PropsWithChildren, useEffect, useState} from 'react';
import {SwiftarrClientApp, SwiftarrFeature} from '../../../libraries/Enums/AppFeatures';
import {FeatureContext} from '../Contexts/FeatureContext';
import {useUserNotificationData} from '../Contexts/UserNotificationDataContext';

export const FeatureProvider = ({children}: PropsWithChildren) => {
  // Default to disabling images since those queries can fire pretty quickly. Once the state updates
  // from UserNotificationData then the queries will all re-enable and function as expected.
  const [disabledFeatures, setDisabledFeatures] = useState<SwiftarrFeature[]>([SwiftarrFeature.images]);
  const {userNotificationData} = useUserNotificationData();

  useEffect(() => {
    if (userNotificationData) {
      const ourFeatures = userNotificationData.disabledFeatures
        .filter(disabledFeature => {
          if (
            disabledFeature.appName === SwiftarrClientApp.tricordarr ||
            disabledFeature.appName === SwiftarrClientApp.all
          ) {
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
