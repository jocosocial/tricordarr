import {useFormikContext} from 'formik';
import {useEffect} from 'react';

import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';

export const DirtyDetectionField = () => {
  const {setHasUnsavedWork} = useErrorHandler();
  const {dirty} = useFormikContext();

  useEffect(() => {
    console.log(`[DirtyDetectionField.tsx] Setting unsaved work to ${dirty}`);
    setHasUnsavedWork(dirty);
  }, [dirty, setHasUnsavedWork]);

  return null;
};
