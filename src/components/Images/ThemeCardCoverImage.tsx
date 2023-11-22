import React, {useEffect, useState} from 'react';
import {useImageQuery} from '../Queries/ImageQuery';
import {ActivityIndicator, Card} from 'react-native-paper';
import {useStyles} from '../Context/Contexts/StyleContext';
import {AppImageViewer} from './AppImageViewer';
import {ImageQueryData} from '../../libraries/Types';
import {TouchableOpacity} from 'react-native';

export const ThemeCardCoverImage = ({fileName}: {fileName: string}) => {
  const imageQuery = useImageQuery(`/image/full/${fileName}`);
  const {commonStyles} = useStyles();
  const [viewerImages, setViewerImages] = useState<ImageQueryData[]>([]);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  useEffect(() => {
    if (imageQuery.data) {
      setViewerImages([imageQuery.data]);
    }
  }, [imageQuery.data]);

  if (imageQuery.isLoading || imageQuery.isFetching) {
    return (
      <Card.Content style={[commonStyles.marginVerticalSmall]}>
        <ActivityIndicator />
      </Card.Content>
    );
  }
  if (!imageQuery.data) {
    return <></>;
  }
  return (
    <>
      <AppImageViewer viewerImages={viewerImages} isVisible={isViewerVisible} setIsVisible={setIsViewerVisible} />
      <TouchableOpacity onPress={() => setIsViewerVisible(true)}>
        <Card.Cover source={{uri: imageQuery.data.dataURI}} />
      </TouchableOpacity>
    </>
  );
};
