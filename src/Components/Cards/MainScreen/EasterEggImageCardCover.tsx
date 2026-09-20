import React from 'react';

import {AppImage} from '#src/Components/Images/AppImage';
import {useAppImage} from '#src/Context/Contexts/AppImageContext';

// @ts-ignore
import AllImage from '#assets/easteregg_all.jpg';

export const EasterEggImageCardCover = () => {
  const {fromAsset} = useAppImage();
  return <AppImage mode={'cardcover'} image={fromAsset(AllImage, 'current_image.jpg')} />;
};
