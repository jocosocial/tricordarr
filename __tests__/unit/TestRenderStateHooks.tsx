import React from 'react';
import {act, create, ReactTestRenderer} from 'react-test-renderer';

import {useFirstDefined} from '#src/Hooks/useFirstDefined';
import {useLatestRef} from '#src/Hooks/useLatestRef';
import {useStickyTrue} from '#src/Hooks/useStickyTrue';

/**
 * Renders `useHook(props)` in a host component and records every value it returns, so a test can
 * re-render with new props and inspect the latest and all committed results.
 */
const renderHook = <P, R>(useHook: (props: P) => R, initialProps: P) => {
  const results: R[] = [];
  const Host = ({hookProps}: {hookProps: P}) => {
    results.push(useHook(hookProps));
    return null;
  };
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(<Host hookProps={initialProps} />);
  });
  return {
    results,
    latest: () => results[results.length - 1],
    rerender: (props: P) =>
      act(() => {
        renderer.update(<Host hookProps={props} />);
      }),
  };
};

describe('useStickyTrue', () => {
  it('starts false when the condition starts false', () => {
    const hook = renderHook(useStickyTrue, false);
    expect(hook.latest()).toBe(false);
  });

  it('starts true when the condition starts true', () => {
    const hook = renderHook(useStickyTrue, true);
    expect(hook.latest()).toBe(true);
  });

  it('stays true after the condition goes back to false', () => {
    const hook = renderHook(useStickyTrue, false);
    hook.rerender(true);
    expect(hook.latest()).toBe(true);
    hook.rerender(false);
    expect(hook.latest()).toBe(true);
  });
});

describe('useFirstDefined', () => {
  it('is undefined until a value arrives', () => {
    const hook = renderHook(useFirstDefined<number>, undefined);
    expect(hook.latest()).toBeUndefined();
  });

  it('keeps the first defined value when later candidates change', () => {
    const hook = renderHook(useFirstDefined<number>, undefined);
    hook.rerender(3);
    expect(hook.latest()).toBe(3);
    hook.rerender(7);
    expect(hook.latest()).toBe(3);
    hook.rerender(undefined);
    expect(hook.latest()).toBe(3);
  });

  it('keeps 0 as a defined value', () => {
    const hook = renderHook(useFirstDefined<number>, 0);
    hook.rerender(5);
    expect(hook.latest()).toBe(0);
  });
});

describe('useLatestRef', () => {
  it('returns the same ref holding the latest committed value', () => {
    const hook = renderHook(useLatestRef<string>, 'a');
    const first = hook.latest();
    expect(first.current).toBe('a');
    hook.rerender('b');
    expect(hook.latest()).toBe(first);
    expect(first.current).toBe('b');
  });
});
