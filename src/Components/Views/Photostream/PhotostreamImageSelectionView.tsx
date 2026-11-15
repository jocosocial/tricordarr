import {File} from 'expo-file-system';
import {useFormikContext} from 'formik';
import React from 'react';
import {View} from 'react-native';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {ActivityIndicator} from 'react-native-paper';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';

import {ImageButtons} from '#src/Components/Buttons/ImageButtons';
import {AppImage} from '#src/Components/Images/AppImage';
import {useAppImage} from '#src/Context/Contexts/AppImageContext';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {assertPhotostreamCaptureDateAllowed, getImageCaptureDate} from '#src/Libraries/ImageCaptureDate';
import {
  assertBase64WithinSizeLimit,
  assertImageWithinSizeLimit,
  getImageCompressPickerOptions,
} from '#src/Libraries/ImageSize';
import {createLogger} from '#src/Libraries/Logger';
import {isIOS} from '#src/Libraries/Platform/Detection';
import {PhotostreamCreateFormValues} from '#src/Types/FormValues';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

const logger = createLogger('PhotostreamImageSelectionView.tsx');

export const PhotostreamImageSelectionView = () => {
  const {commonStyles, styleDefaults} = useStyles();
  const {setSnackbarPayload} = useSnackbar();
  const {values, setFieldValue} = useFormikContext<PhotostreamCreateFormValues>();
  const [refreshing, setRefreshing] = React.useState(false);
  const {maxImageSize} = useClientSettings();
  const {appConfig} = useConfig();
  const {fromData} = useAppImage();
  const autoCompress = appConfig.userPreferences.autoCompressOversizedImages;
  const compressOptions = getImageCompressPickerOptions(autoCompress, styleDefaults.imageSquareCropDimension);

  // Capture date of the image currently being cropped/blurred. Committed to the form
  // alongside the image once blurring succeeds.
  const pendingCapturedAt = React.useRef<string | undefined>(undefined);

  const onBlur = async (newPath: string) => {
    try {
      const fileUri = newPath.startsWith('file://') ? newPath : `file://${newPath}`;
      logger.debug('Reading blurred image from', fileUri);
      const imageData = await new File(fileUri).base64();
      assertBase64WithinSizeLimit(imageData, maxImageSize);
      await setFieldValue('capturedAt', pendingCapturedAt.current);
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
    try {
      assertImageWithinSizeLimit(image, maxImageSize);
      setRefreshing(true);
      NativeTricordarrModule.blurTextInImage(image.path, onBlur);
    } catch (err: any) {
      if (err instanceof Error) {
        setSnackbarPayload({message: err.message, messageType: 'error'});
      }
      setRefreshing(false);
    }
  };

  const clearImage = async () => {
    await setFieldValue('image', undefined);
    await setFieldValue('capturedAt', undefined);
  };

  /**
   * Validate the capture date of an uncropped picker result, then crop and process it.
   * Cropping is a separate step because the cropped output loses the capture metadata.
   *
   * @param image The uncropped image from the picker or camera, picked with `includeExif`.
   * @param isCamera Whether the image was just taken with the in-app camera.
   * @throws {Error} When the capture date is not allowed or cropping fails/is cancelled.
   */
  const selectImage = async (image: Image, isCamera: boolean) => {
    // A photo just taken in-app with no readable date was, by definition, taken now.
    const capturedAt = getImageCaptureDate(image) ?? (isCamera ? new Date() : undefined);
    logger.debug('Image capture date is', capturedAt?.toISOString());
    assertPhotostreamCaptureDateAllowed(capturedAt);
    const cropped = await ImagePicker.openCropper({
      ...compressOptions,
      path: image.path,
      mediaType: 'photo',
      includeBase64: false,
      width: styleDefaults.imageSquareCropDimension,
      height: styleDefaults.imageSquareCropDimension,
    });
    pendingCapturedAt.current = capturedAt?.toISOString();
    processImage(cropped);
  };

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        includeBase64: false,
        includeExif: true,
        mediaType: 'photo',
        cropping: false,
      });
      await selectImage(image, false);
    } catch (err: any) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setSnackbarPayload({message: err.message, messageType: 'error'});
      }
    }
  };

  const takeImage = async () => {
    const cameraPermission = isIOS ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const permissionStatus = await requestPermission(cameraPermission);
    logger.debug('Camera permission is', permissionStatus);
    try {
      const image = await ImagePicker.openCamera({
        includeBase64: false,
        includeExif: true,
        mediaType: 'photo',
        cropping: false,
      });
      await selectImage(image, true);
    } catch (err: any) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setSnackbarPayload({message: err.message, messageType: 'error'});
      }
    }
  };

  return (
    <View>
      {!values.image && refreshing && <ActivityIndicator />}
      {values.image && <AppImage mode={'scaledimage'} image={fromData(values.image)} />}
      <ImageButtons
        testIDPrefix={'photostream'}
        takeImage={takeImage}
        clearImage={clearImage}
        pickImage={pickImage}
        style={commonStyles.justifyCenter}
        disableDelete={!values.image}
      />
    </View>
  );
};
