import React from 'react';
import {Image, StyleSheet} from 'react-native';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {APIImage} from '#src/Components/Images/APIImage';
import {ContentPostAttachment} from '#src/Components/Views/Content/ContentPostAttachment';
import {AppIcons} from '#src/Enums/Icons';
import {ImageUploadData} from '#src/Structs/ControllerStructs';

interface ContentPostAttachedImageProps {
  imageData: ImageUploadData;
  onIconPress: () => void;
  onImagePress: () => void;
  disabled?: boolean;
}

// Y'know, sometimes I wonder why I am the way I am. Why haven't I been doing the shorthand "props"
// this entire time? No idea.
export const ContentPostAttachedImage = (props: ContentPostAttachedImageProps) => {
  const styles = StyleSheet.create({
    image: {width: 64, height: 64},
  });
  if (props.imageData.image) {
    return (
      <ContentPostAttachment
        onIconPress={props.onIconPress}
        onImagePress={props.onImagePress}
        disabled={props.disabled}>
        <Image resizeMode={'cover'} style={styles.image} source={{uri: `data:image;base64,${props.imageData.image}`}} />
      </ContentPostAttachment>
    );
  } else if (props.imageData.filename) {
    return (
      <ContentPostAttachment onIconPress={props.onIconPress} disabled={props.disabled}>
        <APIImage
          thumbPath={`/image/thumb/${props.imageData.filename}`}
          fullPath={`/image/full/${props.imageData.filename}`}
          mode={'image'}
          style={styles.image}
        />
      </ContentPostAttachment>
    );
  }
  return <AppIcon size={64} icon={AppIcons.error} />;
};
