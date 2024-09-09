import React from 'react';
import {PhotostreamImageData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {APIImage} from '../../Images/APIImage.tsx';
import {View} from 'react-native';
import {PhotostreamImageHeaderView} from '../../Views/Photostream/PhotostreamImageHeaderView.tsx';
import {PhotostreamImageBodyView} from '../../Views/Photostream/PhotostreamImageBodyView.tsx';
import {AppCachedImage} from '../../Images/AppCachedImage.tsx';

interface PhotostreamListItemProps {
  item: PhotostreamImageData;
}

export const PhotostreamListItem = ({item}: PhotostreamListItemProps) => {
  return (
    <View>
      <PhotostreamImageHeaderView image={item} />
      <View>
        {/*<APIImage*/}
        {/*  mode={'scaledimage'}*/}
        {/*  thumbPath={`/image/thumb/${item.image}`}*/}
        {/*  fullPath={`/image/full/${item.image}`}*/}
        {/*/>*/}
        <AppCachedImage image={item.image} />
      </View>
      <PhotostreamImageBodyView image={item} />
    </View>
  );
};
