import React from 'react';

import {NavHeaderTitle} from '#src/Components/Text/NavHeaderTitle';
import {useSecretTrigger} from '#src/Hooks/useSecretTrigger';

interface SecretHeaderTitleProps {
  title: string;
  onReveal: () => void;
  triggerCount?: number;
}

export const SecretHeaderTitle = ({title, onReveal, triggerCount}: SecretHeaderTitleProps) => {
  const {onPress} = useSecretTrigger({onTrigger: onReveal, triggerCount});

  return <NavHeaderTitle title={title} onPress={onPress} />;
};
