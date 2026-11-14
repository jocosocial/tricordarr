import React from 'react';
import {act, create, ReactTestRenderer} from 'react-test-renderer';

import {FezVisibility} from '#src/Enums/FezVisibility';
import {useFezForm, UseFezFormReturn} from '#src/Hooks/Fez/useFezForm';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {FezFormValues} from '#src/Types/FormValues';

// FezType imports CommonStackComponents, which pulls in @react-navigation/native (ESM), which this
// project's Jest config doesn't transform.
jest.mock('#src/Navigation/Stacks/Common/CommonStackComponents', () => ({CommonStackComponents: {}}));
jest.mock('#src/Context/Contexts/CruiseContext', () => ({
  useCruise: () => ({startDate: new Date(), adjustedCruiseDayToday: 1}),
}));
jest.mock('#src/Libraries/DateTime', () => ({getApparentCruiseDate: () => new Date()}));

const user = {userID: 'user-1', username: 'testuser'} as UserHeader;

const values = (overrides: Partial<FezFormValues>) =>
  ({initialUsers: [], visibility: FezVisibility.private, ...overrides}) as FezFormValues;

describe('useFezForm personalEventRequiresPrivate', () => {
  let hook: UseFezFormReturn;

  const Consumer = () => {
    hook = useFezForm();
    return null;
  };

  const render = () => {
    let renderer!: ReactTestRenderer;
    act(() => {
      renderer = create(<Consumer />);
    });
    return renderer;
  };

  it('is false with no invitees and a non-unlisted visibility', () => {
    render();
    expect(hook.personalEventRequiresPrivate(values({}))).toBe(false);
  });

  it('is true with invitees', () => {
    render();
    expect(hook.personalEventRequiresPrivate(values({initialUsers: [user]}))).toBe(true);
  });

  it('is true when unlisted', () => {
    render();
    expect(hook.personalEventRequiresPrivate(values({visibility: FezVisibility.unlisted}))).toBe(true);
  });

  it('keeps the same reference across renders', () => {
    const renderer = render();
    const first = hook.personalEventRequiresPrivate;
    act(() => {
      renderer.update(<Consumer />);
    });
    expect(hook.personalEventRequiresPrivate).toBe(first);
  });
});
