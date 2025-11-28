import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, // 👈 hides the bottom bar
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          // Title doesn’t matter much since header is hidden
          title: "Lesson Plan",
        }}
      />
    </Tabs>
  );
}
