import {NavHeaderTitle} from '../../Text/NavHeaderTitle';
import React, {useState} from 'react';

interface SecretHeaderTitleProps {
  title: string;
  onReveal: () => void;
  triggerCount?: number;
}

export const SecretHeaderTitle = ({title, onReveal, triggerCount = 5}: SecretHeaderTitleProps) => {
  const [pressCount, setPressCount] = useState(0);

  const handleTitlePress = () => {
    // Needs to be separate var because the state hasn't updated in time.
    const newPressCount = pressCount + 1;
    setPressCount(newPressCount);
    if (newPressCount % triggerCount === 0) {
      onReveal();
    }
  };

  return <NavHeaderTitle title={title} onPress={handleTitlePress} />;
};
