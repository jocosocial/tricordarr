import React from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext.ts';
import {useFormikContext} from 'formik';
import {PhotostreamUploadData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {ImageButtons} from '../../Buttons/ImageButtons.tsx';
import {AppImage} from '../../Images/AppImage.tsx';
import {ImageQueryData} from '../../../libraries/Types';
import {View} from 'react-native';
import {NativeModules} from 'react-native';
import RNFS from 'react-native-fs';

const {ImageTextBlurModule} = NativeModules;

export const PhotostreamImageSelectionView = () => {
  const {commonStyles, styleDefaults} = useStyles();
  const {setErrorMessage} = useErrorHandler();
  const {values, setFieldValue} = useFormikContext<PhotostreamUploadData>();

  const onBlur = async (newPath: string) => {
    try {
      const imageData = await RNFS.readFile(newPath, 'base64');
      await setFieldValue('image', imageData);
    } catch (err) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setErrorMessage(err);
      }
    }
  };

  const processImage = (image: Image) => {
    ImageTextBlurModule.blurTextInImage(image.path, onBlur);
  };

  const clearImage = async () => {
    await setFieldValue('image', undefined);
  };

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        includeBase64: false,
        mediaType: 'photo',
        cropping: true,
        width: styleDefaults.imageSquareCropDimension,
        height: styleDefaults.imageSquareCropDimension,
      });
      processImage(image);
    } catch (err: any) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setErrorMessage(err);
      }
    }
  };

  const takeImage = async () => {
    const permissionStatus = await requestPermission(PERMISSIONS.ANDROID.CAMERA);
    console.log('[UserProfileAvatar.tsx] Camera permission is', permissionStatus);
    try {
      const image = await ImagePicker.openCamera({
        includeBase64: false,
        mediaType: 'photo',
        cropping: true,
        width: styleDefaults.imageSquareCropDimension,
        height: styleDefaults.imageSquareCropDimension,
      });
      processImage(image);
    } catch (err: any) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setErrorMessage(err);
      }
    }
  };

  const imageData = ImageQueryData.fromData(values.image);

  return (
    <View>
      {values.image && <AppImage mode={'scaledimage'} image={imageData} />}
      <ImageButtons
        takeImage={takeImage}
        clearImage={clearImage}
        pickImage={pickImage}
        style={commonStyles.justifyCenter}
        disableDelete={!values.image}
      />
    </View>
  );
};
