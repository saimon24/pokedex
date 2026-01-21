import { useFavorites } from "@/src/lib/favorites";
import { getPokemonSpriteUrl } from "@/src/lib/pokeapi";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Href, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Favorites() {
  const { favorites, loading, removeFavorite, refresh } = useFavorites();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="heart-outline" size={64} color={colors.text.secondary} />
        <Text style={styles.emptyText}>No favorites yet</Text>
        <Text style={styles.emptySubtext}>
          Tap the heart icon on a Pokemon to add it here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => router.push(`/pokedex/${item.id}` as Href)}
        >
          <Image
            source={{ uri: getPokemonSpriteUrl(item.id.toString()) }}
            style={styles.sprite}
          />
          <View style={styles.info}>
            <Text style={styles.pokemonId}>
              #{String(item.id).padStart(3, "0")}
            </Text>
            <Text style={styles.pokemonName}>
              {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </Text>
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              removeFavorite(item.id);
            }}
            hitSlop={10}
            style={styles.removeButton}
          >
            <Ionicons name="heart" size={24} color="#E3350D" />
          </Pressable>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: "center",
  },
  listContent: {
    padding: 16,
  },
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
