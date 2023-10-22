import * as Yup from 'yup';

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
