import React, {memo} from 'react';
import {View} from 'react-native';

import {APIImage} from '#src/Components/Images/APIImage';
import {PhotostreamImageBodyView} from '#src/Components/Views/Photostream/PhotostreamImageBodyView';
import {PhotostreamImageHeaderView} from '#src/Components/Views/Photostream/PhotostreamImageHeaderView';
import {PhotostreamImageData} from '#src/Structs/ControllerStructs';

interface PhotostreamListItemProps {
  item: PhotostreamImageData;
}

const PhotostreamListItemInternal = ({item}: PhotostreamListItemProps) => {
  return (
    <View>
      <PhotostreamImageHeaderView image={item} />
      <View>
        <APIImage mode={'scaledimage'} path={item.image} />
      </View>
      <PhotostreamImageBodyView image={item} />
    </View>
  );
};

export const PhotostreamListItem = memo(PhotostreamListItemInternal);
