import {useCallback, useState} from 'react';

/**
 * Visibility state for a modal that should not exist until it is first shown. List rows use this so
 * hundreds of posts do not each mount an idle dialog or picker. Once shown the modal stays mounted,
 * so it can still animate closed.
 */
export const useLazyVisibility = () => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => {
    setMounted(true);
    setVisible(true);
  }, []);
  const hide = useCallback(() => setVisible(false), []);

  return {mounted, visible, show, hide};
};
