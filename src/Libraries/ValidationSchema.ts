import * as Yup from 'yup';

import {FezType} from '#src/Enums/FezType';

export const UsernameValidation = Yup.string()
  .matches(/^[a-zA-Z0-9-.+_]+$/, 'Username can only contain alphanumeric characters plus "-.+_"')
  .min(2)
  .max(50)
  .required('Username cannot be empty.');

export const RecoveryKeyValidation = Yup.string()
  .min(6)
  .max(7)
  .required('Six-character registration code is required.');

export const AccountRecoveryValidation = Yup.string()
  .min(6)
  .required('Old password, registration code, or recovery key required.');

export const PasswordValidation = Yup.string().min(6).max(50).required('Password cannot be empty.');

export const KeywordValidation = Yup.string()
  .matches(/^[a-z]+$/, 'Keyword must be a lowercase word.')
  .min(4)
  .required('A word is required');

// This is a blend of Title/Location/Info from LFGs.
export const InfoStringValidation = Yup.string().min(3).max(2000).required('Cannot be empty.');

export const NumberValidation = Yup.string()
  .matches(/^[0-9]+$/, 'Must be an integer.')
  .required('Integer required');

// Object.values(FezType) also brings in the namespace functions which makes this very sad.
export const LFGTypeValidation = Yup.mixed<FezType>().oneOf(FezType.lfgTypes, 'Invalid LFG type selected');

export const DateValidation = Yup.date().required('Date is required');

export const EmailValidation = Yup.string().email().min(2).max(50);

export const RoomNumberValidation = Yup.string()
  .optional()
  .min(4, 'If specified, must be minimum 4 characters')
  .max(20);

export const OptionalURLValidation = Yup.string().url().optional();

export const OptionalBioStringValidation = Yup.string().max(2000).optional();

export const ForumPostTextValidation = Yup.string()
  .required('Post is required.')
  .min(1, 'Post cannot be empty.')
  .max(2000, 'Post must be less than 2000 characters.')
  .test('maxLines', 'Post must be less than 25 lines', value => {
    return value.split(/\r\n|\r|\n/).length <= 25;
  });

// Validator must square with the network_security_config.xml in effect for the particular build.
const productionUrlValidation = Yup.string()
  .required('Server URL cannot be empty.')
  .lowercase('Lower-case only.')
  .url('Must be valid URL (including scheme prefix).')
  .test({
    name: 'startsWithHttps',
    message: 'Server URL must be secure (HTTPS).',
    test: value => {
      return value.startsWith('https');
    },
  })
  .strict();

const developmentUrlValidation = Yup.string()
  .required('Server URL cannot be empty.')
  .lowercase('Lower-case only.')
  .url('Must be valid URL (including scheme prefix).')
  .strict();

export const ServerURLValidation = __DEV__ ? developmentUrlValidation : productionUrlValidation;
