import {ImageQueryData} from '../Types';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';
import RNFS from 'react-native-fs';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

const extensionRegExp = new RegExp('\\.', 'i');

const getImageDestinationPath = (fileName: string, mimeType: string) => {
  let destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  if (!extensionRegExp.test(fileName) && mimeType === 'image/jpeg') {
    destPath = `${destPath}.jpg`;
  }
  return destPath;
};

export const saveImageToLocal = async (imageData: ImageQueryData) => {
  console.log('Saving image', imageData.fileName);
  const permission = await requestPermission(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
  // check permission from here
  let destPath = getImageDestinationPath(imageData.fileName, imageData.mimeType);
  if (!imageData.base64) {
    throw Error(`No data to save to file ${destPath}`);
  }
  console.log('Writing data to', destPath);
  await RNFS.writeFile(destPath, imageData.base64, 'base64');
  const cameraRollSaveResult = await CameraRoll.save(destPath, {
    type: 'photo',
    album: 'Tricordarr',
  });
  await RNFS.unlink(destPath);
  console.log('Saved to camera roll at', cameraRollSaveResult);
  return cameraRollSaveResult;
};
