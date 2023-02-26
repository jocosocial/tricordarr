import {ReactNode} from 'react';

// https://stackoverflow.com/questions/55370851/how-to-fix-binding-element-children-implicitly-has-an-any-type-ts7031
export interface DefaultProviderProps {
  children?: ReactNode;
}
