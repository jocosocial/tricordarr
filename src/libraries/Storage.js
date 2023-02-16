import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// This is a demo of getting/setting various storage mechanisms.

// https://reactnative.dev/docs/security
// https://github.com/emeraldsanto/react-native-encrypted-storage
export async function saveLoginData(username, userID, token) {
  try {
    await AsyncStorage.setItem('username', username);
    await AsyncStorage.setItem('userID', userID);
    await EncryptedStorage.setItem('token', token);
  } catch (error) {
    console.error(error);
  }
}

export async function getLoginData() {
  try {
    const username = await AsyncStorage.getItem('username');
    const userID = await AsyncStorage.getItem('userID');
    const token = await EncryptedStorage.getItem('token');
    console.log(`Username: ${username}`);
    console.log(`UserID: ${userID}`);
    console.log(`Password: ${token}`);

    return {
      username: username,
      userID: userID,
      token: token,
    };
  } catch (error) {
    console.error('Error get:');
    console.error(error);
  }
}
