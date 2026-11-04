import React, {useContext} from 'react';
import {act, create, ReactTestRenderer} from 'react-test-renderer';

import {LfgFilterContext} from '#src/Context/Contexts/LfgFilterContext';
import {LfgFilterProvider} from '#src/Context/Providers/LfgFilterProvider';
import {LfgListSource} from '#src/Types';

let mockPreRegistrationMode = false;

jest.mock('#src/Context/Contexts/ConfigContext', () => ({
  useConfig: () => ({appConfig: {schedule: {hidePastLfgs: false}}}),
}));
jest.mock('#src/Context/Contexts/PreRegistrationContext', () => ({
  usePreRegistration: () => ({preRegistrationMode: mockPreRegistrationMode}),
}));

describe('LfgFilterProvider source', () => {
  let renderedSources: LfgListSource[];
  let setSource: (source: LfgListSource) => void;

  const Consumer = () => {
    const {lfgSourceFilter, setLfgSourceFilter} = useContext(LfgFilterContext)!;
    renderedSources.push(lfgSourceFilter);
    setSource = setLfgSourceFilter;
    return null;
  };

  const tree = () => (
    <LfgFilterProvider>
      <Consumer />
    </LfgFilterProvider>
  );

  const render = () => {
    let renderer!: ReactTestRenderer;
    act(() => {
      renderer = create(tree());
    });
    return renderer;
  };

  const rerenderWithMode = (renderer: ReactTestRenderer, preRegistrationMode: boolean) => {
    mockPreRegistrationMode = preRegistrationMode;
    act(() => {
      renderer.update(tree());
    });
  };

  const currentSource = () => renderedSources[renderedSources.length - 1];

  beforeEach(() => {
    renderedSources = [];
    mockPreRegistrationMode = false;
  });

  it('starts on Find outside pre-registration mode', () => {
    render();
    expect(renderedSources[0]).toBe('open');
  });

  it('starts on Owned in pre-registration mode, from the very first render', () => {
    mockPreRegistrationMode = true;
    render();
    expect(renderedSources).not.toContain('open');
    expect(currentSource()).toBe('owner');
  });

  it('keeps a selection when re-rendering with the mode unchanged', () => {
    const renderer = render();
    act(() => setSource('joined'));
    rerenderWithMode(renderer, false);
    expect(currentSource()).toBe('joined');
  });

  it('moves onto Owned when pre-registration mode turns on', () => {
    const renderer = render();
    act(() => setSource('joined'));
    rerenderWithMode(renderer, true);
    expect(currentSource()).toBe('owner');
  });

  it('moves onto Find when pre-registration mode turns off', () => {
    mockPreRegistrationMode = true;
    const renderer = render();
    rerenderWithMode(renderer, false);
    expect(currentSource()).toBe('open');
  });

  it('holds on Owned whatever is requested in pre-registration mode', () => {
    mockPreRegistrationMode = true;
    render();
    act(() => setSource('open'));
    expect(currentSource()).toBe('owner');
  });
});
