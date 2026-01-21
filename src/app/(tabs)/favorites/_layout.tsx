import { Stack } from "expo-router";

export default function FavoritesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#E3350D" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Favorites",
          headerLargeTitle: true,
          headerLargeStyle: { backgroundColor: "#E3350D" },
        }}
      />
    </Stack>
  );
}
