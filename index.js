/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {registerForegroundServiceWorker} from './src/libraries/Service';

registerForegroundServiceWorker();

AppRegistry.registerComponent(appName, () => App);
