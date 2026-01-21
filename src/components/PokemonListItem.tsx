import { Ionicons } from "@expo/vector-icons";
import { getPokemonId, getPokemonSpriteUrl } from "@/src/lib/pokeapi";
import type { Pokemon } from "@/src/types/pokemon";
import { Href, useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PokemonListItemProps {
  pokemon: Pokemon;
  isFavorite: boolean;
}

export function PokemonListItem({ pokemon, isFavorite }: PokemonListItemProps) {
  const router = useRouter();
  const id = getPokemonId(pokemon.url);
  const spriteUrl = getPokemonSpriteUrl(id);

  return (
    <TouchableOpacity
      style={[styles.item, isFavorite && styles.favoriteItem]}
      onPress={() => router.push(`/pokedex/${id}` as Href)}
    >
      <Image source={{ uri: spriteUrl }} style={styles.sprite} />
      <Text style={styles.name}>
        #{id} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
      </Text>
      {isFavorite && (
        <View style={styles.starContainer}>
          <Ionicons name="star" size={20} color="#FFD700" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  favoriteItem: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  starContainer: {
    marginLeft: "auto",
    paddingLeft: 8,
  },
  sprite: {
    width: 50,
    height: 50,
  },
  name: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },
});
