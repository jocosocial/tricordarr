import * as React from 'react';
import {act, create, ReactTestRenderer} from 'react-test-renderer';

import {ContentPostForm} from '#src/Components/Forms/ContentPostForm';
import {PostContentData} from '#src/Structs/ControllerStructs';

/**
 * Regression coverage for #533 ("Forum/Fez Posting Stopped Spinning Too Early").
 *
 * ContentPostForm's internal submit wrapper is async, so Formik owns isSubmitting and clears it
 * when the promise the wrapper returns resolves. If that wrapper does not await the caller's
 * onSubmit, the promise resolves a microtask after the mutation is merely fired, the submit
 * button re-enables mid-request, and a user on a laggy connection taps again and duplicates the
 * post. These tests assert the button stays disabled for the full lifetime of onSubmit.
 */

// Captures the props SubmitIconButton is rendered with, so the test can drive onPress and read
// back the submitting/disabled state without needing a real RN host tree.
let submitButtonProps: {onPress: () => void; submitting?: boolean; disabled?: boolean};

jest.mock('#src/Components/Buttons/IconButtons/SubmitIconButton', () => ({
  SubmitIconButton: (props: typeof submitButtonProps) => {
    submitButtonProps = props;
    return null;
  },
}));

jest.mock('react-native', () => ({
  ScrollView: 'ScrollView',
  StyleSheet: {create: (styles: object) => styles},
  View: 'View',
}));
jest.mock('react-native-paper', () => ({IconButton: 'IconButton'}));

jest.mock('#src/Components/Forms/Fields/EmojiPickerField', () => ({EmojiPickerField: () => null}));
// The provider must pass its children through: the submit button this test drives lives inside it.
jest.mock('#src/Components/Forms/Fields/MentionTextField', () => ({
  MentionTextFieldProvider: ({children}: {children: React.ReactNode}) => children,
  MentionTextFieldSuggestions: () => null,
  MentionTextField: () => null,
}));
jest.mock('#src/Components/Views/Content/ContentInsertMenuView', () => ({ContentInsertMenuView: () => null}));
jest.mock('#src/Components/Views/Content/ContentInsertPhotosView', () => ({ContentInsertPhotosView: () => null}));
jest.mock('#src/Components/Views/Content/ContentPostLengthView', () => ({ContentPostLengthView: () => null}));

jest.mock('#src/Context/Contexts/ConfigContext', () => ({
  useConfig: () => ({appConfig: {userPreferences: {autosavePhotos: false}}}),
}));
jest.mock('#src/Context/Contexts/ElevationContext', () => ({useElevation: () => ({asPrivilegedUser: undefined})}));
jest.mock('#src/Context/Contexts/StyleContext', () => ({useStyles: () => ({commonStyles: {}})}));
jest.mock('#src/Enums/Icons', () => ({AppIcons: {}}));
jest.mock('#src/Libraries/Logger', () => ({
  createLogger: () => ({debug: jest.fn(), info: jest.fn(), error: jest.fn()}),
}));
jest.mock('#src/Libraries/Storage/ImageStorage', () => ({saveImageQueryToLocal: jest.fn()}));
jest.mock('#src/Types', () => ({ImageQueryData: {fromData: jest.fn()}}));

const initialValues: PostContentData = {
  text: 'a post worth keeping',
  images: [],
  postAsModerator: false,
  postAsTwitarrTeam: false,
};

/** Lets the test hold onSubmit open, standing in for an in-flight network request. */
const createDeferred = () => {
  let resolve: () => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {promise, resolve, reject};
};

// Formik validates with Yup before invoking onSubmit, so state settles over several microtasks.
const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
};

const renderForm = (onSubmit: () => Promise<void>) => {
  let renderer: ReactTestRenderer;
  act(() => {
    renderer = create(<ContentPostForm onSubmit={onSubmit} initialValues={initialValues} enablePhotos={false} />);
  });
  // @ts-expect-error assigned inside act
  return renderer;
};

describe('ContentPostForm submit button in-flight state', () => {
  it('keeps the submit button disabled until the submit promise resolves', async () => {
    const deferred = createDeferred();
    const onSubmit = jest.fn(() => deferred.promise);
    renderForm(onSubmit);

    expect(submitButtonProps.submitting).toBe(false);

    act(() => {
      submitButtonProps.onPress();
    });
    await flush();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    // The core of #533: this was false while the request was still in flight.
    expect(submitButtonProps.submitting).toBe(true);
    expect(submitButtonProps.disabled || submitButtonProps.submitting).toBe(true);

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    await flush();

    expect(submitButtonProps.submitting).toBe(false);
  });

  it('re-enables the submit button when the submit promise rejects', async () => {
    // Formik warns about the unhandled rejection. That warning is the point: screens must catch
    // their own mutation errors (see the try/catch in ForumThreadScreenBase, FezChatScreen, etc).
    // Here we deliberately don't, to prove Formik still clears isSubmitting.
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const deferred = createDeferred();
    const onSubmit = jest.fn(() => deferred.promise);
    renderForm(onSubmit);

    act(() => {
      submitButtonProps.onPress();
    });
    await flush();

    expect(submitButtonProps.submitting).toBe(true);

    await act(async () => {
      deferred.reject(new Error('network is having a day'));
      await deferred.promise.catch(() => {});
    });
    await flush();

    // A stuck spinner is its own bug: the user can never retry a genuinely failed post.
    expect(submitButtonProps.submitting).toBe(false);
    warnSpy.mockRestore();
  });
});
