import {NavHeaderTitle} from '../../Text/NavHeaderTitle';
import React, {useState} from 'react';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

/**
 * Header title for the SettingsScreen. This has a secret feature to enable/disable the menu of developer
 * options in the Settings. Those are useful for rectal use only.
 */
export const SettingsHeaderTitle = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const [pressCount, setPressCount] = useState(0);
  const {setErrorMessage} = useErrorHandler();

  const handleTitlePress = () => {
    // Needs to be separate var because the state hasn't updated in time.
    const newPressCount = pressCount + 1;
    setPressCount(newPressCount);
    if (newPressCount % 5 === 0) {
      updateAppConfig({
        ...appConfig,
        enableDeveloperOptions: !appConfig.enableDeveloperOptions,
      });
      setErrorMessage(`Developer options are now ${!appConfig.enableDeveloperOptions ? 'enabled' : 'disabled'}`);
    }
  };

  return <NavHeaderTitle title={'Settings'} onPress={handleTitlePress} />;
};
