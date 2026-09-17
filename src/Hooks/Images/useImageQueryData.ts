import {ImageSourcePropType, ImageURISource} from 'react-native';

import {ImageQueryData} from '#src/Types';

/**
 * @deprecated Use useAppImage (APIImageV2Data) instead.
 */
export const useImageQueryData = () => {
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

  return {fromData, toImageSource, toImageURISource};
};
