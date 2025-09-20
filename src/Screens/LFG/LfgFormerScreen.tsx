import React from 'react';
import {LfgListScreen} from './LfgListScreen';

export const LfgFormerScreen = () => {
  return <LfgListScreen endpoint={'former'} enableFilters={false} enableReportOnly={true} showFab={false} />;
};
