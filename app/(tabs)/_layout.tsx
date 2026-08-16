import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="my_page"
        options={{
          title: 'My Page',
        }}
      />
      <Tabs.Screen
        name="report-item"
        options={{
          title: 'Report',
        }}
      />
    </Tabs>
  );
}