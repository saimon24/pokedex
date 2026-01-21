import { Text, View, Button } from "react-native";
import { router } from "expo-router";

export default function Pokedex() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 20 }}>
      <Text>Pokedex</Text>
      <Button
        title="View Pikachu (#25)"
        onPress={() => router.push({ pathname: "/pokedex/[id]" as const, params: { id: "25" } })}
      />
    </View>
  );
}
