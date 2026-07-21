import * as React from 'react';

import {AppDrawer} from '#src/Components/Drawers/AppDrawer';

let mockHasTwitarrTeam = false;
let mockHasShutternautManager = false;

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({addListener: jest.fn()}),
}));

jest.mock('react-native', () => ({
  Linking: {openURL: jest.fn()},
  ScrollView: 'ScrollView',
  StyleSheet: {create: (styles: object) => styles},
}));

jest.mock('react-native-device-info', () => ({getVersion: () => 'test'}));
jest.mock('react-native-drawer-layout', () => ({Drawer: 'Drawer'}));
jest.mock('react-native-paper', () => ({
  Badge: 'Badge',
  Drawer: {Item: 'DrawerItem', Section: 'DrawerSection'},
}));

jest.mock('#src/Context/Contexts/DrawerContext', () => ({
  useDrawer: () => ({drawerOpen: false, setDrawerOpen: jest.fn()}),
}));
jest.mock('#src/Context/Contexts/OobeContext', () => ({useOobe: () => ({oobeCompleted: false})}));
jest.mock('#src/Context/Contexts/PreRegistrationContext', () => ({
  usePreRegistration: () => ({preRegistrationMode: false}),
}));
jest.mock('#src/Context/Contexts/PrivilegeContext', () => ({
  usePrivilege: () => ({hasModerator: false, hasTwitarrTeam: mockHasTwitarrTeam, hasVerified: false}),
}));
jest.mock('#src/Context/Contexts/RoleContext', () => ({
  useRoles: () => ({
    hasShutternaut: false,
    hasShutternautManager: mockHasShutternautManager,
  }),
}));
jest.mock('#src/Context/Contexts/StyleContext', () => ({
  useStyles: () => ({commonStyles: {background: {}, safePaddingVertical: {}}}),
}));
jest.mock('#src/Enums/Icons', () => ({AppIcons: {}}));
jest.mock('#src/Queries/Alert/NotificationQueries', () => ({
  useUserNotificationDataQuery: () => ({data: undefined}),
}));
jest.mock('#src/Queries/User/UserQueries', () => ({
  useUserProfileQuery: () => ({data: undefined}),
}));

const getDrawerLabels = () => {
  const drawer = AppDrawer({children: null});
  const drawerContent = drawer.props.renderDrawerContent();
  const labels: string[] = [];

  const visit = (node: React.ReactNode) => {
    React.Children.forEach(node, child => {
      if (!React.isValidElement<{children?: React.ReactNode; label?: string}>(child)) {
        return;
      }
      if (child.props.label) {
        labels.push(child.props.label);
      }
      visit(child.props.children);
    });
  };

  visit(drawerContent);
  return labels;
};

describe('AppDrawer Shutternaut management access', () => {
  beforeEach(() => {
    mockHasTwitarrTeam = false;
    mockHasShutternautManager = false;
  });

  it('does not offer Manage Shutternauts to TwitarrTeam alone', () => {
    mockHasTwitarrTeam = true;

    expect(getDrawerLabels()).not.toContain('Manage Shutternauts');
  });

  it('continues to offer Manage Shutternauts to Shutternaut Managers', () => {
    mockHasShutternautManager = true;

    expect(getDrawerLabels()).toContain('Manage Shutternauts');
  });
});
