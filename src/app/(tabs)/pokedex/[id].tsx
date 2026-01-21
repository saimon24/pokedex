import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function PokemonDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Pokemon Details</Text>
      <Text>ID: {id}</Text>
    </View>
  );
}
