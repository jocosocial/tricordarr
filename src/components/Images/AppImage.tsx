import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Avatar} from 'react-native-paper';
import {Image, ImageStyle, StyleProp, TouchableOpacity} from 'react-native';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useImageQuery} from '../Queries/ImageQuery';
import {AppImageViewer} from './AppImageViewer';
import {ImageQueryData} from '../../libraries/Types';

type AppImageProps = {
  // path: string;
  style?: StyleProp<ImageStyle>;
  // fullPath: string;
  onPress?: () => void;
  imageData?: ImageQueryData;
  isLoading?: boolean;
};

export const AppImage = ({style, onPress, imageData, isLoading = false}: AppImageProps) => {
  // const imageQuery = useImageQuery(path);
  // const [enableFullQuery, setEnableFullQuery] = useState(false);
  // const fullImageQuery = useImageQuery(fullPath || path, enableFullQuery);
  // const [visible, setIsVisible] = useState(false);
  // const [viewerImages, setViewerImages] = useState<ImageQueryData[]>([]);

  // const handlePress = async () => {
  //   console.log('AppImage::handlePress');
  //   setEnableFullQuery(true);
  //   await fullImageQuery.refetch();
  // };
  //
  // useEffect(() => {
  //   console.log('AppImage::useEffect::start', !!fullImageQuery.data, fullImageQuery.isRefetching);
  //   if (fullImageQuery.data) {
  //     console.log('AppImage::useEffect::setViewerImages');
  //     setViewerImages([fullImageQuery.data]);
  //   }
  //   if (enableFullQuery) {
  //     console.log('AppImage::useEffect::setIsVisible');
  //     setIsVisible(true);
  //     setEnableFullQuery(false);
  //   }
  // }, [enableFullQuery, fullImageQuery.data, fullImageQuery.isRefetching]);

  if (!imageData && isLoading) {
    return <ActivityIndicator style={style} />;
  }

  if (!imageData) {
    return <Avatar.Icon style={style} icon={AppIcons.error} />;
  }

  return (
    <>
      {/*<AppImageViewer viewerImages={viewerImages} isVisible={visible} setIsVisible={setIsVisible} />*/}
      <TouchableOpacity onPress={onPress}>
        <Image style={style} source={{uri: imageData.dataURI}} />
      </TouchableOpacity>
    </>
  );
};
