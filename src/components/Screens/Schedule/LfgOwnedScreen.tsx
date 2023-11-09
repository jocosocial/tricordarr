import React from 'react';
import {LfgListScreen} from './LfgListScreen';

export const LfgOwnedScreen = () => {
  return <LfgListScreen endpoint={'owner'} />;
};
