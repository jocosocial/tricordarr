import React, {useEffect, useState} from 'react';
import {Avatar, IconButton, Text} from 'react-native-paper';
import {Image, ImageStyle, StyleProp, TouchableOpacity, View} from 'react-native';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useImageQuery} from '../Queries/ImageQuery';
import ImageView from 'react-native-image-viewing';
import {ImageSource} from 'react-native-vector-icons/Icon';

type AppImageProps = {
  path: string;
  style?: StyleProp<ImageStyle>;
  fullPath?: string;
};

export const AppImage = ({path, style, fullPath}: AppImageProps) => {
  const {data: imageUri} = useImageQuery(path);
  const [enableFullQuery, setEnableFullQuery] = useState(false);
  const fullImageQuery = useImageQuery(fullPath || path, enableFullQuery);
  console.log('Rendering AppImage');
  const [visible, setIsVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<ImageSource[]>([]);

  const handlePress = async () => {
    setEnableFullQuery(true);
    await fullImageQuery.refetch();
  };

  useEffect(() => {
    if (enableFullQuery && fullImageQuery.data) {
      setViewerImages([{uri: fullImageQuery.data}]);
      setIsVisible(true);
      setEnableFullQuery(false);
    }
  }, [enableFullQuery, fullImageQuery.data]);

  const viewerHeader = imageIndex => {
    return (
      <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
        <IconButton icon={AppIcons.cancel} onPress={() => setIsVisible(false)} />
      </View>
    );
  };

  if (!imageUri) {
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
      />
      <TouchableOpacity onPress={handlePress}>
        <Image style={style} source={{uri: imageUri}} />
      </TouchableOpacity>
    </>
  );
};
