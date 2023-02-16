import React, {useState, useEffect, useCallback} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Section} from '../Section';
import {backgroundStyle} from '../../styles';
import {LoginForm} from '../forms/Login';
import {getLoginData} from '../../libraries/Storage';
import {apiQuery, getAuthHeaders} from "../../libraries/APIClient";
import {TokenStringData} from "../../libraries/structs/ControllerStructs"


export const AlertText = ({message}) => {

  // Be sure this is after any hooks or you'll get that error we all hate!
  if (!message || message === '') {
    return (<></>)
  }
  return (
    <Text style={{color: 'red', backgroundColor: 'blue', fontWeight: 'bold'}}>{message}</Text>
  )
}

// https://stackoverflow.com/questions/62248741/how-to-apply-useeffect-based-on-form-submission-in-react
// https://devtrium.com/posts/async-functions-useeffect
export const LoginView = ({navigation}) => {
  const [errorMessage, setErrorMessage] = useState()

  const fetchData = useCallback(async (credentials) => {
    let authHeaders = getAuthHeaders(credentials.username, credentials.password)
    try {
      let loginResponse = await apiQuery('/auth/login', 'POST', authHeaders)
      let data = await loginResponse.json()
      let classData = new TokenStringData(...data)
      setErrorMessage(undefined)
      // @TODO save token and do navigation
      console.log("Got response:", data)
      console.log(classData)
    } catch (error) {
      setErrorMessage(error.toString())
    }
  }, [])

  const onSubmit = useCallback(async (values) => {
    await fetchData(values).catch((e) => {
      setErrorMessage(e.toString())
    })
  }, [fetchData])

  return (
    <SafeAreaView style={backgroundStyle}>
      {/*<StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'}/>*/}
      <StatusBar barStyle={'light-content'}/>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            // backgroundColor: isDarkMode ? Colors.black : Colors.white,
            backgroundColor: Colors.red,
          }}>
          <Section title="Login">
            <LoginForm onSubmit={onSubmit}/>
            <AlertText message={errorMessage}/>
          </Section>
          <Section>
            <Button
              title={'Home'}
              onPress={() => navigation.navigate('Home')}
            />
            <Button
              title={'Check'}
              color={'red'}
              onPress={async () => {
                const data = await getLoginData();
                console.log('Login data:');
                console.log(data);
              }}
            />
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};