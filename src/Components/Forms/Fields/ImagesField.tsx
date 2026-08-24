import {useField} from 'formik';
import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {HelperText, Text} from 'react-native-paper';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';

import {ImageButtons} from '#src/Components/Buttons/ImageButtons';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AppImageViewer} from '#src/Components/Images/AppImageViewer';
import {ContentPostAttachedImage} from '#src/Components/Images/ContentPostAttachedImage';
import {useClientSettings} from '#src/Context/Contexts/ClientSettingsContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {assertImageWithinSizeLimit, getImageCompressPickerOptions} from '#src/Libraries/ImageSize';
import {createLogger} from '#src/Libraries/Logger';
import {isIOS} from '#src/Libraries/Platform/Detection';
import {ImageUploadData} from '#src/Structs/ControllerStructs';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

const logger = createLogger('ImagesField.tsx');

interface ImagesFieldProps {
  name: string;
  label?: string;
  maxPhotos: number;
  testIDPrefix: string;
}

/**
 * Multi-image picker for Formik forms. Attach camera or gallery photos up to `maxPhotos`,
 * matching forum-post limits (including the Shutternaut bonus).
 */
export const ImagesField = ({name, label = 'Photos', maxPhotos, testIDPrefix}: ImagesFieldProps) => {
  const {commonStyles, styleDefaults} = useStyles();
  const {setSnackbarPayload} = useSnackbar();
  const {hasShutternaut} = useRoles();
  const {maxImageSize} = useClientSettings();
  const {appConfig} = useConfig();
  const [field, meta, helpers] = useField<ImageUploadData[]>(name);
  const [viewerImages, setViewerImages] = useState<AppImageMetaData[]>([]);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const autoCompress = appConfig.userPreferences.autoCompressOversizedImages;
  const compressOptions = getImageCompressPickerOptions(autoCompress, styleDefaults.imageSquareCropDimension);
  const currentPhotoCount = field.value.length;
  const atMax = currentPhotoCount >= maxPhotos;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          ...commonStyles.paddingBottom,
        },
        labelRow: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.gapSmall,
        },
        imageRow: {
          ...commonStyles.flexRow,
          ...commonStyles.flexWrap,
          ...commonStyles.gapSmall,
          ...commonStyles.marginTopSmall,
        },
        buttons: {
          ...commonStyles.justifyCenter,
        },
      }),
    [commonStyles],
  );

  const processImage = useCallback(
    async (image: Image, fromCamera: boolean) => {
      assertImageWithinSizeLimit(image, maxImageSize);
      if (image.data) {
        await helpers.setValue(field.value.concat([{image: image.data, _shouldSaveToRoll: fromCamera}]));
      }
    },
    [field.value, helpers, maxImageSize],
  );

  const takeImage = useCallback(async () => {
    const cameraPermission = isIOS ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const permissionStatus = await requestPermission(cameraPermission);
    logger.debug('Camera permission is', permissionStatus);
    try {
      const image = await ImagePicker.openCamera({
        includeBase64: true,
        mediaType: 'photo',
        ...compressOptions,
      });
      await processImage(image, true);
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setSnackbarPayload({message: err.message, messageType: 'error'});
      }
    }
  }, [compressOptions, processImage, setSnackbarPayload]);

  const pickImage = useCallback(async () => {
    try {
      const image = await ImagePicker.openPicker({
        includeBase64: true,
        mediaType: 'photo',
        ...compressOptions,
      });
      await processImage(image, false);
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        setSnackbarPayload({message: err.message, messageType: 'error'});
      }
    }
  }, [compressOptions, processImage, setSnackbarPayload]);

  const clearImages = useCallback(async () => {
    await helpers.setValue([]);
    setViewerIndex(0);
  }, [helpers]);

  const removeImage = useCallback(
    (index: number) => {
      helpers.setValue(field.value.filter((_img, idx) => idx !== index));
      setViewerIndex(0);
    },
    [field.value, helpers],
  );

  const openViewer = useCallback(
    (index: number) => {
      setViewerImages(
        field.value
          .filter(img => img.image)
          .map(img => {
            return AppImageMetaData.fromData(img.image!);
          }),
      );
      setViewerIndex(index);
      setIsViewerVisible(true);
    },
    [field.value],
  );

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text>{label}</Text>
        {hasShutternaut && maxPhotos > 1 && <AppIcon icon={AppIcons.shutternaut} />}
      </View>
      <HelperText type={meta.error ? 'error' : 'info'}>
        {meta.error ?? `You can attach up to ${maxPhotos} photo${maxPhotos === 1 ? '' : 's'}.`}
      </HelperText>
      <AppImageViewer
        viewerImages={viewerImages}
        isVisible={isViewerVisible}
        setIsVisible={setIsViewerVisible}
        enableDownload={false}
        initialIndex={viewerIndex}
      />
      {currentPhotoCount > 0 && (
        <View style={styles.imageRow}>
          {field.value.map((imageData, index) => {
            return (
              <ContentPostAttachedImage
                key={imageData.filename ?? imageData.image ?? index}
                onIconPress={() => removeImage(index)}
                onImagePress={() => openViewer(index)}
                imageData={imageData}
              />
            );
          })}
        </View>
      )}
      <ImageButtons
        pickImage={pickImage}
        takeImage={takeImage}
        clearImage={clearImages}
        disableAttach={atMax}
        disableTake={atMax}
        disableDelete={currentPhotoCount === 0}
        style={styles.buttons}
        testIDPrefix={testIDPrefix}
      />
    </View>
  );
};
