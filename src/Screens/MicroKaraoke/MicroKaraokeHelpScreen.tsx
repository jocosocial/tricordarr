import React from 'react';

import {KrakenView} from '#src/Components/Views/Static/KrakenView';
import {NotImplementedView} from '#src/Components/Views/Static/NotImplementedView';
import {isIOS} from '#src/Libraries/Platform/Detection';

export const MicroKaraokeHelpScreen = () => {
  if (isIOS) {
    return <KrakenView />;
  }
  return <NotImplementedView />;
};
