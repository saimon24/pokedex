import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="pokemon-stats-modal"
        options={{
          presentation: "formSheet",
          headerShown: false,
          sheetAllowedDetents: [0.3, 0.75, 1],
          sheetGrabberVisible: false,
          sheetCornerRadius: 24,
        }}
      />
      <Stack.Screen
        name="pokemon-details-modal"
        options={{
          presentation: "transparentModal",
          headerShown: false,
          animation: "fade",
        }}
      />
    </Stack>
  );
}
