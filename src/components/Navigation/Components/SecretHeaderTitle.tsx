import {NavHeaderTitle} from '../../Text/NavHeaderTitle';
import React, {useState} from 'react';

interface SecretHeaderTitleProps {
  title: string;
  onReveal: () => void;
}

export const SecretHeaderTitle = ({title, onReveal}: SecretHeaderTitleProps) => {
  const [pressCount, setPressCount] = useState(0);

  const handleTitlePress = () => {
    // Needs to be separate var because the state hasn't updated in time.
    const newPressCount = pressCount + 1;
    setPressCount(newPressCount);
    if (newPressCount % 5 === 0) {
      onReveal();
    }
  };

  return <NavHeaderTitle title={title} onPress={handleTitlePress} />;
};
