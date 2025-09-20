import {useFormikContext} from 'formik';
import React from 'react';
import {NativeModules, View} from 'react-native';
import RNFS from 'react-native-fs';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {ActivityIndicator} from 'react-native-paper';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';

import {ImageButtons} from '#src/Components/Buttons/ImageButtons';
import {AppImage} from '#src/Components/Images/AppImage';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {PhotostreamUploadData} from '#src/Structs/ControllerStructs';
import {ImageQueryData} from '#src/Types';

const {ImageTextBlurModule} = NativeModules;

export const PhotostreamImageSelectionView = () => {
  const {commonStyles, styleDefaults} = useStyles();
  const {setSnackbarPayload} = useSnackbar();
  const {values, setFieldValue} = useFormikContext<PhotostreamUploadData>();
  const [refreshing, setRefreshing] = React.useState(false);

  const onBlur = async (newPath: string) => {
    setRefreshing(true);
    try {
      const imageData = await RNFS.readFile(newPath, 'base64');
      await setFieldValue('image', imageData);
    } catch (err) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setSnackbarPayload({message: err.message, messageType: 'error'});
      }
    } finally {
      setRefreshing(false);
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
        setSnackbarPayload({message: err.message, messageType: 'error'});
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
        setSnackbarPayload({message: err.message, messageType: 'error'});
      }
    }
  };

  const imageData = ImageQueryData.fromData(values.image);

  return (
    <View>
      {!values.image && refreshing && <ActivityIndicator />}
      {values.image && <AppImage mode={'scaledimage'} image={imageData} />}
      <ImageButtons
        takeImage={takeImage}
        clearImage={clearImage}
        pickImage={pickImage}
        disableAttach={true}
        style={commonStyles.justifyCenter}
        disableDelete={!values.image}
      />
    </View>
  );
};
