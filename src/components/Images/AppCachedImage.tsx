import React, {useEffect} from 'react';
import {CachedImage, CacheManager} from '@georstat/react-native-image-cache';
import {useConfig} from '../Context/Contexts/ConfigContext.ts';

interface AppCachedImageProps {
  image: string;
}

export const AppCachedImage = (props: AppCachedImageProps) => {
  const {appConfig} = useConfig();
  const fullPath = `${appConfig.serverUrl}/${appConfig.urlPrefix}/image/full/${props.image}`;
  const thumbPath = `${appConfig.serverUrl}/${appConfig.urlPrefix}/image/thumb/${props.image}`;

  useEffect(() => {
    const doThing = async () => {
      const size = await CacheManager.getCacheSize();
      console.log('size', size);
      const isCached = await CacheManager.isImageCached(fullPath);
      console.log('isCached', isCached);
    };
    doThing();
  }, [fullPath]);

  return (
    <CachedImage
      source={fullPath}
      // style={{ height: 350, width: 150 }}
      thumbnailSource={thumbPath}
    />
  );
};
