import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "@/src/lib/favorites";
import {
  fetchPokemonList,
  getPokemonId,
  getPokemonSpriteUrl,
} from "@/src/lib/pokeapi";
import type { Pokemon } from "@/src/types/pokemon";
import { useFocusEffect } from "@react-navigation/native";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TOTAL_POKEMON = 150;

export default function Pokedex() {
  const router = useRouter();
  const { isFavorite, refresh } = useFavorites();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchPokemonList(TOTAL_POKEMON, 0)
      .then((results) => {
        setPokemon(results);
      })
      .catch((err) => {
        setError(err.message || "Failed to load Pokémon");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredPokemon = useMemo(() => {
    if (!debouncedQuery.trim()) return pokemon;
    const query = debouncedQuery.toLowerCase().trim();
    return pokemon.filter((p) => {
      const id = getPokemonId(p.url);
      return p.name.toLowerCase().includes(query) || id.toString().includes(query);
    });
  }, [pokemon, debouncedQuery]);

  const renderItem = ({ item }: { item: Pokemon }) => {
    const id = getPokemonId(item.url);
    const spriteUrl = getPokemonSpriteUrl(id);
    const isFav = isFavorite(Number(id));

    return (
      <TouchableOpacity
        style={[styles.item, isFav && styles.favoriteItem]}
        onPress={() => router.push(`/pokedex/${id}` as Href)}
      >
        <Image source={{ uri: spriteUrl }} style={styles.sprite} />
        <Text style={styles.name}>
          #{id} {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
        </Text>
        {isFav && (
          <View style={styles.starContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or number..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <FlatList
        data={filteredPokemon}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.emptyText}>No Pokémon found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    margin: 16,
    marginBottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  list: {
    padding: 16,
  },
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
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#E3350D",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
