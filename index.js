/**
 * @format
 */

// Polyfill for crypto.getRandomValues() required by uuid
import 'react-native-get-random-values';

import {AppRegistry} from 'react-native';

// eslint-disable-next-line no-restricted-imports
import App from './App';
// eslint-disable-next-line no-restricted-imports
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
