import React from 'react';
import {PhotostreamImageData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {APIImage} from '../../Images/APIImage.tsx';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {PhotostreamImageHeaderView} from '../../Views/Photostream/PhotostreamImageHeaderView.tsx';

interface PhotostreamListItemProps {
  item: PhotostreamImageData;
}

export const PhotostreamListItem = ({item}: PhotostreamListItemProps) => {
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
      <View>
        <Text>{item.location}</Text>

      </View>
      {/*<Card.Content>*/}
      {/*  <Card.Title title={item.location} subtitle={} />*/}
      {/*</Card.Content>*/}
    </View>
  );
};
