import React from 'react';

import {AppImage} from '#src/Components/Images/AppImage';
import {APIImageV2Data} from '#src/Types/APIImageV2Data';

// @ts-ignore
import AllImage from '#assets/easteregg_all.jpg';

export const EasterEggImageCardCover = () => {
  return <AppImage mode={'cardcover'} image={APIImageV2Data.fromAsset(AllImage, 'current_image.jpg')} />;
};
