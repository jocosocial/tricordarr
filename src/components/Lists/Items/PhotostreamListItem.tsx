import React from 'react';
import {PhotostreamImageData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {Card} from 'react-native-paper';
import {APIImage} from '../../Images/APIImage.tsx';
import {RelativeTimeTag} from '../../Text/Tags/RelativeTimeTag.tsx';
import {View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

interface PhotostreamListItemProps {
  item: PhotostreamImageData;
}

export const PhotostreamListItem = ({item}: PhotostreamListItemProps) => {
  const {commonStyles} = useStyles();
  return (
    <Card>
      <View style={{...commonStyles.roundedBorderLarge,
        ...commonStyles.overflowHidden}}>
        <APIImage mode={'scaledimage'} thumbPath={`/image/thumb/${item.image}`} fullPath={`/image/full/${item.image}`} />

      </View>
      <Card.Content>
        <Card.Title title={item.location} subtitle={<RelativeTimeTag date={new Date(item.createdAt)} />} />
      </Card.Content>
    </Card>
  );
};
