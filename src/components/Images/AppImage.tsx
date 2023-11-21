import React, {useEffect, useState} from 'react';
import {Avatar, IconButton, Snackbar, Text} from 'react-native-paper';
import {Image, ImageStyle, StyleProp, TouchableOpacity, View} from 'react-native';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useImageQuery, useRawImageQuery} from '../Queries/ImageQuery';
import ImageView from 'react-native-image-viewing';
import {ImageSource} from 'react-native-vector-icons/Icon';
import {PERMISSIONS, request as requestPermission} from 'react-native-permissions';
import RNFS from 'react-native-fs';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {ImageQueryData} from '../../libraries/Types';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {ImageViewerSnackbar} from '../Snackbars/ImageViewerSnackbar';

type AppImageProps = {
  path: string;
  style?: StyleProp<ImageStyle>;
  fullPath: string;
};

export const AppImage = ({path, style, fullPath}: AppImageProps) => {
  const imageQuery = useImageQuery(path);
  const [enableFullQuery, setEnableFullQuery] = useState(false);
  const fullImageQuery = useImageQuery(fullPath || path, enableFullQuery);
  console.log('Rendering AppImage');
  const [visible, setIsVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<ImageSource[]>([]);
  console.log(fullPath);
  const rawImageQuery = useImageQuery(fullPath);
  const [viewerMessage, setViewerMessage] = useState<string>();

  const handlePress = async () => {
    setEnableFullQuery(true);
    await fullImageQuery.refetch();
  };

  useEffect(() => {
    if (enableFullQuery && fullImageQuery.data) {
      setViewerImages([{uri: ImageQueryData.toDataURI(fullImageQuery.data.base64, fullImageQuery.data.mimeType)}]);
      setIsVisible(true);
      setEnableFullQuery(false);
    }
  }, [enableFullQuery, fullImageQuery.data]);

  const viewerHeader = ({imageIndex}: {imageIndex: number}) => {
    return (
      <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
        <IconButton icon={AppIcons.download} onPress={() => saveImage(viewerImages[imageIndex])} />
        <IconButton icon={AppIcons.close} onPress={() => setIsVisible(false)} />
      </View>
    );
  };

  const viewerFooter = ({imageIndex}: {imageIndex: number}) => {
    return (
      <ImageViewerSnackbar message={viewerMessage} setMessage={setViewerMessage} />
    );
  };

  const saveImage = async (sourceUri: string) => {
    const permission = await requestPermission(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
    console.log(permission);
    const foo = await CameraRoll.getAlbums({assetType: 'Photos'});
    console.log(foo);
    // console.log(sourceUri);
    const destPath = `${RNFS.DocumentDirectoryPath}/foo.jpg`;
    if (!rawImageQuery.data) {
      console.log('NO DATA');
      return;
    }
    const writeResult = await RNFS.writeFile(destPath, rawImageQuery.data.base64, 'base64');
    console.log(writeResult);
    // await RNFS.copyFile(sourceUri, destPath);
    console.log('laslskdkslsd');
    try {
      const result = await CameraRoll.save(destPath, {
        type: 'photo',
        album: 'Tricordarr',
      });
      console.log(result);
      setViewerMessage('Saved photo to camera roll');
    } catch (err) {
      console.log('ERROR', err);
    }

    console.log('cleanup');
    const cleanResult = await RNFS.unlink(destPath);
    console.log(cleanResult);

    console.log('success!');
  };

  if (!imageQuery.data) {
    return <Avatar.Icon style={style} icon={AppIcons.error} />;
  }

  return (
    <>
      <ImageView
        images={viewerImages}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        HeaderComponent={viewerHeader}
        animationType={'none'}
        presentationStyle={'formSheet'}
        FooterComponent={viewerFooter}
      />
      <TouchableOpacity onPress={handlePress}>
        <Image
          style={style}
          source={{uri: ImageQueryData.toDataURI(imageQuery.data.base64, imageQuery.data.mimeType)}}
        />
      </TouchableOpacity>
    </>
  );
};
