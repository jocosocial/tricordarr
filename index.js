/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {setupBackgroundEventHandler} from './src/notifications';

setupBackgroundEventHandler().catch(console.error);
AppRegistry.registerComponent(appName, () => App);
