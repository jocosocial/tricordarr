import {useErrorHandler} from '#src/Components/Context/Contexts/ErrorHandlerContext.ts';
import {useEffect} from 'react';
import {useFormikContext} from 'formik';

export const DirtyDetectionField = () => {
  const {setHasUnsavedWork} = useErrorHandler();
  const {dirty} = useFormikContext();

  useEffect(() => {
    console.log(`[DirtyDetectionField.tsx] Setting unsaved work to ${dirty}`);
    setHasUnsavedWork(dirty);
  }, [dirty, setHasUnsavedWork]);

  return null;
};
