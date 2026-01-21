import { PokemonDetails } from "@/src/components/PokemonDetails";
import { useLocalSearchParams } from "expo-router";

export default function PokemonDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  return <PokemonDetails id={id} showStatsButton={true} />;
}
