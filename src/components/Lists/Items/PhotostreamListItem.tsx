import React, {memo} from 'react';
import {PhotostreamImageData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {APIImage} from '#src/Components/Images/APIImage.tsx';
import {View} from 'react-native';
import {PhotostreamImageHeaderView} from '#src/Components/Views/Photostream/PhotostreamImageHeaderView.tsx';
import {PhotostreamImageBodyView} from '#src/Components/Views/Photostream/PhotostreamImageBodyView.tsx';

interface PhotostreamListItemProps {
  item: PhotostreamImageData;
}

const PhotostreamListItemInternal = ({item}: PhotostreamListItemProps) => {
  return (
    <View>
      <PhotostreamImageHeaderView image={item} />
      <View>
        <APIImage
          mode={'scaledimage'}
          thumbPath={`/image/thumb/${item.image}`}
          fullPath={`/image/full/${item.image}`}
        />
      </View>
      <PhotostreamImageBodyView image={item} />
    </View>
  );
};

export const PhotostreamListItem = memo(PhotostreamListItemInternal);
