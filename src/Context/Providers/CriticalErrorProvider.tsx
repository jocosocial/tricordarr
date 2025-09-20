import React from 'react';
import {PropsWithChildren, ReactElement} from 'react';
import ErrorBoundary from 'react-native-error-boundary';
import {CriticalErrorView} from '#src/Views/Static/CriticalErrorView.tsx';

export const CriticalErrorProvider = (props: PropsWithChildren) => {
  return <ErrorBoundary FallbackComponent={CriticalErrorView}>{props.children as ReactElement}</ErrorBoundary>;
};
