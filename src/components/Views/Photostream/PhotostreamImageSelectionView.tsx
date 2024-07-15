import {View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import React, {useEffect, useState} from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext.ts';
import {useFormikContext} from 'formik';
import {PhotostreamUploadData, PostContentData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {AppImageViewer} from '../../Images/AppImageViewer.tsx';
import {ImageQueryData} from '../../../libraries/Types';
import {ContentPostAttachedImage} from '../../Images/ContentPostAttachedImage.tsx';

interface PhotostreamImageSelectionViewProps {}

export const PhotostreamImageSelectionView = () => {
  const {commonStyles} = useStyles();
  const {setErrorMessage} = useErrorHandler();
  const {values, setFieldValue, isSubmitting} = useFormikContext<PhotostreamUploadData>();
  const [viewerImages, setViewerImages] = useState<ImageQueryData[]>([]);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

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
        cropping: true,
        width: 2048,
        height: 2048,
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

  useEffect(() => {
    setViewerImages([
      {
        mimeType: 'image',
        dataURI: `data:image;base64,${values.image}`,
        fileName: 'New Image',
      },
    ]);
  }, [values.image]);

  return (
    <>
      <AppImageViewer
        viewerImages={viewerImages}
        isVisible={isViewerVisible}
        setIsVisible={setIsViewerVisible}
        enableDownload={false}
        initialIndex={0}
      />
      <ContentPostAttachedImage
        onIconPress={() => {
          clearImage();
        }}
        onImagePress={() => {
          setIsViewerVisible(true);
        }}
        disabled={isSubmitting}
        imageData={{image: values.image}}
      />
      <View style={[commonStyles.flexRow, commonStyles.justifyCenter]}>
        <IconButton icon={AppIcons.newImage} onPress={pickImage} />
        <IconButton icon={AppIcons.newImageCamera} onPress={takeImage} />
        <IconButton icon={AppIcons.delete} onPress={clearImage} disabled={!values.image} />
      </View>
    </>
  );
};
