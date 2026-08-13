import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="report-item"
        options={{
          title: 'Report',
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'My Page',
        }}
      />
    </Tabs>
  );
}