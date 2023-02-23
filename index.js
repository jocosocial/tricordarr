/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {setupBackgroundEventHandler, setupForegroundEventHandler} from './src/libraries/Events';
import {registerForegroundServiceWorker} from './src/libraries/Service';

registerForegroundServiceWorker();
setupBackgroundEventHandler().catch(console.error);
setupForegroundEventHandler().catch(console.error);
AppRegistry.registerComponent(appName, () => App);
