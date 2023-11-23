import {AppImageViewer} from './AppImageViewer';
import {TouchableOpacity} from 'react-native';
import {ActivityIndicator, Card} from 'react-native-paper';
import React, {useEffect, useState} from 'react';
import {useImageQuery} from '../Queries/ImageQuery';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ImageQueryData} from '../../libraries/Types';
import {AppIcon} from './AppIcon';
import {AppIcons} from '../../libraries/Enums/Icons';

interface NewAppImageProps {
  thumbPath: string;
  fullPath: string;
}

export const NewAppImage = ({thumbPath, fullPath}: NewAppImageProps) => {
  const thumbImageQuery = useImageQuery(thumbPath);
  const fullImageQuery = useImageQuery(fullPath, false);
  const {commonStyles} = useStyles();
  const [viewerImages, setViewerImages] = useState<ImageQueryData[]>([]);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [enableFullQuery, setEnableFullQuery] = useState(false);

  const handleThumbPress = () => {
    if (fullImageQuery.data) {
      setEnableFullQuery(true);
      return;
    }
    fullImageQuery.refetch().then(() => {
      setEnableFullQuery(true);
    });
  };

  useEffect(() => {
    if (enableFullQuery && fullImageQuery.data) {
      setViewerImages([fullImageQuery.data]);
      setIsViewerVisible(true);
      setEnableFullQuery(false);
    }
  }, [enableFullQuery, fullImageQuery.data]);

  if (
    thumbImageQuery.isLoading ||
    thumbImageQuery.isFetching ||
    fullImageQuery.isFetching ||
    fullImageQuery.isRefetching
  ) {
    return (
      <Card.Content style={[commonStyles.marginVerticalSmall]}>
        <ActivityIndicator />
      </Card.Content>
    );
  }

  if (!thumbImageQuery.data) {
    return (
      <Card.Content style={[commonStyles.marginVerticalSmall]}>
        <AppIcon icon={AppIcons.error} />
      </Card.Content>
    );
  }

  return (
    <>
      <AppImageViewer viewerImages={viewerImages} isVisible={isViewerVisible} setIsVisible={setIsViewerVisible} />
      <TouchableOpacity onPress={handleThumbPress}>
        <Card.Cover source={{uri: thumbImageQuery.data.dataURI}} />
      </TouchableOpacity>
    </>
  );
};
