import * as React from 'react';
import {Drawer} from 'react-native-drawer-layout';
import {Drawer as PaperDrawer} from 'react-native-paper';
import {useDrawer} from '../Context/Contexts/DrawerContext';
import {PropsWithChildren} from 'react';

export const AppDrawer = ({children}: PropsWithChildren) => {
  const {drawerOpen, setDrawerOpen} = useDrawer();

  return (
    <Drawer
      open={drawerOpen}
      onOpen={() => setDrawerOpen(true)}
      onClose={() => setDrawerOpen(false)}
      renderDrawerContent={() => {
        return (
          <PaperDrawer.Section title="Some title">
            <PaperDrawer.Item
              label="First Item"
              active={true}
              onPress={() => console.log('first')}
            />
            <PaperDrawer.Item
              label="Second Item"
              active={false}
              onPress={() => console.log('second')}
            />
          </PaperDrawer.Section>
        );
      }}>
      {children}
    </Drawer>
  );
};
