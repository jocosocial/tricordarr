import {useFormikContext} from 'formik';
import {useEffect} from 'react';

import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('DirtyDetectionField.tsx');

export const DirtyDetectionField = () => {
  const {setHasUnsavedWork} = useErrorHandler();
  const {dirty} = useFormikContext();

  useEffect(() => {
    logger.debug(`Setting unsaved work to ${dirty}`);
    setHasUnsavedWork(dirty);
  }, [dirty, setHasUnsavedWork]);

  return null;
};
