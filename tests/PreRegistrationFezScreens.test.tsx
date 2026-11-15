import {AxiosError} from 'axios';
import React from 'react';
import {act, create, ReactTestRenderer} from 'react-test-renderer';

import {LfgScreen} from '#src/Screens/LFG/LfgScreen';
import {PersonalEventScreen} from '#src/Screens/PersonalEvent/PersonalEventScreen';

// The real screens pull in @react-navigation/native (ESM), which this project's Jest config doesn't
// transform, so everything around their pre-registration 404 logic is stubbed.
const mockSetOptions = jest.fn();
let mockPreRegistrationMode = true;
let mockFezData: {data?: object; error: AxiosError | null};

jest.mock('@react-navigation/native', () => ({useIsFocused: () => true}));
jest.mock('react-navigation-header-buttons', () => ({Item: () => null}));
jest.mock('#src/Components/Buttons/HeaderButtons/HeaderEditButton', () => ({HeaderEditButton: () => null}));
jest.mock('#src/Components/Buttons/MaterialHeaderButtons', () => ({MaterialHeaderButtons: () => null}));
jest.mock('#src/Components/Menus/LFG/LfgScreenActionsMenu', () => ({LfgScreenActionsMenu: () => null}));
jest.mock('#src/Components/Menus/PersonalEvents/PersonalEventScreenActionsMenu', () => ({
  PersonalEventScreenActionsMenu: () => null,
}));
jest.mock('#src/Components/Text/NavHeaderTitle', () => ({NavHeaderTitle: () => null}));
jest.mock('#src/Components/Views/Static/PreRegistrationView', () => ({
  // Stands in for the real view's only relevant behavior: setting the help button from an effect.
  PreRegistrationView: ({helpScreen}: {helpScreen: string}) => {
    jest.requireActual('react').useEffect(() => {
      mockSetOptions({headerRight: `help:${helpScreen}`});
    }, [helpScreen]);
    return 'PreRegistrationView';
  },
}));
jest.mock('#src/Context/Contexts/PreRegistrationContext', () => ({
  usePreRegistration: () => ({preRegistrationMode: mockPreRegistrationMode}),
}));
jest.mock('#src/Context/Contexts/PrivilegeContext', () => ({usePrivilege: () => ({hasModerator: false})}));
jest.mock('#src/Context/Contexts/SocketContext', () => ({useSocket: () => ({})}));
jest.mock('#src/Enums/AppFeatures', () => ({SwiftarrFeature: {}}));
jest.mock('#src/Enums/FezType', () => ({FezType: {privateEvent: 'privateEvent'}}));
jest.mock('#src/Enums/Icons', () => ({AppIcons: {}}));
jest.mock('#src/Hooks/Fez/useFezData', () => ({
  useFezData: () => ({
    fezData: mockFezData.data,
    error: mockFezData.error,
    refetch: jest.fn(),
    resetInitialReadCount: jest.fn(),
  }),
  useMarkFezReadEffect: () => {},
}));
jest.mock('#src/Hooks/useRefresh', () => ({useRefresh: () => ({refreshing: false, onRefresh: jest.fn()})}));
jest.mock('#src/Libraries/Navigation', () => ({openFezChatScreen: jest.fn()}));
jest.mock('#src/Navigation/Stacks/Common/CommonStackComponents', () => ({
  CommonStackComponents: {lfgHelpScreen: 'lfgHelp', scheduleHelpScreen: 'scheduleHelp'},
}));
jest.mock('#src/Screens/Checkpoint/DisabledFeatureScreen', () => ({
  DisabledFeatureScreen: ({children}: React.PropsWithChildren) => children,
}));
jest.mock('#src/Screens/Checkpoint/PreRegistrationScreen', () => ({
  PreRegistrationScreen: ({children}: React.PropsWithChildren) => children,
}));
jest.mock('#src/Screens/Schedule/ScheduleItemScreenBase', () => ({ScheduleItemScreenBase: () => 'ScheduleItem'}));

function httpError(status?: number): AxiosError {
  const error = new AxiosError('Request failed');
  error.isAxiosError = true;
  if (status !== undefined) {
    error.response = {status} as AxiosError['response'];
  }
  return error;
}

/**
 * Replays the setOptions calls in order, merging like React Navigation does, to get the header
 * the user ends up with.
 */
function finalOptions() {
  return mockSetOptions.mock.calls.reduce((merged, [options]) => ({...merged, ...options}), {});
}

const navigation = {setOptions: mockSetOptions, push: jest.fn()};

describe.each([
  ['LfgScreen', LfgScreen, {fezID: 'fez-1'}, 'help:lfgHelp'],
  ['PersonalEventScreen', PersonalEventScreen, {eventID: 'fez-1'}, 'help:scheduleHelp'],
])('%s', (_name, Screen, params, helpButton) => {
  const element = () => {
    const ScreenComponent = Screen as React.ComponentType<any>;
    return <ScreenComponent navigation={navigation} route={{params}} />;
  };

  const render = () => {
    let renderer!: ReactTestRenderer;
    act(() => {
      renderer = create(element());
    });
    return renderer;
  };

  const rerender = (renderer: ReactTestRenderer) => {
    act(() => {
      renderer.update(element());
    });
  };

  beforeEach(() => {
    mockSetOptions.mockClear();
    mockPreRegistrationMode = true;
    mockFezData = {error: null};
  });

  it('shows the PreRegistrationView and keeps its help button when the 404 is there on mount', () => {
    mockFezData = {error: httpError(404)};
    const renderer = render();
    expect(renderer.toJSON()).toBe('PreRegistrationView');
    expect(finalOptions().headerRight).toBe(helpButton);
  });

  it('keeps the help button when the 404 arrives after loading', () => {
    const renderer = render();
    expect(renderer.toJSON()).toBe('ScheduleItem');
    expect(finalOptions().headerRight).toEqual(expect.any(Function));

    mockFezData = {error: httpError(404)};
    rerender(renderer);
    expect(renderer.toJSON()).toBe('PreRegistrationView');
    expect(finalOptions().headerRight).toBe(helpButton);
  });

  it('restores the screen and its header buttons when the error clears', () => {
    mockFezData = {error: httpError(404)};
    const renderer = render();

    mockFezData = {error: null};
    rerender(renderer);
    expect(renderer.toJSON()).toBe('ScheduleItem');
    expect(finalOptions().headerRight).toEqual(expect.any(Function));
  });

  it.each([[403], [500], [undefined]])('keeps the screen for a failure with status %s', status => {
    mockFezData = {error: httpError(status)};
    const renderer = render();
    expect(renderer.toJSON()).toBe('ScheduleItem');
    expect(finalOptions().headerRight).toEqual(expect.any(Function));
  });

  it('keeps the screen for a 404 outside pre-registration mode', () => {
    mockPreRegistrationMode = false;
    mockFezData = {error: httpError(404)};
    const renderer = render();
    expect(renderer.toJSON()).toBe('ScheduleItem');
    expect(finalOptions().headerRight).toEqual(expect.any(Function));
  });

  it('keeps the screen for a 404 on a background refetch of data already in hand', () => {
    mockFezData = {data: {fezID: 'fez-1', members: undefined}, error: httpError(404)};
    const renderer = render();
    expect(renderer.toJSON()).toBe('ScheduleItem');
  });
});
