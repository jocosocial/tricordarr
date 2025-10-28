import React from 'react';

import {AppImage} from '#src/Components/Images/AppImage';
import {AppImageMetaData} from '#src/Types/AppImageMetaData';

// @ts-ignore
import AllImage from '#assets/easteregg_all.jpg';

export const EasterEggImageCardCover = () => {
  return <AppImage mode={'cardcover'} image={AppImageMetaData.fromAsset(AllImage, 'current_image.jpg')} />;
};
