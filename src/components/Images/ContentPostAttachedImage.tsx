import React from 'react';
import {ContentPostAttachmentImage} from './ContentPostAttachmentImage';
import {useImageQuery} from '../Queries/ImageQuery';
import {ActivityIndicator} from 'react-native-paper';
import {ImageUploadData} from '../../libraries/Structs/ControllerStructs';

interface ContentPostAttachedImageProps {
  imageData: ImageUploadData;
  // imagePath: string;
  onIconPress: () => void;
  onImagePress: () => void;
  disabled?: boolean;
}

// Y'know, sometimes I wonder why I am the way I am. Why haven't I been doing the shorthand "props"
// this entire time? No idea.
export const ContentPostAttachedImage = (props: ContentPostAttachedImageProps) => {
  let imagePath = `/image/thumb/${props.imageData.filename}`;
  const imageQuery = useImageQuery(imagePath, !!props.imageData.filename);
  let imageUri = '';

  if (props.imageData.filename && !imageQuery.data) {
    return <ActivityIndicator />;
  }

  if (imageQuery.data) {
    imageUri = imageQuery.data.dataURI;
  } else if (props.imageData.image) {
    imageUri = `data:image;base64,${props.imageData.image}`;
  }

  return (
    <ContentPostAttachmentImage
      imageSource={{uri: imageUri}}
      onIconPress={props.onIconPress}
      onImagePress={props.onImagePress}
      disabled={props.disabled}
    />
  );
};
