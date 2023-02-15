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


export const AlertText = ({message}) => {
  return (
    <Text style={{color: 'red', backgroundColor: 'blue', fontWeight: 'bold'}}>{message}</Text>
  )
}

// https://stackoverflow.com/questions/62248741/how-to-apply-useeffect-based-on-form-submission-in-react
// https://devtrium.com/posts/async-functions-useeffect
export const LoginView = ({navigation}) => {
  console.log("Start Render")
  const [errorMessage, setErrorMessage] = useState("LOLZ ERROR")
  // const [apiResponse, setApiResponse] = useState()
  // const [formData, setFormData] = useState({})
  // const [formData, setFormData] = useState({})


  // THe new stuff

  // useEffect(() => {
  //   console.log("Effecting apiResponse")
  //   // console.log(apiResponse)
  //   // setErrorMessage("NONE!")
  // }, [apiResponse])
  //
  // useEffect(() => {
  //   console.log("Effecting errorMessage")
  //   // console.log(apiResponse)
  //   // setErrorMessage("NONE!")
  // }, [errorMessage])


  // End the new stuff

  // useEffect(() => {
  //   console.log("Change to API response")
  //   if (apiResponse && apiResponse.status >= 400) {
  //     console.log("bad day")
  //     console.log(apiResponse.status)
  //   }
  //   // return null;
  // }, [apiResponse])






  // const fetchData = async (credentials) => {
  //   //   console.log("Attempting to log in.")
  //   let authHeaders = getAuthHeaders(credentials.username, credentials.password)
  //   try {
  //     let loginResponse = await apiQuery('/auth/login', 'POST', authHeaders)
  //     let data = await loginResponse.json()
  //     // setApiResponse(data)
  //     // setErrorMessage("NONE!")
  //   } catch (error) {
  //     console.log("ERRORZ", error.toString())
  //     // setApiResponse()
  //     // setErrorMessage(error.toString())
  //     setErrorMessage("Something bad happened")
  //   }
  //   console.log("Finished fetchData")
  // }






  //   // @TODO move this to something not here
  //   // if (loginResponse.status >= 400) {
  //   //   let responseBody = await loginResponse.json()
  //   //   // throw new Error(responseBody.reason)
  //   //   console.log("Bad day")
  //   //   setErrorMessage(responseBody.reason)
  //   // }
  //   // I can't tell if this breaks everything or not
  //   // setApiResponse(loginResponse)
  //   // return null;
  //   return null;
  // }

  // useEffect(() => {
  // async function fetchData(credentials) {
  //   console.log("Attempting to log in.")
  //   let authHeaders = getAuthHeaders(credentials.username, credentials.password)
  //   let loginResponse = await apiQuery('/auth/login', 'POST', authHeaders)
  //   // @TODO move this to something not here
  //   // if (loginResponse.status >= 400) {
  //   //   let responseBody = await loginResponse.json()
  //   //   // throw new Error(responseBody.reason)
  //   //   console.log("Bad day")
  //   //   setErrorMessage(responseBody.reason)
  //   // }
  //   // I can't tell if this breaks everything or not
  //   // setApiResponse(loginResponse)
  //   // return null;
  // }
  // console.log("Form Data:")
  // console.log(formData)
  // if (formData !== {}) {
  //   console.log("Attempting fetch")
  //   fetchData(formData).catch((e) => setErrorMessage(e))
  // }
  // }, [formData])



  // useEffect(() => {
  //   console.log("GOT NEW FORM DATA")
  // }, [formData])

  // useEffect(() => {
  //   console.log("useEffecting!")
  //   console.log(apiResponse)
  //   console.log(errorMessage)
  // }, [])

  // async function getErrorFromResponse(response) {
  //   let body = await response.json();
  //   return body.reason
  // }

  // useEffect(() => {
  //   console.log("Effecting apiResponse")
  //   if (apiResponse && apiResponse.status > 400) {
  //     console.log("Bad day")
  //     console.log(apiResponse.status)
  //     setErrorMessage(getErrorFromResponse(apiResponse))
  //   }
  //   // async function processResponse() {
  //   //   if (apiResponse && apiResponse.status > 400) {
  //   //     let body = await apiResponse.json()
  //   //     console.log(body)
  //   //   }
  //   // }
  //   // processResponse();
  // }, [apiResponse])

  // function onSubmit(values) {
  const onSubmit = async (values) => {
    console.log("Calling onSubmit")
    console.log(values)
    let authHeaders = getAuthHeaders(values.username, values.password)
    console.log(authHeaders)
    try {
      let loginResponse = await apiQuery('/auth/login', 'POST', authHeaders)
      let data = await loginResponse.json()
      console.log("SUCCESS")
    } catch(e) {
      console.log("ERROR", e.toString())
      setErrorMessage("Something bad happened")
    }
    // await fetchData(values).catch((e) => {
    //   console.error("onSubmit blew up")
    //   console.error(e)
    // })
    console.log("Finished onSubmit")
    // return null;
  }

  console.log("End Render")
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
            <AlertText message={"fuck"}/>
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