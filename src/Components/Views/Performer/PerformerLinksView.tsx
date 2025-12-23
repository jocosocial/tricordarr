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
        <LinkIconButton link={props.data.website} icon={AppIcons.webview} />
        <LinkIconButton link={props.data.xURL} icon={AppIcons.twitter} />
        <LinkIconButton link={props.data.facebookURL} icon={AppIcons.facebook} />
        <LinkIconButton link={props.data.instagramURL} icon={AppIcons.instagram} />
        <LinkIconButton link={props.data.youtubeURL} icon={AppIcons.youtube} />
      </View>
    </PaddedContentView>
  );
};
