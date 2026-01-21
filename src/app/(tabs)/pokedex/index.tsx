import { PokemonListItem } from "@/src/components/PokemonListItem";
import { useFavorites } from "@/src/lib/favorites";
import { fetchPokemonList, getPokemonId } from "@/src/lib/pokeapi";
import type { Pokemon } from "@/src/types/pokemon";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const TOTAL_POKEMON = 150;

export default function Pokedex() {
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
    return (
      <PokemonListItem pokemon={item} isFavorite={isFavorite(Number(id))} />
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
    <FlatList
      data={filteredPokemon}
      renderItem={renderItem}
      keyExtractor={(item) => item.name}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View>
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
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>No Pokémon found</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#333",
  },
  subtitle: {
    fontSize: 15,
    color: "#999",
    marginTop: 4,
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 20,
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
