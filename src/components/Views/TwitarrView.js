import { WebView } from 'react-native-webview';
import React, {useEffect, useState} from 'react';
import {AppSettings} from '../../libraries/AppSettings';

export const TwitarrView = () => {
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      setServerUrl(await AppSettings.SERVER_URL.getValue());
    };
    loadSettings();
  }, []);

  console.log(serverUrl)

  return <WebView source={{ uri: serverUrl }} />;
};
