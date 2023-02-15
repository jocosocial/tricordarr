import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// This is a demo of getting/setting various storage mechanisms.

// https://reactnative.dev/docs/security
// https://github.com/emeraldsanto/react-native-encrypted-storage
export async function saveLoginData(data) {
  console.log('doing the password thing');
  console.log(data);
  try {
    await EncryptedStorage.setItem('password', data.password);
    // Congrats! You've just stored your first value!
    console.log('tada!');
  } catch (error) {
    // There was an error on the native side
    console.log('shit');
  }
  try {
    await AsyncStorage.setItem('username', data.username);
    console.log('bazinga!');
  } catch (error) {
    console.log('bad day');
  }
}

export async function getLoginData() {
  try {
    const username = await AsyncStorage.getItem('username');
    const password = await EncryptedStorage.getItem('password');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    return {
      username: username,
      password: password,
    };
  } catch (error) {
    console.log('Error get:');
    console.log(error);
  }
}