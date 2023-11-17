import * as Yup from 'yup';
import {FezType} from './Enums/FezType';

export const UsernameValidation = Yup.string()
  .matches(/^[a-zA-Z0-9-.+_]+$/, 'Username can only contain alphanumeric characters plus "-.+_"')
  .min(2)
  .max(50)
  .required('Username cannot be empty.');

export const RecoveryKeyValidation = Yup.string()
  .min(6)
  .max(7)
  .required('Six-character registration code is required.');

export const PasswordValidation = Yup.string().min(6).max(50).required('Password cannot be empty.');

export const KeywordValidation = Yup.string()
  .matches(/^[a-z]+$/, 'Keyword must be a lowercase word.')
  .min(4)
  .required('A word is required');

// This is a blend of Title/Location/Info from LFGs.
export const InfoStringValidation = Yup.string().min(3).required('Cannot be empty.');

export const NumberValidation = Yup.number()
  .integer()
  .min(0)
  .required('Integer required')
  .typeError('Must be an integer');

export const FezTypeValidation = Yup.string().oneOf(Object.values(FezType), 'Invalid type selected');

export const DateValidation = Yup.date().required('Date is required');
