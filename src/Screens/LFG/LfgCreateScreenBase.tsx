import React from 'react';

import {LfgForm} from '#src/Components/Forms/LfgForm';
import {FezType} from '#src/Enums/FezType';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFezForm} from '#src/Hooks/useFezForm';
import {useScrollToTopIntent} from '#src/Hooks/useScrollToTopIntent';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {LfgStackComponents} from '#src/Navigation/Stacks/Lfg/LfgStackComponents';
import {FezCreateScreenBase} from '#src/Screens/Fez/FezCreateScreenBase';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface Props {
  title?: string;
  info?: string;
  location?: string;
  fezType?: FezType;
  duration?: number;
  minCapacity?: number;
  maxCapacity?: number;
  cruiseDay?: number;
  initialUserHeaders?: UserHeader[];
}

export const LfgCreateScreenBase = ({
  title = '',
  info = '',
  location = '',
  fezType = FezType.activity,
  duration = 30,
  minCapacity = 2,
  maxCapacity = 2,
  cruiseDay,
  initialUserHeaders = [],
}: Props) => {
  const navigation = useCommonStack();
  const {getInitialValues} = useFezForm();
  const {createFez} = useFezCacheReducer();
  const dispatchScrollToTop = useScrollToTopIntent();
  const initialValues = getInitialValues({
    title,
    info,
    location,
    fezType,
    duration,
    minCapacity,
    maxCapacity,
    cruiseDay,
    initialUsers: initialUserHeaders,
  });

  return (
    <FezCreateScreenBase
      initialValues={initialValues}
      buildFezContentData={(values, startTime, endTime) => ({
        fezType: values.fezType,
        title: values.title,
        info: values.info,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location: values.location,
        minCapacity: Number(values.minCapacity),
        maxCapacity: Number(values.maxCapacity),
        initialUsers: values.initialUsers.map(u => u.userID),
      })}
      onSuccess={response => {
        createFez(response);
        dispatchScrollToTop(LfgStackComponents.lfgListScreen);
        navigation.replace(CommonStackComponents.lfgScreen, {fezID: response.fezID});
      }}
      helpScreen={CommonStackComponents.lfgCreateHelpScreen}
      renderForm={({onSubmit, initialValues: formInitialValues}) => (
        <LfgForm onSubmit={onSubmit} initialValues={formInitialValues} />
      )}
    />
  );
};
