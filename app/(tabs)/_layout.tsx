import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      {/* 1. Left Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <SymbolView name="house.fill" tintColor={color} />
          ),
        }}
      />

      {/* 2. Middle Tab - exact file name match */}
      <Tabs.Screen
        name="report-item"
        options={{
          title: 'Report Item',
          tabBarIcon: ({ color }) => (
            <SymbolView name="plus.circle.fill" tintColor={color} />
          ),
        }}
      />

      {/* 3. Right Tab */}
      <Tabs.Screen
        name="my_page"
        options={{
          title: 'My Page',
          tabBarIcon: ({ color }) => (
            <SymbolView name="person.fill" tintColor={color} />
          ),
        }}
      />
    </Tabs>
  );
}