import { Stack } from "expo-router";

export default function PokedexLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Pokedex" }} />
      <Stack.Screen name="[id]" options={{ title: "Details" }} />
    </Stack>
  );
}
