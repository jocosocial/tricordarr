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

export const PhotostreamImageSelectionView = () => {
  const {commonStyles} = useStyles();
  const {setErrorMessage} = useErrorHandler();
  const {values, setFieldValue, isSubmitting} = useFormikContext<PhotostreamUploadData>();

  const processImage = (image: Image) => {
    if (image.data) {
      setFieldValue('image', image.data);
    }
  };

  const clearImage = () => {
    setFieldValue('image', undefined);
  };

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        includeBase64: true,
        mediaType: 'photo',
      });
      processImage(image);
    } catch (err: any) {
      setErrorMessage(err);
    }
  };

  const takeImage = async () => {
    const permissionStatus = await requestPermission(PERMISSIONS.ANDROID.CAMERA);
    console.log('[UserProfileAvatar.tsx] Camera permission is', permissionStatus);
    try {
      const image = await ImagePicker.openCamera({
        includeBase64: true,
        mediaType: 'photo',
      });
      processImage(image);
    } catch (err: any) {
      setErrorMessage(err);
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
