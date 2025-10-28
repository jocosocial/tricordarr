import React from 'react';
import {StyleSheet} from 'react-native';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {APIImageV2} from '#src/Components/Images/APIImageV2';
import {AppImage} from '#src/Components/Images/AppImage';
import {ContentPostAttachment} from '#src/Components/Views/Content/ContentPostAttachment';
import {AppIcons} from '#src/Enums/Icons';
import {ImageUploadData} from '#src/Structs/ControllerStructs';
import {APIImageV2Data} from '#src/Types/APIImageV2Data';

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
        <AppImage mode={'image'} image={APIImageV2Data.fromData(props.imageData.image)} style={styles.image} />
      </ContentPostAttachment>
    );
  } else if (props.imageData.filename) {
    return (
      <ContentPostAttachment onIconPress={props.onIconPress} disabled={props.disabled}>
        <APIImageV2 path={props.imageData.filename} style={styles.image} mode={'image'} staticSize={'thumb'} />
      </ContentPostAttachment>
    );
  }
  return <AppIcon size={64} icon={AppIcons.error} />;
};
