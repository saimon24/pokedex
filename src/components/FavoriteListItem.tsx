import { getPokemonSpriteUrl } from "@/src/lib/pokeapi";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface FavoriteListItemProps {
  id: number;
  name: string;
  onRemove: (id: number) => void;
}

export function FavoriteListItem({ id, name, onRemove }: FavoriteListItemProps) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/pokemon-details-modal?id=${id}` as Href)}
    >
      <Image
        source={{ uri: getPokemonSpriteUrl(id.toString()) }}
        style={styles.sprite}
      />
      <View style={styles.info}>
        <Text style={styles.pokemonId}>#{String(id).padStart(3, "0")}</Text>
        <Text style={styles.pokemonName}>
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </Text>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        hitSlop={10}
        style={styles.removeButton}
      >
        <Ionicons name="heart" size={24} color="#E3350D" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.primary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  sprite: {
    width: 60,
    height: 60,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  pokemonId: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
});
