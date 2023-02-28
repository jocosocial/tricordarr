import {WebView} from 'react-native-webview';
import React, {useEffect, useState, useRef} from 'react';
import {AppSettings} from '../../libraries/AppSettings';
import {BackHandler} from 'react-native';

export const TwitarrView = ({ route }) => {
  const [url, setUrl] = useState();
  const webViewRef = useRef();

  const handleBackButtonPress = () => {
    try {
      webViewRef.current?.goBack();
      return true;
    } catch (err) {
      console.log("[handleBackButtonPress] Error : ", err.message)
    }
  }

  useEffect(() => {  
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);

    const loadSettings = async () => {
      let url = await AppSettings.SERVER_URL.getValue();

      console.log("ROUTE: ", route);

      if(route?.params?.resource) {
        url += `/${route.params.resource}`;

        if(route?.params?.id) {
          url += `/${route.params.id}`;
        }
      }
      
      setUrl(url);
    };
    loadSettings();

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackButtonPress);
    };
  }, [route?.params?.resource, route?.params?.id]);

  return <WebView source={{ uri: url }} ref={webViewRef} />
};
