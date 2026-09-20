import React, {PropsWithChildren} from 'react';
import {ImageSourcePropType, ImageURISource} from 'react-native';

import {ImageContext, ImageContextType} from '#src/Context/Contexts/ImageContext';
import {ImageQueryData} from '#src/Types';

const fromData = (data: string): ImageQueryData => {
  return {
    mimeType: 'image',
    dataURI: `data:image;base64,${data}`,
    // @TODO how do I guarantee this to be a JPG?
    fileName: `tricordarr-${new Date().getTime()}.jpg`,
    base64: data,
  };
};

const toImageSource = (queryData: ImageQueryData): ImageSourcePropType => {
  return {uri: queryData.dataURI};
};

const toImageURISource = (queryData: ImageQueryData): ImageURISource => {
  return {uri: queryData.dataURI};
};

const imageContextValue: ImageContextType = {fromData, toImageSource, toImageURISource};

export const ImageProvider = ({children}: PropsWithChildren) => {
  return <ImageContext.Provider value={imageContextValue}>{children}</ImageContext.Provider>;
};
