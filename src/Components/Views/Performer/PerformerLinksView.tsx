import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

import {LinkIconButton} from '#src/Components/Buttons/IconButtons/LinkIconButton';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {AppIcons} from '#src/Enums/Icons';
import {PerformerData} from '#src/Structs/ControllerStructs';

interface Props {
  style: StyleProp<ViewStyle>;
  data: PerformerData;
}

export const PerformerLinksView = (props: Props) => {
  if (
    !props.data.website &&
    !props.data.xURL &&
    !props.data.facebookURL &&
    !props.data.instagramURL &&
    !props.data.youtubeURL
  ) {
    return <></>;
  }
  return (
    <PaddedContentView>
      <View style={props.style}>
        <LinkIconButton testID={'performerWebsite-button'} link={props.data.website} icon={AppIcons.webview} />
        <LinkIconButton testID={'performerTwitter-button'} link={props.data.xURL} icon={AppIcons.twitter} />
        <LinkIconButton testID={'performerFacebook-button'} link={props.data.facebookURL} icon={AppIcons.facebook} />
        <LinkIconButton testID={'performerInstagram-button'} link={props.data.instagramURL} icon={AppIcons.instagram} />
        <LinkIconButton testID={'performerYoutube-button'} link={props.data.youtubeURL} icon={AppIcons.youtube} />
      </View>
    </PaddedContentView>
  );
};
