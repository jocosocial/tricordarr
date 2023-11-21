import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Avatar} from 'react-native-paper';
import {Image, ImageStyle, StyleProp, TouchableOpacity} from 'react-native';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useImageQuery} from '../Queries/ImageQuery';
import {AppImageViewer} from './AppImageViewer';
import {ImageQueryData} from '../../libraries/Types';

type AppImageProps = {
  path: string;
  style?: StyleProp<ImageStyle>;
  fullPath: string;
};

export const AppImage = ({path, style, fullPath}: AppImageProps) => {
  const imageQuery = useImageQuery(path);
  const [enableFullQuery, setEnableFullQuery] = useState(false);
  const fullImageQuery = useImageQuery(fullPath || path, enableFullQuery);
  const [visible, setIsVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<ImageQueryData[]>([]);

  const handlePress = async () => {
    setEnableFullQuery(true);
    await fullImageQuery.refetch();
  };

  useEffect(() => {
    if (enableFullQuery && fullImageQuery.data) {
      setViewerImages([fullImageQuery.data]);
      setIsVisible(true);
      setEnableFullQuery(false);
    }
  }, [enableFullQuery, fullImageQuery.data]);

  if ((!imageQuery.data && imageQuery.isLoading) || enableFullQuery) {
    return <ActivityIndicator style={style} />;
  }

  if (!imageQuery.data) {
    return <Avatar.Icon style={style} icon={AppIcons.error} />;
  }

  return (
    <>
      <AppImageViewer viewerImages={viewerImages} isVisible={visible} setIsVisible={setIsVisible} />
      <TouchableOpacity onPress={handlePress}>
        <Image style={style} source={{uri: imageQuery.data.dataURI}} />
      </TouchableOpacity>
    </>
  );
};
